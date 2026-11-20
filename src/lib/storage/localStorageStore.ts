import { StorageFullError, type KeyValueStore } from './keyValueStore';

/** Persists JSON values in localStorage under `<namespace>:<key>`. */
export function createLocalStorageStore(namespace: string): KeyValueStore {
  const prefixed = (key: string) => `${namespace}:${key}`;
  return {
    async get<T>(key: string) {
      const raw = localStorage.getItem(prefixed(key));
      if (raw === null) return undefined;
      try {
        return JSON.parse(raw) as T;
      } catch {
        // Unreadable data is as good as missing; the next write replaces it.
        return undefined;
      }
    },
    async set(key, value) {
      try {
        localStorage.setItem(prefixed(key), JSON.stringify(value));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          throw new StorageFullError({ cause: error });
        }
        throw error;
      }
    },
    async delete(key) {
      localStorage.removeItem(prefixed(key));
    },
  };
}
