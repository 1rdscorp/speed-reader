import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { openIndexedDbStore } from './indexedDbStore';

describe('IndexedDB store', () => {
  it('stores, replaces and deletes values', async () => {
    const store = await openIndexedDbStore('test-basic');
    expect(await store.get('missing')).toBeUndefined();

    await store.set('book', { title: 'Middlemarch', words: 316_059 });
    expect(await store.get('book')).toEqual({ title: 'Middlemarch', words: 316_059 });

    await store.set('book', 'replaced');
    expect(await store.get('book')).toBe('replaced');

    await store.delete('book');
    expect(await store.get('book')).toBeUndefined();
  });

  it('keeps data across reopening', async () => {
    await (await openIndexedDbStore('test-reopen')).set('text', 'x'.repeat(2_000_000));
    const reopened = await openIndexedDbStore('test-reopen');
    expect(await reopened.get<string>('text')).toHaveLength(2_000_000);
  });

  it('keeps databases with different names apart', async () => {
    await (await openIndexedDbStore('test-a')).set('key', 'a');
    expect(await (await openIndexedDbStore('test-b')).get('key')).toBeUndefined();
  });
});
