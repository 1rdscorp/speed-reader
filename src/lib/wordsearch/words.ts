export interface Theme {
  name: string;
  /** Words of three to eight capital letters, so any of them fits the smallest grid. */
  words: string[];
}

/** The word lists puzzles are drawn from. A puzzle takes all its words from one theme. */
export const THEMES: Theme[] = [
  {
    name: 'Animals',
    words: [
      ...['TIGER', 'HORSE', 'EAGLE', 'ZEBRA', 'OTTER', 'WHALE', 'PANDA', 'KOALA', 'LLAMA', 'MOUSE'],
      ...['SHEEP', 'GOOSE', 'RABBIT', 'MONKEY', 'DONKEY', 'PARROT', 'TURTLE', 'LIZARD', 'FALCON'],
      ...['BADGER', 'DOLPHIN', 'GIRAFFE', 'PENGUIN', 'HAMSTER'],
    ],
  },
  {
    name: 'Food',
    words: [
      ...['BREAD', 'APPLE', 'LEMON', 'HONEY', 'PASTA', 'SALAD', 'GRAPE', 'MANGO', 'PEACH', 'ONION'],
      ...['CHEESE', 'BUTTER', 'CARROT', 'TOMATO', 'BANANA', 'COOKIE', 'PEPPER', 'CHERRY', 'NOODLE'],
      ...['WAFFLE', 'PANCAKE', 'AVOCADO', 'POPCORN', 'YOGURT'],
    ],
  },
  {
    name: 'Nature',
    words: [
      ...['RIVER', 'OCEAN', 'CLOUD', 'STORM', 'STONE', 'FOREST', 'MEADOW', 'VALLEY', 'ISLAND'],
      ...[
        'DESERT',
        'CANYON',
        'GLACIER',
        'BREEZE',
        'SUNSET',
        'THUNDER',
        'FLOWER',
        'GARDEN',
        'STREAM',
      ],
      ...['JUNGLE', 'VOLCANO', 'RAINBOW', 'PEBBLE', 'LAGOON', 'FROST'],
    ],
  },
  {
    name: 'Space',
    words: [
      ...['PLANET', 'COMET', 'ORBIT', 'ROCKET', 'GALAXY', 'NEBULA', 'SATURN', 'VENUS', 'EARTH'],
      ...['SOLAR', 'LUNAR', 'METEOR', 'COSMOS', 'PLUTO', 'URANUS', 'ECLIPSE', 'GRAVITY', 'JUPITER'],
      ...['MERCURY', 'NEPTUNE', 'CRATER', 'SHUTTLE', 'PROBE', 'QUASAR'],
    ],
  },
  {
    name: 'Reading',
    words: [
      ...['STORY', 'NOVEL', 'AUTHOR', 'READER', 'LETTER', 'CHAPTER', 'LIBRARY', 'PENCIL', 'PAPER'],
      ...['TITLE', 'VERSE', 'INDEX', 'SHELF', 'WRITER', 'FABLE', 'POETRY', 'LEGEND', 'MYSTERY'],
      ...['JOURNAL', 'COMIC', 'ESSAY', 'RHYME', 'PREFACE', 'FICTION'],
    ],
  },
  {
    name: 'Music',
    words: [
      ...['PIANO', 'GUITAR', 'VIOLIN', 'DRUMS', 'FLUTE', 'TEMPO', 'CHORD', 'MELODY', 'RHYTHM'],
      ...['OPERA', 'CHOIR', 'TRUMPET', 'CELLO', 'BANJO', 'LYRICS', 'CONCERT', 'HARMONY', 'BALLAD'],
      ...['ENCORE', 'TREBLE', 'WALTZ', 'ORGAN', 'CHORUS', 'STUDIO'],
    ],
  },
];
