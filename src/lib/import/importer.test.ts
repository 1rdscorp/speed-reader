import { strToU8, zipSync } from 'fflate';
import { describe, expect, it, vi } from 'vitest';
import { createTextImporter } from './importer';
import { ImportError, type ImportFailure } from './types';

const importer = createTextImporter();

function file(name: string, content: string | Uint8Array, type = ''): File {
  return new File([content as BlobPart], name, { type });
}

async function failure(attempt: Promise<unknown>): Promise<ImportFailure | 'no error'> {
  try {
    await attempt;
    return 'no error';
  } catch (error) {
    if (error instanceof ImportError) return error.reason;
    throw error;
  }
}

const ARTICLE = `<!doctype html><html><head><title>On Reading Slowly | The Example Review</title></head><body>
  <header><nav><a href="/">Home</a> <a href="/essays">Essays</a> <a href="/about">About</a></nav></header>
  <article>
    <h1>On Reading Slowly</h1>
    <p>There is a kind of reading that cannot be hurried, and most of us have forgotten how to do it.
    We skim, we scan, we extract. The page becomes a quarry, and we leave with a handful of facts.</p>
    <p>But some books ask for more than that. They ask to be lived in for a while, the way a house is
    lived in, until its rooms become familiar and its light at different hours is known.<sup><a href="#n1">1</a></sup></p>
    <p>This essay is an argument for that second kind of reading, and also an admission that the first
    kind has its uses. Nobody should read a bus timetable the way they read a poem, and nobody should
    read a poem the way they read a bus timetable.</p>
    <p>The trick, as with most things, is knowing which is which before you begin, and being willing to
    change your mind halfway down the page when the text turns out to be something other than it seemed.</p>
  </article>
  <aside><h2>Related</h2><ul><li><a href="/a">Ten productivity hacks</a></li><li><a href="/b">Subscribe now</a></li></ul></aside>
  <footer><p>© The Example Review. All rights reserved.</p></footer>
</body></html>`;

/** A minimal but valid EPUB: mimetype first, a package document, two chapters and a table of contents. */
function epub(
  options: { encrypted?: boolean; extraChapter?: string } = {},
): Uint8Array<ArrayBuffer> {
  const chapter = (title: string, body: string) =>
    strToU8(
      `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title/></head><body><h1>${title}</h1>${body}</body></html>`,
    );
  const archive = zipSync({
    mimetype: [strToU8('application/epub+zip'), { level: 0 }],
    'META-INF/container.xml': strToU8(
      `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/book.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`,
    ),
    ...(options.encrypted && {
      'META-INF/encryption.xml': strToU8(
        `<encryption xmlns="urn:oasis:names:tc:opendocument:xmlns:container" xmlns:enc="http://www.w3.org/2001/04/xmlenc#"><enc:EncryptedData><enc:CipherData><enc:CipherReference URI="OEBPS/text/chapter%201.xhtml"/></enc:CipherData></enc:EncryptedData></encryption>`,
      ),
    }),
    'OEBPS/book.opf': strToU8(
      `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>The Test Book</dc:title></metadata>
       <manifest>
         <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
         <item id="c2" href="text/chapter-2.xhtml" media-type="application/xhtml+xml"/>
         <item id="c1" href="text/chapter%201.xhtml" media-type="application/xhtml+xml"/>
         <item id="notes" href="text/notes.xhtml" media-type="application/xhtml+xml"/>
         <item id="c3" href="text/chapter-3.xhtml" media-type="application/xhtml+xml"/>
         <item id="cover" href="cover.jpg" media-type="image/jpeg"/>
       </manifest>
       <spine><itemref idref="nav"/><itemref idref="c1"/><itemref idref="c2"/><itemref idref="notes" linear="no"/>${options.extraChapter ? '<itemref idref="c3"/>' : ''}</spine></package>`,
    ),
    'OEBPS/nav.xhtml': chapter('Contents', '<nav><ol><li>One</li><li>Two</li></ol></nav>'),
    'OEBPS/text/chapter 1.xhtml': chapter(
      'One',
      '<p>It began on a Tuesday.</p><p>Nobody noticed.</p>',
    ),
    'OEBPS/text/chapter-2.xhtml': chapter('Two', '<p>By Friday it was over.</p>'),
    'OEBPS/text/notes.xhtml': chapter('Notes', '<p>A pop-up note.</p>'),
    ...(options.extraChapter && { 'OEBPS/text/chapter-3.xhtml': strToU8(options.extraChapter) }),
    'OEBPS/cover.jpg': new Uint8Array([0xff, 0xd8, 0xff]),
  });
  return new Uint8Array(archive);
}

