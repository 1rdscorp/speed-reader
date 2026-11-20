import { marked } from 'marked';
import { decodeText } from '../decode';
import { htmlToText } from '../htmlToText';
import type { FormatReader } from '../types';

/** A YAML block between --- lines at the very top, as used by static-site generators and note apps. */
const FRONT_MATTER = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;
const FRONT_MATTER_TITLE = /^title:[ \t]*["']?(.+?)["']?[ \t]*$/m;

/**
 * Markdown is rendered to HTML and then flattened like any web page, so every
 * construct (links, emphasis, tables, embedded HTML) is handled by one code path.
 */
export const readMarkdown: FormatReader = async (input) => {
  let source = decodeText(input.bytes, input.contentType);
  let title: string | undefined;

  const frontMatter = FRONT_MATTER.exec(source);
  if (frontMatter) {
    title = FRONT_MATTER_TITLE.exec(frontMatter[1] ?? '')?.[1];
    source = source.slice(frontMatter[0].length);
  }

  const html = await marked.parse(source, { async: true });
  const document = new DOMParser().parseFromString(html, 'text/html');
  title ??= document.querySelector('h1')?.textContent?.trim() || undefined;
  return { title, text: htmlToText(document.body) };
};
