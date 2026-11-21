import { HIDDEN_WORDS } from '@/lib/stereograms';

/** A built-in stereogram and the word hidden in it. */
export interface BuiltIn {
  word: string;
  /** A finished picture in public/stereograms/. Without one, the picture is drawn here from the word. */
  file?: string;
}

/**
 * Ready-made pictures. Their file names do not give the word away. To add
 * one, put the picture in public/stereograms/ and list it here.
 */
const READY_MADE: BuiltIn[] = [
  { word: 'HELLO', file: 'dots-1.png' },
  { word: 'MAGIC', file: 'dots-2.png' },
  { word: 'SMILE', file: 'dots-3.png' },
  { word: 'DREAM', file: 'dots-4.png' },
];

/** Every built-in stereogram, in the order shown: the drawn ones, then the ready-made ones. */
export const BUILT_IN: BuiltIn[] = [...HIDDEN_WORDS.map((word) => ({ word })), ...READY_MADE];

/** Address of a ready-made picture, relative to wherever the site is hosted. */
export const pictureUrl = (file: string) => `${import.meta.env.BASE_URL}stereograms/${file}`;
