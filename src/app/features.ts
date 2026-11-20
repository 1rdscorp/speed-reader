import { homeFeature } from '@/features/home';
import { readerFeature } from '@/features/reader';
import type { FeatureModule } from '@/lib/feature';

/** Every feature in the app. Adding a stage means adding its module to this list. */
export const FEATURES: FeatureModule[] = [homeFeature, readerFeature];
