import { countWords } from '@/core';
import type { KeyValueStore } from '@/lib/storage';
import { normalizeText } from './normalize';
import { deriveTitle } from './title';
import type { DocumentMeta, DocumentRepository, NewDocument, ReadingProgress } from './types';

// Metadata lives in one index entry so listing never loads document bodies.
export const INDEX_KEY = 'documents/index';
export const textKey = (id: string) => `documents/text/${id}`;

const cleanTitle = (title: string) => title.replace(/\s+/g, ' ').trim();

function createId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, '0')).join('');
}

export function createDocumentRepository(
  store: KeyValueStore,
  now: () => number = Date.now,
): DocumentRepository {
  const readIndex = async () => (await store.get<DocumentMeta[]>(INDEX_KEY)) ?? [];

  // Index updates are read-modify-write; run them one at a time so overlapping
  // calls (a progress save racing a delete) cannot overwrite each other.
  let queue: Promise<unknown> = Promise.resolve();
  function exclusive<T>(task: () => Promise<T>): Promise<T> {
    const result = queue.then(task);
    queue = result.catch(() => {});
    return result;
  }
  /** Replace one document's metadata; a no-op if it has been removed. */
  function update(id: string, change: (document: DocumentMeta) => DocumentMeta): Promise<void> {
    return exclusive(async () => {
      const index = await readIndex();
      if (!index.some((document) => document.id === id)) return;
      await store.set(
        INDEX_KEY,
        index.map((document) => (document.id === id ? change(document) : document)),
      );
    });
  }
  // Reads wait for writes already under way, so a list requested right after
  // a save (leaving the reader for the library) reflects that save.
  const settled = () => queue;

  return {
    async list() {
      await settled();
      const index = await readIndex();
      return index.toSorted((a, b) => b.lastReadAt - a.lastReadAt);
    },

    async get(id) {
      await settled();
      const meta = (await readIndex()).find((document) => document.id === id);
      if (!meta) return undefined;
      const text = await store.get<string>(textKey(id));
      return text === undefined ? undefined : { ...meta, text };
    },

    create(input: NewDocument) {
      return exclusive(async () => {
        const text = normalizeText(input.text);
        const timestamp = now();
        const meta: DocumentMeta = {
          id: createId(),
          title: cleanTitle(input.title ?? '') || deriveTitle(text),
          source: input.source,
          wordCount: countWords(text),
          createdAt: timestamp,
          lastReadAt: timestamp,
          progress: { offset: 0, fraction: 0 },
        };
        // Text first: if it does not fit, nothing is left pointing at a missing body.
        await store.set(textKey(meta.id), text);
        try {
          await store.set(INDEX_KEY, [...(await readIndex()), meta]);
        } catch (error) {
          await store.delete(textKey(meta.id));
          throw error;
        }
        return meta;
      });
    },

    rename(id: string, title: string) {
      const cleaned = cleanTitle(title);
      if (cleaned === '') return Promise.resolve();
      return update(id, (document) => ({ ...document, title: cleaned }));
    },

    saveProgress(id: string, progress: ReadingProgress) {
      return update(id, (document) => ({ ...document, progress, lastReadAt: now() }));
    },

    remove(id: string) {
      return exclusive(async () => {
        const index = await readIndex();
        await store.set(
          INDEX_KEY,
          index.filter((document) => document.id !== id),
        );
        await store.delete(textKey(id));
      });
    },
  };
}
