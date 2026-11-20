import type { FeatureModule } from '@/lib/feature';

/** The front page: what the site is, how it works, and the tools on it. */
export const homeFeature: FeatureModule = {
  id: 'home',
  routes: [
    {
      index: true,
      lazy: async () => ({ Component: (await import('./HomePage')).HomePage }),
    },
  ],
};
