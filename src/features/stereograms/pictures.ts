import { HIDDEN_WORDS } from '@/lib/stereograms';

/** A built-in stereogram and the word hidden in it. */
export interface BuiltIn {
  word: string;
  /** A finished picture in public/stereograms/. Without one, the picture is drawn here from the word. */
  file?: string;
  /** What kind of ready-made picture it is, shown beside its number. */
  kind?: string;
}

/** Ready-made random-dot pictures: dots-1.png onwards. */
const DOTS = ['HELLO', 'MAGIC', 'SMILE', 'DREAM'];

/** Ready-made textured pictures: textured-05.png onwards, numbered as they were supplied. */
const TEXTURED_FROM = 5;
const TEXTURED = [
  ...['PEACE', 'HAPPY', 'COOL', 'LOVE', 'SUNNY', 'WOW!', 'SPLASH', 'CLASSIC', 'HIDDEN', 'PARTY'],
  ...['GALAXY', 'SHAPES', 'FOREST', 'GLOW', 'SWEET', 'GROOVY', 'HONEY', 'KAPOW', 'BUILD'],
  ...['RUSTIC', 'VIBES', 'FROSTY', 'XOXO', 'WORDS', 'ZIGZAG', 'ROCKS', 'ROBOT', 'ART', 'GAME ON'],
  ...['OCEAN', 'BLAZE', 'FLY HIGH', 'JAZZ', 'PICNIC', 'SKETCH', 'BLOOM', 'WHOA', 'DIVE', 'DIZZY'],
  ...['BRAVO', 'OASIS', 'DISCO', 'WAKE UP', 'AUTUMN', 'FIESTA', 'HAHA'],
];

/**
 * The ready-made pictures. Their file names do not give the words away. To
 * add one, put the picture in public/stereograms/ and add its word to the
 * list it belongs to.
 */
const READY_MADE: BuiltIn[] = [
  ...DOTS.map((word, i) => ({ word, file: `dots-${i + 1}.png`, kind: 'Random dots' })),
  ...TEXTURED.map((word, i) => ({
    word,
    file: `textured-${String(i + TEXTURED_FROM).padStart(2, '0')}.png`,
    kind: 'Textured',
  })),
];

/** Every built-in stereogram, in the order shown: the drawn ones, then the ready-made ones. */
export const BUILT_IN: BuiltIn[] = [...HIDDEN_WORDS.map((word) => ({ word })), ...READY_MADE];

/** Address of a ready-made picture, relative to wherever the site is hosted. */
export const pictureUrl = (file: string) => `${import.meta.env.BASE_URL}stereograms/${file}`;
