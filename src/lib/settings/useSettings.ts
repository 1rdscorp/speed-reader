import { useSyncExternalStore } from 'react';
import { useServices } from '@/lib/services';
import type { Settings } from './settings';

/** Current settings, re-rendering the caller when they change. */
export function useSettings(): Settings {
  const { settings } = useServices();
  return useSyncExternalStore(settings.subscribe, settings.get);
}
