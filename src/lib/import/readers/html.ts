import { Readability } from '@mozilla/readability';
import { decodeMarkup } from '../decode';
import { htmlToText } from '../htmlToText';
import type { FormatReader } from '../types';

/** Below this, assume article extraction missed and the page is not an article at all. */
const MIN_ARTICLE_CHARACTERS = 400;

/**
 * Web pages: keep the article, drop the site around it. Extraction is the
 * same algorithm as Firefox's Reader View. Pages it cannot make sense of
 * (short notes, unusual markup) are read whole instead.
 */
export const readHtml: FormatReader = async (input) => {
  const document = new DOMParser().parseFromString(
    decodeMarkup(input.bytes, input.contentType),
    'text/html',
  );
  const pageTitle = document.title.trim();

  // Readability rewrites the document it is given, so it gets a copy.
  const article = new Readability<Node>(document.cloneNode(true) as Document, {
    serializer: (node) => node,
  }).parse();
  const articleText = article?.content ? htmlToText(article.content) : '';

  return {
    title: headline(document) ?? (article?.title?.trim() || pageTitle || undefined),
    text: articleText.length >= MIN_ARTICLE_CHARACTERS ? articleText : htmlToText(document.body),
  };
};

/**
 * The page's own headline, when it clearly has one: a single <h1> whose text
 * also appears in the page title. That is the article's name without the
 * " | Site Name" that page titles carry.
 */
function headline(document: Document): string | undefined {
  const headings = document.querySelectorAll('h1');
  const text = headings[0]?.textContent?.replace(/\s+/g, ' ').trim();
  return headings.length === 1 && text && document.title.includes(text) ? text : undefined;
}
