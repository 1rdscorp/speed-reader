import type { KeyValueStore } from '@/lib/storage';
import { DEFAULT_SETTINGS, sanitize, type Settings } from './settings';

/** Storage key. index.html reads the same entry to set the theme before first paint. */
export const SETTINGS_KEY = 'settings';

/**
 * Holds the current settings in memory for synchronous reads and writes
 * changes through to storage in the background.
 */
export class SettingsStore {
  readonly #store: KeyValueStore;
  readonly #listeners = new Set<() => void>();
  #settings: Settings = DEFAULT_SETTINGS;

  constructor(store: KeyValueStore) {
    this.#store = store;
  }

  /** Read saved settings. Call once at start-up, before the first render. */
  async load(): Promise<void> {
    try {
      this.#settings = sanitize(await this.#store.get(SETTINGS_KEY));
    } catch {
      // Storage can be unavailable (private browsing, blocked site data); defaults still work.
      this.#settings = DEFAULT_SETTINGS;
    }
    this.#notify();
  }

  get = (): Settings => this.#settings;

  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  update(patch: Partial<Settings>): void {
    const next = sanitize({ ...this.#settings, ...patch });
    if (next.wpm === this.#settings.wpm && next.theme === this.#settings.theme) return;
    this.#settings = next;
    this.#notify();
    // A failed save only costs the preference on the next visit, so it must not interrupt reading.
    this.#store.set(SETTINGS_KEY, next).catch(() => {});
  }

  #notify(): void {
    for (const listener of this.#listeners) listener();
  }
}
