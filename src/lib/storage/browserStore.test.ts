import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBrowserStore } from './browserStore';

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('createBrowserStore', () => {
  it('persists to localStorage under the namespace', async () => {
    const store = createBrowserStore('test');
    await store.set('answer', { value: 42 });
    expect(localStorage.getItem('test:answer')).toBe('{"value":42}');
    expect(await createBrowserStore('test').get('answer')).toEqual({ value: 42 });
    await store.delete('answer');
    expect(await store.get('answer')).toBeUndefined();
  });

  it('treats unreadable saved data as missing', async () => {
    localStorage.setItem('test:broken', '{not json');
    expect(await createBrowserStore('test').get('broken')).toBeUndefined();
  });

  it('falls back to memory when storage is blocked', async () => {
    const blocked = () => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    };
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);

    const store = createBrowserStore('test');
    await store.set('answer', 42);
    expect(await store.get('answer')).toBe(42);
  });
});
