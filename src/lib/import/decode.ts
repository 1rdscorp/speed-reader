function tryDecode(bytes: Uint8Array, encoding: string): string | undefined {
  try {
    return new TextDecoder(encoding, { fatal: true }).decode(bytes);
  } catch {
    return undefined; // unknown label, or bytes that are not valid in it
  }
}

const HEADER_CHARSET = /charset\s*=\s*["']?([\w.:-]+)/i;
// <?xml … encoding="…"?>, <meta charset="…">, <meta http-equiv … content="…; charset=…">
const MARKUP_CHARSET =
  /<\?xml[^>]*\bencoding\s*=\s*["']([\w.:-]+)|<meta[^>]*\bcharset\s*=\s*["']?([\w.:-]+)/i;

/**
 * Decode text of unknown encoding: the declared charset if there is one, a
 * byte-order mark if present, then UTF-8, and finally Windows-1252, which is
 * what older text files and pages that fail as UTF-8 almost always are.
 */
export function decodeText(bytes: Uint8Array, contentType = ''): string {
  const declared = HEADER_CHARSET.exec(contentType)?.[1];
  const [first, second] = bytes;
  const fromMark =
    first === 0xff && second === 0xfe
      ? 'utf-16le'
      : first === 0xfe && second === 0xff
        ? 'utf-16be'
        : undefined;
  return (
    (declared && tryDecode(bytes, declared)) ??
    (fromMark && tryDecode(bytes, fromMark)) ??
    tryDecode(bytes, 'utf-8') ??
    new TextDecoder('windows-1252').decode(bytes)
  );
}

/** Like `decodeText`, but also honours an encoding declared inside HTML or XML. */
export function decodeMarkup(bytes: Uint8Array, contentType = ''): string {
  if (HEADER_CHARSET.test(contentType)) return decodeText(bytes, contentType);
  // Declarations are ASCII and sit near the top, so a rough decode of the start is enough to find one.
  const head = new TextDecoder('windows-1252').decode(bytes.subarray(0, 2048));
  const match = MARKUP_CHARSET.exec(head);
  const declared = match?.[1] ?? match?.[2];
  return decodeText(bytes, declared ? `charset=${declared}` : '');
}
