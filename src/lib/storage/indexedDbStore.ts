import { StorageFullError, type KeyValueStore } from './keyValueStore';

const OBJECT_STORE = 'entries';

function openDatabase(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(OBJECT_STORE);
    };
    request.onsuccess = () => {
      const database = request.result;
      // Another tab is upgrading the database; step aside rather than block it.
      database.onversionchange = () => database.close();
      resolve(database);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('IndexedDB is blocked by another tab'));
  });
}

/**
 * Open a key-value store backed by IndexedDB, which has room for whole books
 * where localStorage holds a few megabytes. Rejects if IndexedDB is missing or
 * refuses to open (some private-browsing modes); callers should fall back.
 */
export async function openIndexedDbStore(name: string): Promise<KeyValueStore> {
  const database = await openDatabase(name);

  function run<T>(
    mode: IDBTransactionMode,
    operation: (entries: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(OBJECT_STORE, mode);
      const request = operation(transaction.objectStore(OBJECT_STORE));
      // A write only counts once its transaction commits.
      transaction.oncomplete = () => resolve(request.result);
      const fail = () => {
        const error = transaction.error ?? request.error;
        reject(
          error?.name === 'QuotaExceededError' ? new StorageFullError({ cause: error }) : error,
        );
      };
      transaction.onabort = fail;
      transaction.onerror = fail;
    });
  }

  return {
    get: <T>(key: string) => run<T | undefined>('readonly', (entries) => entries.get(key)),
    async set(key, value) {
      await run('readwrite', (entries) => entries.put(value, key));
    },
    async delete(key) {
      await run('readwrite', (entries) => entries.delete(key));
    },
  };
}
