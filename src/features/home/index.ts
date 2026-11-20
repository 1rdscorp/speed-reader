import type { FeatureModule } from '@/lib/feature';

/** The start page: paste a text, or pick up a recent one. */
export const homeFeature: FeatureModule = {
  id: 'home',
  routes: [
    {
      index: true,
      lazy: async () => ({ Component: (await import('./HomePage')).HomePage }),
    },
  ],
};
