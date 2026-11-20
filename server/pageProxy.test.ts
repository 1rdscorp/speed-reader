// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { handlePageRequest, isPublicAddress, type PageProxyOptions } from './pageProxy.ts';

function ask(target: string, init: { headers?: Record<string, string>; method?: string } = {}) {
  return new Request(`https://reader.example/api/page?url=${encodeURIComponent(target)}`, {
    method: init.method ?? 'GET',
    headers: { 'sec-fetch-site': 'same-origin', ...init.headers },
  });
}

/** A stand-in for the internet: maps URLs to responses and records what was asked. */
function web(pages: Record<string, () => Response>) {
  return vi.fn(async (input: string | URL | Request, _init?: RequestInit) => {
    const page = pages[String(input)];
    if (!page) throw new TypeError('fetch failed');
    return page();
  });
}

const html =
  (body: string, type = 'text/html; charset=utf-8') =>
  () =>
    new Response(body, { headers: { 'content-type': type } });
const redirect = (location: string) => () =>
  new Response(null, { status: 302, headers: { location } });

async function errorOf(response: Response) {
  return `${response.status} ${((await response.json()) as { error: string }).error}`;
}

describe('page endpoint', () => {
  it('returns the page as inert data, with its real type and final address alongside', async () => {
    const fetch = web({ 'https://example.com/essay': html('<p>Hello</p>') });
    const response = await handlePageRequest(ask('https://example.com/essay'), { fetch });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('<p>Hello</p>');
    expect(response.headers.get('x-upstream-content-type')).toBe('text/html; charset=utf-8');
    expect(response.headers.get('x-final-url')).toBe('https://example.com/essay');
    // Nothing fetched may be rendered or run on our origin.
    expect(response.headers.get('content-type')).toBe('application/octet-stream');
    expect(response.headers.get('content-disposition')).toBe('attachment');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('content-security-policy')).toContain('sandbox');
  });

  it('sends no cookies or credentials of the caller upstream', async () => {
    const fetch = web({ 'https://example.com/': html('ok') });
    await handlePageRequest(
      ask('https://example.com/', {
        headers: { cookie: 'session=secret', authorization: 'Bearer x' },
      }),
      { fetch },
    );
    const sent = new Headers(fetch.mock.calls[0]![1]?.headers);
    expect(sent.get('cookie')).toBeNull();
    expect(sent.get('authorization')).toBeNull();
  });

  it('only answers requests from the app itself', async () => {
    const fetch = web({ 'https://example.com/': html('ok') });
    for (const site of ['cross-site', 'same-site', 'none']) {
      const response = await handlePageRequest(
        ask('https://example.com/', { headers: { 'sec-fetch-site': site } }),
        { fetch },
      );
      expect(await errorOf(response)).toBe('403 forbidden');
    }
    const bare = new Request('https://reader.example/api/page?url=https%3A%2F%2Fexample.com%2F');
    expect(await errorOf(await handlePageRequest(bare, { fetch }))).toBe('403 forbidden');
    expect(
      await errorOf(
        await handlePageRequest(ask('https://example.com/', { method: 'POST' }), { fetch }),
      ),
    ).toBe('405 method-not-allowed');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('refuses addresses that are not ordinary public web pages', async () => {
    const fetch = web({});
    const refused = [
      'http://localhost/admin',
      'http://127.0.0.1/',
      'http://2130706433/', // 127.0.0.1 written as a number
      'http://[::1]/',
      'http://169.254.169.254/latest/meta-data/',
      'http://192.168.1.1/',
      'http://printer.local/',
      'http://intranet/',
      'https://db.internal/',
      'https://example.com:8443/',
      'https://user:pass@example.com/',
      'ftp://example.com/file',
      'file:///etc/passwd',
    ];
    for (const target of refused) {
      expect(await errorOf(await handlePageRequest(ask(target), { fetch })), target).toBe(
        '400 forbidden-target',
      );
    }
    expect(await errorOf(await handlePageRequest(ask('not a url'), { fetch }))).toBe('400 bad-url');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('refuses names that resolve into a private network', async () => {
    const fetch = web({ 'https://public.example/': html('ok') });
    const resolve: PageProxyOptions['resolve'] = async (hostname) =>
      hostname === 'sneaky.example' ? ['93.184.216.34', '10.0.0.5'] : ['93.184.216.34'];

    expect(
      await errorOf(await handlePageRequest(ask('https://sneaky.example/'), { fetch, resolve })),
    ).toBe('400 forbidden-target');
    expect(
      (await handlePageRequest(ask('https://public.example/'), { fetch, resolve })).status,
    ).toBe(200);
    // A name that does not exist is a failure to reach the site, not a forbidden request.
    const unresolvable = () => Promise.reject(new Error('ENOTFOUND'));
    const response = await handlePageRequest(ask('https://public.example/'), {
      fetch,
      resolve: unresolvable,
    });
    expect(await errorOf(response)).toBe('502 unreachable');
  });

  it('follows redirects, checking every hop', async () => {
    const fetch = web({
      'http://example.com/old': redirect('https://example.com/new'),
      'https://example.com/new': redirect('/final'),
      'https://example.com/final': html('arrived'),
      'https://example.com/trap': redirect('http://169.254.169.254/'),
      'https://example.com/loop': redirect('https://example.com/loop'),
    });

    const response = await handlePageRequest(ask('http://example.com/old'), { fetch });
    expect(await response.text()).toBe('arrived');
    expect(response.headers.get('x-final-url')).toBe('https://example.com/final');

    expect(await errorOf(await handlePageRequest(ask('https://example.com/trap'), { fetch }))).toBe(
      '400 forbidden-target',
    );
    expect(await errorOf(await handlePageRequest(ask('https://example.com/loop'), { fetch }))).toBe(
      '502 unreachable',
    );
  });

  it('passes on documents only', async () => {
    const fetch = web({
      'https://example.com/book.epub': html('PK…', 'application/epub+zip'),
      'https://example.com/paper.pdf': html('%PDF-', 'application/pdf'),
      'https://example.com/unlabelled': () => new Response('bytes'),
      'https://example.com/photo.jpg': html('…', 'image/jpeg'),
      'https://example.com/app.js': html('…', 'text/javascript'),
    });
    for (const path of ['book.epub', 'paper.pdf', 'unlabelled']) {
      expect(
        (await handlePageRequest(ask(`https://example.com/${path}`), { fetch })).status,
        path,
      ).toBe(200);
    }
    for (const path of ['photo.jpg', 'app.js']) {
      expect(
        await errorOf(await handlePageRequest(ask(`https://example.com/${path}`), { fetch })),
        path,
      ).toBe('415 unsupported-type');
    }
  });

  it('limits how much it will carry', async () => {
    const fetch = web({
      'https://example.com/declared': () =>
        new Response('x', { headers: { 'content-type': 'text/plain', 'content-length': '5000' } }),
      'https://example.com/undeclared': html('x'.repeat(5000), 'text/plain'),
      'https://example.com/small': html('x'.repeat(100), 'text/plain'),
    });
    const options = { fetch, maxBytes: 1000 };
    expect(
      await errorOf(await handlePageRequest(ask('https://example.com/declared'), options)),
    ).toBe('413 too-large');
    expect(
      await errorOf(await handlePageRequest(ask('https://example.com/undeclared'), options)),
    ).toBe('413 too-large');
    expect((await handlePageRequest(ask('https://example.com/small'), options)).status).toBe(200);
  });

  it('reports sites that fail, refuse or stall', async () => {
    const fetch = web({
      'https://example.com/missing': () => new Response('nope', { status: 404 }),
      'https://example.com/paywall': () => new Response('pay', { status: 403 }),
    });
    expect(
      await errorOf(await handlePageRequest(ask('https://example.com/missing'), { fetch })),
    ).toBe('502 upstream-status');
    expect(
      await errorOf(await handlePageRequest(ask('https://example.com/paywall'), { fetch })),
    ).toBe('502 upstream-status');
    expect(await errorOf(await handlePageRequest(ask('https://down.example/'), { fetch }))).toBe(
      '502 unreachable',
    );

    const stalled: typeof globalThis.fetch = (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(init.signal!.reason));
      });
    expect(
      await errorOf(
        await handlePageRequest(ask('https://slow.example/'), { fetch: stalled, timeoutMs: 20 }),
      ),
    ).toBe('504 timeout');
  });
});

describe('isPublicAddress', () => {
  it('tells public addresses from private, loopback and link-local ones', () => {
    for (const address of [
      '93.184.216.34',
      '8.8.8.8',
      '172.32.0.1',
      '2606:2800:220:1:248:1893:25c8:1946',
    ]) {
      expect(isPublicAddress(address), address).toBe(true);
    }
    for (const address of [
      '127.0.0.1',
      '10.1.2.3',
      '172.16.0.1',
      '172.31.255.255',
      '192.168.0.1',
      '169.254.169.254',
      '100.64.0.1',
      '0.0.0.0',
      '224.0.0.1',
      '::1',
      '::',
      'fd00::1',
      'fe80::1',
      '::ffff:10.0.0.1',
    ]) {
      expect(isPublicAddress(address), address).toBe(false);
    }
  });
});