describe('importing files', () => {
  it('reads a plain text file, taking the title from its name', async () => {
    expect(await importer.importFile(file('walden_chapter_1.txt', 'I went to the woods.'))).toEqual(
      {
        title: 'walden chapter 1',
        text: 'I went to the woods.',
        source: { kind: 'file', name: 'walden_chapter_1.txt', format: 'txt' },
      },
    );
  });

  it('reads Markdown as prose, not markup', async () => {
    const markdown = `---\ntitle: "Notes on Pace"\ntags: [reading]\n---\n\n# A Heading\n\nSome **bold** text with a [link](https://example.com) and \`code\`.\n\n- first\n- second\n\n> quoted\n`;
    const document = await importer.importFile(file('notes.md', markdown));
    expect(document.title).toBe('Notes on Pace');
    expect(document.text).toBe(
      'A Heading\n\nSome bold text with a link and code.\n\nfirst\n\nsecond\n\nquoted',
    );
    expect(document.source).toEqual({ kind: 'file', name: 'notes.md', format: 'md' });
  });

  it('uses the first heading as a Markdown title when there is no front matter', async () => {
    expect((await importer.importFile(file('x.markdown', '# Real Title\n\nBody.'))).title).toBe(
      'Real Title',
    );
  });

  it('extracts the article from a saved web page', async () => {
    const document = await importer.importFile(file('saved.html', ARTICLE, 'text/html'));
    expect(document.title).toBe('On Reading Slowly');
    expect(document.text).toContain('There is a kind of reading that cannot be hurried');
    expect(document.text).toContain(
      'until its rooms become familiar and its light at different hours is known.',
    );
    expect(document.text).not.toMatch(/productivity hacks|Subscribe|All rights reserved|Essays/);
    expect(document.text).not.toMatch(/known\.\s*1/);
    expect(document.text.split('\n\n').length).toBeGreaterThanOrEqual(4);
  });

  it('reads a short page whole when there is no article to extract', async () => {
    const document = await importer.importFile(
      file('note.htm', '<title>Shopping</title><body><div>Milk, eggs</div><div>Bread</div></body>'),
    );
    expect(document).toMatchObject({ title: 'Shopping', text: 'Milk, eggs\n\nBread' });
  });

  it('reads an EPUB in spine order, skipping the contents page and non-linear items', async () => {
    const document = await importer.importFile(file('book.epub', epub()));
    expect(document).toEqual({
      title: 'The Test Book',
      text: 'One\n\nIt began on a Tuesday.\n\nNobody noticed.\n\nTwo\n\nBy Friday it was over.',
      source: { kind: 'file', name: 'book.epub', format: 'epub' },
    });
  });

  it('reads EPUB chapters that are not well-formed XML', async () => {
    const sloppy = `<html xmlns="http://www.w3.org/1999/xhtml"><head><title/><script src="x.js"/></head><body><a id="start"/><h1>Three</h1><p>A line break<br> and a bare ampersand & survive.</p><div class="rule"/><p>So does this.</p></body></html>`;
    const document = await importer.importFile(file('sloppy.epub', epub({ extraChapter: sloppy })));
    expect(document.text).toContain(
      'By Friday it was over.\n\nThree\n\nA line break and a bare ampersand & survive.\n\nSo does this.',
    );
  });

  it('recognises a file by its content when the name is no help', async () => {
    expect((await importer.importFile(file('download', epub()))).source).toMatchObject({
      format: 'epub',
    });
    expect(
      (await importer.importFile(file('page', '<p>Hello there.</p>', 'text/html'))).source,
    ).toMatchObject({
      format: 'html',
    });
  });

  it('explains what went wrong', async () => {
    expect(await failure(importer.importFile(file('photo.jpg', 'x', 'image/jpeg')))).toBe(
      'unsupported',
    );
    expect(
      await failure(
        importer.importFile(file('report.docx', zipSync({ 'word/document.xml': strToU8('<w/>') }))),
      ),
    ).toBe('unsupported');
    expect(await failure(importer.importFile(file('blank.txt', ' \n\n ... \n')))).toBe('empty');
    expect(await failure(importer.importFile(file('broken.epub', 'not a zip at all')))).toBe(
      'unreadable',
    );
    expect(await failure(importer.importFile(file('locked.epub', epub({ encrypted: true }))))).toBe(
      'protected',
    );
    const huge = file('huge.txt', 'x');
    Object.defineProperty(huge, 'size', { value: 51 * 1024 * 1024 });
    expect(await failure(importer.importFile(huge))).toBe('too-large');
  });
});

