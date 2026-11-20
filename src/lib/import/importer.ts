import type { DocumentSource, FileFormat, NewDocument } from '@/lib/documents';
import { ACCEPTED_FILES, detectFormat, readerFor } from './formats';
import { ImportError, type ImportFailure, type ImportInput, type TextImporter } from './types';

/** Files are read into memory whole; past this size that stops being reasonable. */
const MAX_FILE_BYTES = 50 * 1024 * 1024;

/** Error codes from the page endpoint (server/pageProxy.ts), as import failures. */
const ENDPOINT_FAILURES: Record<string, ImportFailure> = {
  'bad-url': 'bad-address',
  'forbidden-target': 'bad-address',
  'unsupported-type': 'unsupported',
  'too-large': 'too-large',
  'upstream-status': 'refused',
};

/** "My_Book-final.epub" → "My Book-final"; "https://site/essays/on-reading" → "on-reading". */
function titleFromName(name: string): string {
  const base = name
    .replace(/\.[a-z0-9]{1,8}$/i, '')
    .replace(/_+/g, ' ')
    .trim();
  return base || 'Untitled';
}

function nameFromUrl(url: URL): string {
  const lastSegment = url.pathname.split('/').findLast(Boolean);
  try {
    return decodeURIComponent(lastSegment ?? url.hostname);
  } catch {
    return lastSegment ?? url.hostname;
  }
}

/** Accept what people actually type: "example.com/essay" as well as full URLs. */
function parseAddress(address: string): URL {
  const trimmed = address.trim();
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  if (!URL.canParse(candidate)) throw new ImportError('bad-address');
  const url = new URL(candidate);
  if (!/^https?:$/.test(url.protocol) || !url.hostname.includes('.') || /\s/.test(trimmed)) {
    throw new ImportError('bad-address');
  }
  return url;
}

async function read(
  input: ImportInput,
  source: (format: FileFormat) => DocumentSource,
  fallbackFormat?: FileFormat,
): Promise<NewDocument> {
  const format = detectFormat(input) ?? fallbackFormat;
  if (!format) throw new ImportError('unsupported');

  const result = await readerFor(format)(input).catch((cause: unknown) => {
    // Whatever a parsing library throws, to the reader it means one thing.
    throw cause instanceof ImportError ? cause : new ImportError('unreadable', { cause });
  });
  if (!/[\p{L}\p{N}]/u.test(result.text)) throw new ImportError('empty');

  return {
    title: result.title?.replace(/\s+/g, ' ').trim() || titleFromName(input.name),
    text: result.text,
    source: source(format),
  };
}

export interface TextImporterOptions {
  /**
   * URL of the page endpoint (see server/pageProxy.ts). Browsers do not let a
   * site read another site's pages, so importing from a link needs this
   * server-side helper; without it, link import is switched off.
   */
  pageEndpoint?: string;
  fetch?: typeof fetch;
}

export function createTextImporter(options: TextImporterOptions = {}): TextImporter {
  const { pageEndpoint } = options;
  const request = options.fetch ?? ((input, init) => fetch(input, init));

  async function importUrl(address: string): Promise<NewDocument> {
    const url = parseAddress(address);
    const response = await request(`${pageEndpoint}?url=${encodeURIComponent(url.href)}`).catch(
      (cause: unknown) => {
        throw new ImportError('fetch-failed', { cause });
      },
    );
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new ImportError(ENDPOINT_FAILURES[body?.error ?? ''] ?? 'fetch-failed');
    }
    // The endpoint reports where redirects ended up and what the site said the content was.
    const finalUrl = new URL(response.headers.get('x-final-url') ?? url.href);
    return read(
      {
        name: nameFromUrl(finalUrl),
        bytes: new Uint8Array(await response.arrayBuffer()),
        contentType: response.headers.get('x-upstream-content-type') ?? '',
      },
      () => ({ kind: 'url', url: finalUrl.href }),
      'html',
    );
  }

  return {
    accept: ACCEPTED_FILES,
    async importFile(file) {
      if (file.size > MAX_FILE_BYTES) throw new ImportError('too-large');
      return read(
        {
          name: file.name,
          bytes: new Uint8Array(await file.arrayBuffer()),
          contentType: file.type,
        },
        (format) => ({ kind: 'file', name: file.name, format }),
      );
    },
    importUrl: pageEndpoint ? importUrl : undefined,
  };
}
