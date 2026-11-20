import type { FeatureModule } from '@/lib/feature';
import { paths } from '@/lib/paths';

/** Everything you have saved: find it, resume it, rename it, remove it. */
export const libraryFeature: FeatureModule = {
  id: 'library',
  nav: { label: 'Library', to: paths.library() },
  routes: [
    {
      path: 'library',
      lazy: async () => ({ Component: (await import('./LibraryPage')).LibraryPage }),
    },
  ],
};
