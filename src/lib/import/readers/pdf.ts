import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { assemblePdfText, type PdfTextItem } from '../pdfText';
import { ImportError, type FormatReader } from '../types';

GlobalWorkerOptions.workerSrc = workerUrl;

/** Titles left behind by the program that made the PDF, rather than chosen by its author. */
const JUNK_TITLE = /^untitled|^microsoft word|\.(?:docx?|pdf|indd|tex|dvi|pages|rtf|qxd)$/i;

export const readPdf: FormatReader = async (input) => {
  const loading = getDocument({ data: input.bytes });
  try {
    const pdf = await loading.promise.catch((cause: unknown) => {
      const name = cause instanceof Error ? cause.name : '';
      throw new ImportError(name === 'PasswordException' ? 'protected' : 'unreadable', { cause });
    });

    const pages: PdfTextItem[][] = [];
    for (let number = 1; number <= pdf.numPages; number += 1) {
      const page = await pdf.getPage(number);
      const content = await page.getTextContent();
      pages.push(
        content.items.flatMap((item) =>
          'str' in item
            ? [
                {
                  text: item.str,
                  x: Number(item.transform[4]),
                  y: Number(item.transform[5]),
                  height: item.height,
                  endsLine: item.hasEOL,
                },
              ]
            : [],
        ),
      );
      page.cleanup();
    }

    const text = assemblePdfText(pages);
    // Scanned documents are pictures of pages: valid PDFs with nothing to extract.
    if (!/[\p{L}\p{N}]/u.test(text)) throw new ImportError('no-text');

    const metadata = await pdf.getMetadata().catch(() => undefined);
    const title = (metadata?.info as { Title?: unknown } | undefined)?.Title;
    return {
      title:
        typeof title === 'string' && title.trim() && !JUNK_TITLE.test(title.trim())
          ? title.trim()
          : undefined,
      text,
    };
  } finally {
    await loading.destroy();
  }
};
