import { describe, expect, it } from 'vitest';
import { decodeMarkup, decodeText } from './decode';

const bytes = (...values: number[]) => new Uint8Array(values);
const latin1 = (text: string) => Uint8Array.from(text, (char) => char.charCodeAt(0));

describe('decodeText', () => {
  it('reads UTF-8 by default, dropping a byte-order mark', () => {
    expect(decodeText(new TextEncoder().encode('naïve café'))).toBe('naïve café');
    expect(decodeText(bytes(0xef, 0xbb, 0xbf, 0x68, 0x69))).toBe('hi');
  });

  it('falls back to Windows-1252 when the bytes are not valid UTF-8', () => {
    expect(decodeText(bytes(0x63, 0x61, 0x66, 0xe9, 0x20, 0x93, 0x68, 0x69, 0x94))).toBe(
      'café “hi”',
    );
  });

  it('honours a declared charset', () => {
    expect(decodeText(bytes(0xcf, 0xf0, 0xe8), 'text/plain; charset=windows-1251')).toBe('При');
  });

  it('recognises UTF-16 by its byte-order mark', () => {
    expect(decodeText(bytes(0xff, 0xfe, 0x68, 0x00, 0x69, 0x00))).toBe('hi');
  });

  it('ignores a charset label it does not know', () => {
    expect(decodeText(new TextEncoder().encode('fine'), 'text/plain; charset=made-up')).toBe(
      'fine',
    );
  });
});

describe('decodeMarkup', () => {
  it('finds the encoding in a meta tag or XML declaration', () => {
    expect(decodeMarkup(latin1('<meta charset="iso-8859-1"><p>café</p>'))).toContain('café');
    expect(
      decodeMarkup(latin1('<?xml version="1.0" encoding="ISO-8859-1"?><p>café</p>')),
    ).toContain('café');
  });

  it('prefers the charset from the HTTP header', () => {
    const page = new TextEncoder().encode('<meta charset="iso-8859-1"><p>café</p>');
    expect(decodeMarkup(page, 'text/html; charset=utf-8')).toContain('café');
  });
});
