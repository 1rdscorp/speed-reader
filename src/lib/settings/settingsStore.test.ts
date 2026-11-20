import { describe, expect, it, vi } from 'vitest';
import { createMemoryStore } from '@/lib/storage';
import { DEFAULT_SETTINGS } from './settings';
import { SETTINGS_KEY, SettingsStore } from './settingsStore';

describe('SettingsStore', () => {
  it('starts from defaults when nothing is saved', async () => {
    const settings = new SettingsStore(createMemoryStore());
    await settings.load();
    expect(settings.get()).toEqual(DEFAULT_SETTINGS);
  });

  it('merges saved values over defaults and repairs invalid ones', async () => {
    const store = createMemoryStore();
    await store.set(SETTINGS_KEY, {
      wpm: 99_999,
      wordsPerFrame: 12,
      fontSize: 'huge',
      darkReader: 'yes',
      focusColor: 'ultraviolet',
      removedLongAgo: true,
    });
    const settings = new SettingsStore(store);
    await settings.load();
    expect(settings.get()).toEqual({ ...DEFAULT_SETTINGS, wpm: 1000, wordsPerFrame: 3 });

    await store.set(SETTINGS_KEY, { darkReader: true, fontSize: 72, focusColor: 'green' });
    await settings.load();
    expect(settings.get()).toEqual({
      ...DEFAULT_SETTINGS,
      darkReader: true,
      fontSize: 72,
      focusColor: 'green',
    });
  });

  it('persists updates and notifies subscribers', async () => {
    const store = createMemoryStore();
    const settings = new SettingsStore(store);
    await settings.load();
    const listener = vi.fn();
    settings.subscribe(listener);

    settings.update({ wpm: 450 });
    expect(settings.get().wpm).toBe(450);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(await store.get(SETTINGS_KEY)).toEqual({ ...DEFAULT_SETTINGS, wpm: 450 });

    settings.update({ wpm: 450 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('keeps working when storage fails', async () => {
    const settings = new SettingsStore({
      get: () => Promise.reject(new Error('blocked')),
      set: () => Promise.reject(new Error('blocked')),
      delete: () => Promise.reject(new Error('blocked')),
    });
    await settings.load();
    settings.update({ darkReader: true });
    expect(settings.get()).toEqual({ ...DEFAULT_SETTINGS, darkReader: true });
  });
});
