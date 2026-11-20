/**
 * The page endpoint: fetches a web page (or a text, EPUB or PDF file) on
 * behalf of the app, which a browser will not let a site do for itself.
 *
 * Written against the web-standard Request and Response, so the same handler
 * runs in the Vite dev server (see vitePlugin.ts) and on any host with
 * fetch-style functions. It has no dependency on the app.
 *
 * Because it fetches addresses chosen by the caller, it is deliberately
 * narrow: only this site's own pages may call it, only public web addresses
 * are fetched, only document types are returned, and the body is handed back
 * as an inert download so nothing fetched can ever run on this site's origin.
 */

export interface PageProxyOptions {
  fetch?: typeof fetch;
  /** Largest body passed on, in bytes. */
  maxBytes?: number;
  /** Time allowed for the whole exchange with the remote site. */
  timeoutMs?: number;
  /**
   * Look up the addresses a hostname points to, on runtimes that can (Node).
   * When given, names that resolve into a private network are refused.
   */
  resolve?: (hostname: string) => Promise<string[]>;
}

/** Machine-readable failure, returned as `{ "error": code }`. */
export type PageProxyError =
  | 'method-not-allowed'
  | 'forbidden'
  | 'bad-url'
  | 'forbidden-target'
  | 'unreachable'
  | 'timeout'
  | 'upstream-status'
  | 'unsupported-type'
  | 'too-large';

const DEFAULT_MAX_BYTES = 25 * 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 5;

/** What the app can import. `octet-stream` is how many servers label EPUBs; the app checks the bytes. */
const DOCUMENT_TYPES = new Set([
  'text/html',
  'application/xhtml+xml',
  'text/plain',
  'text/markdown',
  'application/pdf',
  'application/epub+zip',
  'application/octet-stream',
]);

const PRIVATE_NAMES = /(?:^|\.)(?:localhost|local|internal|lan|home\.arpa)$/i;

function failure(status: number, error: PageProxyError): Response {
  return Response.json({ error }, { status, headers: { 'cache-control': 'no-store' } });
}

function isPublicIPv4(address: string): boolean {
  const [a = 0, b = 0, c = 0] = address.split('.').map(Number);
  return !(
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    (a === 169 && b === 254) || // link-local, cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

export function isPublicAddress(address: string): boolean {
  if (!address.includes(':')) return isPublicIPv4(address);
  const ip = address.toLowerCase();
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(ip);
  if (mapped) return isPublicIPv4(mapped[1]!);
  // Unspecified and loopback, unique-local (fc00::/7), link-local (fe80::/10).
  return !(ip === '::' || ip === '::1' || /^f[cd]/.test(ip) || /^fe[89ab]/.test(ip));
}

/**
 * Only ordinary public web addresses: no credentials, odd ports, IP literals
 * or local names. Returns the error to report, or nothing if the target is fine.
 */
async function checkTarget(
  url: URL,
  options: PageProxyOptions,
): Promise<PageProxyError | undefined> {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return 'forbidden-target';
  if (url.username || url.password || url.port) return 'forbidden-target';
  const host = url.hostname;
  const isIpLiteral = host.startsWith('[') || /^\d+(?:\.\d+){3}$/.test(host);
  if (isIpLiteral || !host.includes('.') || PRIVATE_NAMES.test(host)) return 'forbidden-target';
  if (!options.resolve) return undefined;

  let addresses: string[];
  try {
    addresses = await options.resolve(host);
  } catch {
    return 'unreachable'; // no such name, or no network: an honest failure, not a forbidden one
  }
  return addresses.length > 0 && addresses.every(isPublicAddress) ? undefined : 'forbidden-target';
}

/** Read a body up to a limit; `undefined` means it was longer. */
async function readLimited(
  response: Response,
  maxBytes: number,
): Promise<Uint8Array<ArrayBuffer> | undefined> {
  if (Number(response.headers.get('content-length') ?? 0) > maxBytes) {
    await response.body?.cancel();
    return undefined;
  }
  const reader = response.body?.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = (await reader?.read()) ?? { done: true, value: undefined };
    if (done || !value) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader?.cancel();
      return undefined;
    }
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

/** Handle `GET <endpoint>?url=<address>`. */
export async function handlePageRequest(
  request: Request,
  options: PageProxyOptions = {},
): Promise<Response> {
  if (request.method !== 'GET') return failure(405, 'method-not-allowed');
  // Browsers state where a request comes from. Only our own pages may use the
  // endpoint: not other sites, and not a link someone was tricked into opening.
  if (request.headers.get('sec-fetch-site') !== 'same-origin') return failure(403, 'forbidden');

  const requested = new URL(request.url).searchParams.get('url') ?? '';
  if (!URL.canParse(requested)) return failure(400, 'bad-url');

  const fetchPage = options.fetch ?? fetch;
  const signal = AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  let target = new URL(requested);
  let upstream: Response | undefined;

  try {
    // Redirects are followed by hand so every hop is checked, not just the first address.
    for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
      const problem = await checkTarget(target, options);
      if (problem) return failure(problem === 'unreachable' ? 502 : 400, problem);
      const response = await fetchPage(target, {
        redirect: 'manual',
        signal,
        headers: {
          accept:
            'text/html,application/xhtml+xml,text/plain,application/pdf,application/epub+zip;q=0.9,*/*;q=0.5',
          'accept-language': request.headers.get('accept-language') ?? 'en',
          'user-agent': 'SpeedReader/1.0 (article import)',
        },
      });
      const location = response.headers.get('location');
      if (
        response.status >= 300 &&
        response.status < 400 &&
        location &&
        URL.canParse(location, target)
      ) {
        await response.body?.cancel();
        target = new URL(location, target);
        continue;
      }
      upstream = response;
      break;
    }
    if (!upstream) return failure(502, 'unreachable'); // too many redirects
    if (!upstream.ok) {
      await upstream.body?.cancel();
      return failure(502, 'upstream-status');
    }

    const contentType = upstream.headers.get('content-type') ?? '';
    const mimeType = contentType.split(';', 1)[0]!.trim().toLowerCase();
    if (mimeType && !DOCUMENT_TYPES.has(mimeType)) {
      await upstream.body?.cancel();
      return failure(415, 'unsupported-type');
    }

    const body = await readLimited(upstream, options.maxBytes ?? DEFAULT_MAX_BYTES);
    if (!body) return failure(413, 'too-large');

    return new Response(body, {
      headers: {
        // Whatever was fetched, the browser must treat it as data: never render or run it here.
        'content-type': 'application/octet-stream',
        'content-disposition': 'attachment',
        'content-security-policy': "sandbox; default-src 'none'",
        'x-content-type-options': 'nosniff',
        'cache-control': 'no-store',
        // What the remote site said it was, and where redirects ended, for the app to interpret.
        'x-upstream-content-type': contentType,
        'x-final-url': target.href,
      },
    });
  } catch (error) {
    const name = error instanceof Error ? error.name : '';
    return name === 'TimeoutError' || name === 'AbortError'
      ? failure(504, 'timeout')
      : failure(502, 'unreachable');
  }
}
