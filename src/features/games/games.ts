import { lazy, type ComponentType } from 'react';

interface GameBase {
  /** Used in the address: /games/<id>. */
  id: string;
  title: string;
  description: string;
  /** A small picture of the game being played, in public/games/. */
  preview: string;
}

/** A game that is its own self-contained page in public/games/, shown in a frame. */
export interface FramedGame extends GameBase {
  file: string;
}

/** A game built into the site, in the site's own look. It is loaded only when opened. */
export interface BuiltInGame extends GameBase {
  Play: ComponentType;
}

export type Game = FramedGame | BuiltInGame;

/**
 * The games on the site. To add one, list it here with a preview picture in
 * public/games/: either its page, also in public/games/, or its component.
 */
export const GAMES: Game[] = [
  {
    id: 'flying-mile',
    title: 'Flying Mile',
    description:
      'Type the passage to drive a jet car down the salt flats. The faster and cleaner you type, the faster it goes.',
    file: 'flying-mile.html',
    preview: 'flying-mile.jpg',
  },
  {
    id: 'keystorm',
    title: 'Keystorm',
    description:
      'Words fall with the rain. Type one and lightning strikes it down before it reaches the city.',
    file: 'keystorm.html',
    preview: 'keystorm.jpg',
  },
  {
    id: 'word-search',
    title: 'Word Search',
    description:
      'Find the words hidden in a square of letters: across, down and along the diagonals. Three levels, with a new puzzle every time.',
    preview: 'word-search.jpg',
    Play: lazy(async () => ({ default: (await import('./wordsearch/WordSearch')).WordSearch })),
  },
];

/** Address of a game's page, relative to wherever the site is hosted. */
export const gameUrl = (game: FramedGame) => `${import.meta.env.BASE_URL}games/${game.file}`;

/** Address of a game's preview picture. */
export const previewUrl = (game: Game) => `${import.meta.env.BASE_URL}games/${game.preview}`;
