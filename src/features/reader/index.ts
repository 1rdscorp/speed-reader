import type { FeatureModule } from '@/lib/feature';

/** The reading screen: one document, shown a word at a time. */
export const readerFeature: FeatureModule = {
  id: 'reader',
  fullscreenRoutes: [
    {
      path: 'read/:documentId',
      lazy: async () => ({ Component: (await import('./ReaderPage')).ReaderPage }),
    },
  ],
};
