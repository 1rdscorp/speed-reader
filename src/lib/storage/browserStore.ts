import { createMemoryStore, type KeyValueStore } from './keyValueStore';
import { createLocalStorageStore } from './localStorageStore';

function localStorageWorks(): boolean {
  try {
    const probe = '__storage_probe__';
    localStorage.setItem(probe, probe);
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/**
 * The store to use in a browser: localStorage when it is usable, otherwise
 * memory. Storage can be blocked (private browsing, strict site-data settings,
 * some embedded frames); the app should still work there, just without
 * remembering anything after the page closes.
 */
export function createBrowserStore(namespace: string): KeyValueStore {
  return localStorageWorks() ? createLocalStorageStore(namespace) : createMemoryStore();
}
