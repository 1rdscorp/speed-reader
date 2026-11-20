export interface Game {
  /** Used in the address: /games/<id>. */
  id: string;
  title: string;
  description: string;
  /** The game itself: a self-contained page in public/games/. */
  file: string;
}

/** The games on the site. To add one, put its page in public/games/ and list it here. */
export const GAMES: Game[] = [
  {
    id: 'flying-mile',
    title: 'Flying Mile',
    description:
      'Type the passage to drive a jet car down the salt flats. The faster and cleaner you type, the faster it goes.',
    file: 'flying-mile.html',
  },
  {
    id: 'keystorm',
    title: 'Keystorm',
    description:
      'Words fall with the rain. Type one and lightning strikes it down before it reaches the city.',
    file: 'keystorm.html',
  },
];

/** Address of a game's page, relative to wherever the site is hosted. */
export const gameUrl = (game: Game) => `${import.meta.env.BASE_URL}games/${game.file}`;
