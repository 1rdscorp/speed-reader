/**
 * The only persistence primitive the app depends on. Values must be
 * JSON-serialisable. The interface is asynchronous so a backend with real I/O
 * (IndexedDB, a sync server) can replace localStorage without touching callers.
 */
export interface KeyValueStore {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
}

/** Thrown by `set` when the backend has no room left for the value. */
export class StorageFullError extends Error {
  constructor(options?: ErrorOptions) {
    super('Storage is full', options);
    this.name = 'StorageFullError';
  }
}

/** Volatile store for tests and for environments where nothing can be persisted. */
export function createMemoryStore(): KeyValueStore {
  const values = new Map<string, string>();
  return {
    async get<T>(key: string) {
      const raw = values.get(key);
      return raw === undefined ? undefined : (JSON.parse(raw) as T);
    },
    async set(key, value) {
      values.set(key, JSON.stringify(value));
    },
    async delete(key) {
      values.delete(key);
    },
  };
}
