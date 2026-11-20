import { homeFeature } from '@/features/home';
import { libraryFeature } from '@/features/library';
import { readerFeature } from '@/features/reader';
import { settingsFeature } from '@/features/settings';
import type { FeatureModule } from '@/lib/feature';

/**
 * Every feature in the app. Adding a stage means adding its module to this
 * list. The order here is the order of the links in the navigation.
 */
export const FEATURES: FeatureModule[] = [
  homeFeature,
  readerFeature,
  libraryFeature,
  settingsFeature,
];
