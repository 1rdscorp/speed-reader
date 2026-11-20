import { STORAGE_NAMESPACE } from '@/lib/config';
import { createDocumentRepository } from '@/lib/documents';
import type { Services } from '@/lib/services';
import { SettingsStore } from '@/lib/settings';
import { createLocalStorageStore } from '@/lib/storage';

/**
 * The one place that decides which concrete implementations the app runs on.
 * Swapping the storage backend, or adding a service, happens here.
 */
export function createServices(): Services {
  const store = createLocalStorageStore(STORAGE_NAMESPACE);
  return {
    documents: createDocumentRepository(store),
    settings: new SettingsStore(store),
  };
}
