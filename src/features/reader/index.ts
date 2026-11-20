import type { FeatureModule } from '@/lib/feature';
import { paths } from '@/lib/paths';

const page = async () => ({ Component: (await import('./ReaderPage')).ReaderPage });

/** The reading page: the word stage, its controls, and the box for adding text. */
export const readerFeature: FeatureModule = {
  id: 'reader',
  nav: { label: 'Read', to: paths.read() },
  routes: [
    // Without an id the page shows whatever was read last.
    { path: 'read', lazy: page },
    { path: 'read/:documentId', lazy: page },
  ],
};
