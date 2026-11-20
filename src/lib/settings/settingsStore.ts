import type { KeyValueStore } from '@/lib/storage';
import { DEFAULT_SETTINGS, sanitize, type Settings } from './settings';

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
    const current = this.#settings;
    const next = sanitize({ ...current, ...patch });
    const keys = Object.keys(next) as Array<keyof Settings>;
    if (keys.every((key) => next[key] === current[key])) return;
    this.#settings = next;
    this.#notify();
    // A failed save only costs the preference on the next visit, so it must not interrupt reading.
    this.#store.set(SETTINGS_KEY, next).catch(() => {});
  }

  #notify(): void {
    for (const listener of this.#listeners) listener();
  }
}
