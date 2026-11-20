import type { RouteObject } from 'react-router';
import type { FeatureModule } from '@/lib/feature';
import { AppShell } from './AppShell';
import { ErrorPage } from './ErrorPage';
import { FEATURES } from './features';
import { NotFoundPage } from './NotFoundPage';

/**
 * Assemble the route tree from the feature registry. Pass the result to
 * createHashRouter in the browser or createMemoryRouter in tests.
 */
export function buildRoutes(features: FeatureModule[] = FEATURES): RouteObject[] {
  const navItems = features.flatMap((feature) => (feature.nav ? [feature.nav] : []));
  return [
    {
      ErrorBoundary: ErrorPage,
      // Pages are loaded on demand; there is nothing useful to show for the instant that takes.
      HydrateFallback: () => null,
      children: [
        {
          element: <AppShell navItems={navItems} />,
          children: [
            ...features.flatMap((feature) => feature.routes),
            { path: '*', element: <NotFoundPage /> },
          ],
        },
      ],
    },
  ];
}
