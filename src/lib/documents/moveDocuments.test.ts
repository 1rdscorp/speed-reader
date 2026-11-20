import { describe, expect, it } from 'vitest';
import { createMemoryStore, type KeyValueStore } from '@/lib/storage';
import { createDocumentRepository } from './documentRepository';
import { moveDocuments } from './moveDocuments';

async function libraryWith(texts: string[]) {
  const store = createMemoryStore();
  const repository = createDocumentRepository(store);
  for (const text of texts) await repository.create({ text, source: { kind: 'paste' } });
  return { store, repository };
}

describe('moveDocuments', () => {
  it('moves a whole library, with reading positions, and empties the source', async () => {
    const old = await libraryWith(['First text here', 'Second text here']);
    const [newest] = await old.repository.list();
    await old.repository.saveProgress(newest!.id, { offset: 7, fraction: 0.4 });
    const before = await old.repository.list();

    const destination = createMemoryStore();
    await moveDocuments(old.store, destination);

    const moved = createDocumentRepository(destination);
    expect(await moved.list()).toEqual(before);
    expect((await moved.get(newest!.id))?.text).toBe('Second text here');
    expect(await old.repository.list()).toEqual([]);
    expect(await old.store.get(`documents/text/${newest!.id}`)).toBeUndefined();
  });

  it('does nothing when there is nothing to move', async () => {
    const destination = await libraryWith(['Already here']);
    await moveDocuments(createMemoryStore(), destination.store);
    expect(await destination.repository.list()).toHaveLength(1);
  });

  it('never overwrites a library that already exists at the destination', async () => {
    const old = await libraryWith(['Old text']);
    const destination = await libraryWith(['New text']);
    await moveDocuments(old.store, destination.store);
    expect((await destination.repository.list()).map((d) => d.title)).toEqual(['New text']);
    expect(await old.repository.list()).toHaveLength(1);
  });

  it('leaves the source intact if the copy fails, so it can be retried', async () => {
    const old = await libraryWith(['One', 'Two']);
    const memory = createMemoryStore();
    let writes = 0;
    const flaky: KeyValueStore = {
      ...memory,
      async set(key, value) {
        writes += 1;
        if (writes === 2) throw new Error('disk full');
        await memory.set(key, value);
      },
    };

    await expect(moveDocuments(old.store, flaky)).rejects.toThrow('disk full');
    expect(await old.repository.list()).toHaveLength(2);

    await moveDocuments(old.store, memory);
    expect(await createDocumentRepository(memory).list()).toHaveLength(2);
    expect(await old.repository.list()).toEqual([]);
  });
});
