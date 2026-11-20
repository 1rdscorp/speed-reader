import type { KeyValueStore } from '@/lib/storage';
import { INDEX_KEY, textKey } from './documentRepository';
import type { DocumentMeta } from './types';

/**
 * Move every saved document from one store to another, for when the library
 * changes home (as it did from localStorage to IndexedDB). Does nothing if the
 * source is empty or the destination already holds a library, so it is safe to
 * run on every start-up. The source is cleared only after the copy is complete.
 */
export async function moveDocuments(from: KeyValueStore, to: KeyValueStore): Promise<void> {
  const index = await from.get<DocumentMeta[]>(INDEX_KEY);
  if (!index || (await to.get(INDEX_KEY)) !== undefined) return;

  const moved: DocumentMeta[] = [];
  for (const document of index) {
    const text = await from.get<string>(textKey(document.id));
    if (text === undefined) continue;
    await to.set(textKey(document.id), text);
    moved.push(document);
  }
  // The index goes last: until it exists the destination counts as empty and a retry starts over.
  await to.set(INDEX_KEY, moved);

  await from.delete(INDEX_KEY);
  for (const document of index) await from.delete(textKey(document.id));
}
