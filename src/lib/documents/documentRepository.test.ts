import { describe, expect, it } from 'vitest';
import { StorageFullError, createMemoryStore, type KeyValueStore } from '@/lib/storage';
import { createDocumentRepository } from './documentRepository';

function setup(store: KeyValueStore = createMemoryStore()) {
  let time = 1_000;
  const repository = createDocumentRepository(store, () => (time += 1));
  return { repository, store };
}

describe('document repository', () => {
  it('creates a document with a derived title, a word count and no progress', async () => {
    const { repository } = setup();
    const meta = await repository.create({
      text: 'A short title\n\nAnd then the body of the text.',
      source: { kind: 'paste' },
    });
    expect(meta).toMatchObject({
      title: 'A short title',
      wordCount: 10,
      progress: { offset: 0, fraction: 0 },
    });
    expect(await repository.get(meta.id)).toEqual({
      ...meta,
      text: 'A short title\n\nAnd then the body of the text.',
    });
  });

  it('prefers an explicit title', async () => {
    const { repository } = setup();
    const meta = await repository.create({
      text: 'body',
      title: '  Named  ',
      source: { kind: 'paste' },
    });
    expect(meta.title).toBe('Named');
  });

  it('lists documents most recently read first', async () => {
    const { repository } = setup();
    const first = await repository.create({ text: 'first', source: { kind: 'paste' } });
    const second = await repository.create({ text: 'second', source: { kind: 'paste' } });
    expect((await repository.list()).map((d) => d.id)).toEqual([second.id, first.id]);

    await repository.saveProgress(first.id, { offset: 3, fraction: 0.5 });
    const list = await repository.list();
    expect(list.map((d) => d.id)).toEqual([first.id, second.id]);
    expect(list[0]?.progress).toEqual({ offset: 3, fraction: 0.5 });
  });

  it('removes a document and its text', async () => {
    const { repository, store } = setup();
    const meta = await repository.create({ text: 'gone soon', source: { kind: 'paste' } });
    await repository.remove(meta.id);
    expect(await repository.list()).toEqual([]);
    expect(await repository.get(meta.id)).toBeUndefined();
    expect(await store.get(`documents/text/${meta.id}`)).toBeUndefined();
  });

  it('ignores progress for a document that no longer exists', async () => {
    const { repository } = setup();
    await expect(
      repository.saveProgress('missing', { offset: 1, fraction: 1 }),
    ).resolves.toBeUndefined();
    expect(await repository.list()).toEqual([]);
  });

  it('reflects a write in a read issued straight after it', async () => {
    const { repository } = setup();
    const meta = await repository.create({ text: 'one two three', source: { kind: 'paste' } });
    void repository.saveProgress(meta.id, { offset: 4, fraction: 0.33 });
    expect((await repository.list())[0]?.progress.fraction).toBe(0.33);
    void repository.saveProgress(meta.id, { offset: 8, fraction: 0.66 });
    expect((await repository.get(meta.id))?.progress.fraction).toBe(0.66);
  });

  it('keeps every change when updates overlap', async () => {
    const { repository } = setup();
    const [a, b, c] = await Promise.all(
      ['one', 'two', 'three'].map((text) => repository.create({ text, source: { kind: 'paste' } })),
    );
    await Promise.all([
      repository.saveProgress(a!.id, { offset: 1, fraction: 0.1 }),
      repository.remove(b!.id),
      repository.saveProgress(c!.id, { offset: 2, fraction: 0.2 }),
    ]);
    const byId = new Map((await repository.list()).map((d) => [d.id, d.progress.fraction]));
    expect(byId).toEqual(
      new Map([
        [a!.id, 0.1],
        [c!.id, 0.2],
      ]),
    );
  });

  it('leaves nothing behind when the text does not fit in storage', async () => {
    const memory = createMemoryStore();
    const full: KeyValueStore = {
      ...memory,
      async set(key, value) {
        if (key.startsWith('documents/text/')) throw new StorageFullError();
        await memory.set(key, value);
      },
    };
    const { repository } = setup(full);
    await expect(repository.create({ text: 'too big', source: { kind: 'paste' } })).rejects.toThrow(
      StorageFullError,
    );
    expect(await repository.list()).toEqual([]);
    // The repository still works afterwards.
    await expect(repository.saveProgress('x', { offset: 0, fraction: 0 })).resolves.toBeUndefined();
  });
});
