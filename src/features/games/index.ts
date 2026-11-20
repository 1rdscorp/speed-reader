import type { FeatureModule } from '@/lib/feature';
import { paths } from '@/lib/paths';

/** Typing games, each a self-contained page shown inside the site. */
export const gamesFeature: FeatureModule = {
  id: 'games',
  nav: { label: 'Games', to: paths.games() },
  routes: [
    {
      path: 'games',
      lazy: async () => ({ Component: (await import('./GamesPage')).GamesPage }),
    },
    {
      path: 'games/:gameId',
      lazy: async () => ({ Component: (await import('./GamePage')).GamePage }),
    },
  ],
};
