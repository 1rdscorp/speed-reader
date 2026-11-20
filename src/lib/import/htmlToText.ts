const ELEMENT = 1;
const TEXT = 3;

/** Elements whose content is never part of the running text. */
const SKIPPED = new Set(
  'SCRIPT STYLE NOSCRIPT TEMPLATE HEAD NAV FIGURE SVG MATH IFRAME OBJECT BUTTON SELECT TEXTAREA'.split(
    ' ',
  ),
);
/** Elements that start and end a paragraph. */
const BLOCKS = new Set(
  'P DIV SECTION ARTICLE MAIN HEADER FOOTER ASIDE H1 H2 H3 H4 H5 H6 UL OL LI DL DT DD BLOCKQUOTE PRE TABLE TR HR ADDRESS FIGCAPTION BODY'.split(
    ' ',
  ),
);

/** Footnote and citation markers: a short, linked superscript such as "[3]". */
function isReferenceMark(element: Element): boolean {
  return element.querySelector('a') !== null && (element.textContent ?? '').trim().length <= 6;
}

/**
 * Reduce a DOM tree to readable plain text: one paragraph per block element,
 * separated by blank lines, without navigation, figures, scripts or footnote
 * markers. Works on HTML and XHTML documents alike, and never touches the
 * live page: pass it nodes from a DOMParser document.
 */
export function htmlToText(root: Node): string {
  const paragraphs: string[] = [];
  let current = '';

  const endParagraph = () => {
    // Two line breaks in a row (<br><br>) are a paragraph break; a single one is just a space.
    for (const part of current.split(/\n[^\S\n]*\n\s*/)) {
      const text = part.replace(/\s+/g, ' ').trim();
      if (text) paragraphs.push(text);
    }
    current = '';
  };

  const visit = (node: Node) => {
    if (node.nodeType === TEXT) {
      // Line breaks in the source are formatting, not content.
      current += (node.nodeValue ?? '').replace(/\s+/g, ' ');
      return;
    }
    if (node.nodeType !== ELEMENT) {
      node.childNodes.forEach(visit);
      return;
    }
    const element = node as Element;
    const tag = element.tagName.toUpperCase();
    if (SKIPPED.has(tag)) return;
    if (element.hasAttribute('hidden') || element.getAttribute('aria-hidden') === 'true') return;
    if (tag === 'SUP' && isReferenceMark(element)) return;
    if (tag === 'BR') {
      current += '\n';
      return;
    }

    const isBlock = BLOCKS.has(tag);
    if (isBlock) endParagraph();
    element.childNodes.forEach(visit);
    if (tag === 'TD' || tag === 'TH') current += ' ';
    if (isBlock) endParagraph();
  };

  visit(root);
  endParagraph();
  return paragraphs.join('\n\n');
}
