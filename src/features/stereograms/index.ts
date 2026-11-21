import type { FeatureModule } from '@/lib/feature';
import { paths } from '@/lib/paths';

/** Stereograms: pictures with a hidden word, and a button that reveals it. */
export const stereogramsFeature: FeatureModule = {
  id: 'stereograms',
  nav: { label: 'Stereograms', to: paths.stereograms() },
  routes: [
    {
      path: 'stereograms',
      lazy: async () => ({ Component: (await import('./StereogramsPage')).StereogramsPage }),
    },
  ],
};
