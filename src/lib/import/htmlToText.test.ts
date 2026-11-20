import { describe, expect, it } from 'vitest';
import { htmlToText } from './htmlToText';

const text = (html: string) => htmlToText(new DOMParser().parseFromString(html, 'text/html').body);

describe('htmlToText', () => {
  it('makes one paragraph per block and collapses source formatting', () => {
    expect(text('<h1>Title</h1>\n<p>First   line\n   wraps.</p><p>Second.</p>')).toBe(
      'Title\n\nFirst line wraps.\n\nSecond.',
    );
  });

  it('keeps inline elements inside their paragraph', () => {
    expect(text('<p>Some <em>stressed</em> and <a href="#">linked</a> words.</p>')).toBe(
      'Some stressed and linked words.',
    );
  });

  it('treats a single line break as a space and a double one as a paragraph break', () => {
    expect(text('<div>one<br>two<br><br>three</div>')).toBe('one two\n\nthree');
  });

  it('separates list items and table rows', () => {
    expect(text('<ul><li>alpha</li><li>beta</li></ul>')).toBe('alpha\n\nbeta');
    expect(text('<table><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></table>')).toBe(
      'a b\n\nc d',
    );
  });

  it('leaves out scripts, navigation, figures and hidden content', () => {
    expect(
      text(`<nav>Home | About</nav><script>alert(1)</script><style>p{}</style>
            <figure><img alt="x"><figcaption>A caption</figcaption></figure>
            <p hidden>secret</p><p aria-hidden="true">decor</p><p>Kept.</p>`),
    ).toBe('Kept.');
  });

  it('drops footnote markers but keeps ordinary superscripts', () => {
    expect(text('<p>A claim.<sup><a href="#fn1">[1]</a></sup> E = mc<sup>2</sup></p>')).toBe(
      'A claim. E = mc2',
    );
  });

  it('reads XHTML documents, whose tag names are lower-case', () => {
    const xhtml = new DOMParser().parseFromString(
      '<html xmlns="http://www.w3.org/1999/xhtml"><head><title/></head><body><p>One</p><p>Two</p></body></html>',
      'application/xhtml+xml',
    );
    expect(htmlToText(xhtml.body)).toBe('One\n\nTwo');
  });
});