describe('importing from a link', () => {
  function withEndpoint(respond: (target: string) => Response) {
    const fetch = vi.fn(async (input: RequestInfo | URL) => {
      const requested = new URL(String(input), 'http://app.test');
      return respond(requested.searchParams.get('url') ?? '');
    });
    return { fetch, importer: createTextImporter({ pageEndpoint: '/api/page', fetch }) };
  }

  it('is switched off without a page endpoint', () => {
    expect(importer.importUrl).toBeUndefined();
  });

  it('fetches the page through the endpoint and extracts the article', async () => {
    const { fetch, importer } = withEndpoint(
      () =>
        new Response(ARTICLE, {
          headers: {
            'x-upstream-content-type': 'text/html; charset=utf-8',
            'x-final-url': 'https://example.com/essays/on-reading-slowly',
          },
        }),
    );
    const document = await importer.importUrl!('  example.com/r/123 ');
    expect(fetch).toHaveBeenCalledWith('/api/page?url=https%3A%2F%2Fexample.com%2Fr%2F123');
    expect(document.title).toContain('On Reading Slowly');
    expect(document.text).toContain('There is a kind of reading');
    expect(document.source).toEqual({
      kind: 'url',
      url: 'https://example.com/essays/on-reading-slowly',
    });
  });

  it('reads whatever the link points at, not only web pages', async () => {
    const { importer } = withEndpoint(
      () =>
        new Response(epub(), { headers: { 'x-upstream-content-type': 'application/epub+zip' } }),
    );
    const document = await importer.importUrl!('https://books.example/get/42');
    expect(document.title).toBe('The Test Book');

    const plain = withEndpoint(
      () => new Response('Plain words.', { headers: { 'x-upstream-content-type': 'text/plain' } }),
    );
    expect(await plain.importer.importUrl!('https://example.com/files/a%20poem.txt')).toMatchObject(
      {
        title: 'a poem',
        text: 'Plain words.',
      },
    );
  });

  it('rejects things that are not web addresses without asking the endpoint', async () => {
    const { fetch, importer } = withEndpoint(() => new Response(''));
    for (const address of [
      '',
      'not a link',
      'ftp://example.com/file',
      'javascript:alert(1)',
      'localhost',
    ]) {
      expect(await failure(importer.importUrl!(address))).toBe('bad-address');
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it('translates endpoint errors', async () => {
    const respondWith = (status: number, error: string) =>
      withEndpoint(() => Response.json({ error }, { status })).importer.importUrl!(
        'https://example.com/x',
      );
    expect(await failure(respondWith(502, 'upstream-status'))).toBe('refused');
    expect(await failure(respondWith(415, 'unsupported-type'))).toBe('unsupported');
    expect(await failure(respondWith(413, 'too-large'))).toBe('too-large');
    expect(await failure(respondWith(400, 'forbidden-target'))).toBe('bad-address');
    expect(await failure(respondWith(504, 'timeout'))).toBe('fetch-failed');

    const offline = createTextImporter({
      pageEndpoint: '/api/page',
      fetch: () => Promise.reject(new TypeError('Failed to fetch')),
    });
    expect(await failure(offline.importUrl!('https://example.com/x'))).toBe('fetch-failed');
  });
});
