import { STORAGE_NAMESPACE } from '@/lib/config';
import { createDocumentRepository, moveDocuments } from '@/lib/documents';
import { createTextImporter } from '@/lib/import';
import type { Services } from '@/lib/services';
import { SettingsStore } from '@/lib/settings';
import { createBrowserStore, openIndexedDbStore, type KeyValueStore } from '@/lib/storage';

/**
 * The library lives in IndexedDB, which has room for whole books. Where that
 * is unavailable it shares the small store. Libraries saved before the move
 * to IndexedDB are carried over the first time this runs.
 */
async function openLibraryStore(small: KeyValueStore): Promise<KeyValueStore> {
  try {
    const store = await openIndexedDbStore(STORAGE_NAMESPACE);
    await moveDocuments(small, store);
    return store;
  } catch {
    return small;
  }
}

/**
 * The one place that decides which concrete implementations the app runs on.
 * Swapping a backend, or adding a service, happens here.
 */
export async function createServices(): Promise<Services> {
  // Settings are tiny and wanted at once, so they stay in localStorage.
  const small = createBrowserStore(STORAGE_NAMESPACE);
  return {
    documents: createDocumentRepository(await openLibraryStore(small)),
    settings: new SettingsStore(small),
    importer: createTextImporter({ pageEndpoint: import.meta.env.VITE_PAGE_ENDPOINT || undefined }),
  };
}
