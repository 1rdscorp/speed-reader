import { unzipSync } from 'fflate';
import { decodeMarkup } from '../decode';
import { htmlToText } from '../htmlToText';
import { ImportError, type FormatReader } from '../types';

/** The parts of the archive that describe or contain text; images and fonts stay compressed. */
const TEXT_ENTRY = /\.(?:xml|opf|x?html?)$/i;

function parse(bytes: Uint8Array, type: DOMParserSupportedType): Document {
  return new DOMParser().parseFromString(decodeMarkup(bytes), type);
}

function elements(parent: Document | Element, localName: string): Element[] {
  return Array.from(parent.getElementsByTagNameNS('*', localName));
}

/** Resolve a link inside the archive against the file that contains it. */
function resolve(fromPath: string, href: string): string {
  const url = new URL(href, `http://epub/${encodeURI(fromPath)}`);
  return decodeURIComponent(url.pathname.slice(1));
}

/**
 * EPUB: a zip of XHTML chapters plus a package file that lists them in
 * reading order. Chapters are flattened to text and joined.
 */
export const readEpub: FormatReader = async (input) => {
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(input.bytes, { filter: (file) => TEXT_ENTRY.test(file.name) });
  } catch (cause) {
    throw new ImportError('unreadable', { cause });
  }
  const file = (path: string): Uint8Array => {
    const bytes = files[path];
    if (!bytes) throw new ImportError('unreadable');
    return bytes;
  };

  // container.xml points at the package document, which holds the manifest and the reading order.
  const container = parse(file('META-INF/container.xml'), 'application/xml');
  const packagePath = elements(container, 'rootfile')[0]?.getAttribute('full-path');
  if (!packagePath) throw new ImportError('unreadable');
  const packageDocument = parse(file(packagePath), 'application/xml');

  const manifest = new Map<string, { path: string; isNavigation: boolean }>();
  for (const item of elements(packageDocument, 'item')) {
    const id = item.getAttribute('id');
    const href = item.getAttribute('href');
    if (!id || !href) continue;
    manifest.set(id, {
      path: resolve(packagePath, href),
      isNavigation: (item.getAttribute('properties') ?? '').split(/\s+/).includes('nav'),
    });
  }

  const chapters = elements(packageDocument, 'itemref')
    // linear="no" marks material outside the main flow, such as pop-up notes.
    .filter((reference) => reference.getAttribute('linear') !== 'no')
    .map((reference) => manifest.get(reference.getAttribute('idref') ?? ''))
    .filter((item) => item !== undefined)
    // The table of contents is for navigating, not reading.
    .filter((item) => !item.isNavigation);

  // DRM shows up as chapters listed in encryption.xml. (Fonts are often listed there too; that is harmless.)
  const encryption = files['META-INF/encryption.xml'];
  if (encryption) {
    const encrypted = new Set(
      elements(parse(encryption, 'application/xml'), 'CipherReference').map((reference) =>
        resolve('', reference.getAttribute('URI') ?? ''),
      ),
    );
    if (chapters.some((chapter) => encrypted.has(chapter.path))) throw new ImportError('protected');
  }

  const text = chapters
    .map((chapter) => {
      const bytes = files[chapter.path];
      return bytes ? chapterText(bytes) : '';
    })
    .filter(Boolean)
    .join('\n\n');

  const title = elements(packageDocument, 'title')[0]?.textContent?.trim();
  return { title: title || undefined, text };
};

/** Elements HTML allows to have no closing tag; every other "<x/>" must be expanded for an HTML parser. */
const VOID_ELEMENTS = new Set(
  'area base br col embed hr img input link meta source track wbr'.split(' '),
);
const SELF_CLOSING_TAG = /<([a-zA-Z][\w:-]*)((?:\s[^<>]*?)?)\/>/g;

function chapterText(bytes: Uint8Array): string {
  // Chapters are meant to be well-formed XHTML, so try an XML parse first.
  let document = parse(bytes, 'application/xhtml+xml');
  if (document.getElementsByTagName('parsererror').length > 0 || !document.body) {
    // Real-world files are not always well-formed. The HTML parser forgives
    // that, but ignores XML's "<title/>" shorthand: it would treat it as an
    // opening tag and swallow the rest of the chapter. Spell such tags out first.
    const source = decodeMarkup(bytes).replace(
      SELF_CLOSING_TAG,
      (tag, name: string, attributes: string) =>
        VOID_ELEMENTS.has(name.toLowerCase()) ? tag : `<${name}${attributes}></${name}>`,
    );
    document = new DOMParser().parseFromString(source, 'text/html');
  }
  return htmlToText(document.body ?? document.documentElement);
}
