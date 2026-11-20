import type { FeatureModule } from '@/lib/feature';
import { paths } from '@/lib/paths';

/** Reading settings: how text looks and moves in the reader, with a preview. */
export const settingsFeature: FeatureModule = {
  id: 'settings',
  nav: { label: 'Settings', to: paths.settings() },
  routes: [
    {
      path: 'settings',
      lazy: async () => ({ Component: (await import('./SettingsPage')).SettingsPage }),
    },
  ],
};
