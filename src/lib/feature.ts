import type { RouteObject } from 'react-router';

export interface NavItem {
  label: string;
  /** Path the item links to, e.g. "/library". */
  to: string;
}

/**
 * What a feature contributes to the app. Each folder in src/features exports
 * one of these and is listed in src/app/features.ts; nothing else needs to
 * change to add a page.
 */
export interface FeatureModule {
  id: string;
  /** The feature's pages, rendered inside the app shell (header, navigation, footer). */
  routes: RouteObject[];
  /** Entry in the main navigation, if the feature has a top-level page. */
  nav?: NavItem;
}
