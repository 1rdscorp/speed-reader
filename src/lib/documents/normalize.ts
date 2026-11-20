// Soft hyphens, zero-width spaces and joiners, word joiners, byte-order marks.
// A zero-width joiner is kept when it sits between emoji, where it is part of the character.
const INVISIBLE = /[­​⁠﻿]|(?<!\p{Extended_Pictographic}️?)‍/gu;

/**
 * Tidy text before it is stored: consistent line endings, no invisible
 * characters that would pad words, and no runs of blank lines.
 */
export function normalizeText(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(INVISIBLE, '')
    .replace(/[^\S\n]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
