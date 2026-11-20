import { clampWpm, tokenDurationMs, type Timeline } from './timing';

export type PlayerStatus = 'paused' | 'playing' | 'finished';

export interface PlayerSnapshot {
  /** Index of the token currently on stage. */
  index: number;
  status: PlayerStatus;
}

/** Clock and timer source, injectable so playback can be tested without real time. */
export interface Scheduler {
  now(): number;
  setTimeout(callback: () => void, delayMs: number): unknown;
  clearTimeout(handle: unknown): void;
}

const systemScheduler: Scheduler = {
  now: () => performance.now(),
  setTimeout: (callback, delayMs) => globalThis.setTimeout(callback, delayMs),
  clearTimeout: (handle) => globalThis.clearTimeout(handle as ReturnType<typeof setTimeout>),
};

export interface PlayerOptions {
  wpm: number;
  startIndex?: number;
  scheduler?: Scheduler;
}

/**
 * Steps through a timeline at a given speed. Knows nothing about the DOM or
 * React: subscribe for snapshots and render them however you like.
 */
export class Player {
  readonly #timeline: Timeline;
  readonly #scheduler: Scheduler;
  readonly #listeners = new Set<() => void>();
  #wpm: number;
  #snapshot: PlayerSnapshot;
  #timer: unknown = null;
  /** When the current token is due to leave the stage, on the scheduler's clock. */
  #deadline = 0;

  constructor(timeline: Timeline, options: PlayerOptions) {
    this.#timeline = timeline;
    this.#scheduler = options.scheduler ?? systemScheduler;
    this.#wpm = clampWpm(options.wpm);
    this.#snapshot = { index: this.#clampIndex(options.startIndex ?? 0), status: 'paused' };
  }

  get length(): number {
    return this.#timeline.weights.length;
  }

  /** Stable between changes, so it can back `useSyncExternalStore`. */
  getSnapshot = (): PlayerSnapshot => this.#snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  play(): void {
    if (this.#snapshot.status === 'playing' || this.length === 0) return;
    const index = this.#snapshot.status === 'finished' ? 0 : this.#snapshot.index;
    this.#update({ index, status: 'playing' });
    this.#deadline = this.#scheduler.now();
    this.#schedule();
  }

  pause(): void {
    if (this.#snapshot.status !== 'playing') return;
    this.#cancel();
    this.#update({ index: this.#snapshot.index, status: 'paused' });
  }

  toggle(): void {
    if (this.#snapshot.status === 'playing') this.pause();
    else this.play();
  }

  /** Jump to a token. Playback carries on from there if it was running. */
  seek(index: number): void {
    const target = this.#clampIndex(index);
    const playing = this.#snapshot.status === 'playing';
    this.#cancel();
    this.#update({ index: target, status: playing ? 'playing' : 'paused' });
    if (playing) {
      this.#deadline = this.#scheduler.now();
      this.#schedule();
    }
  }

  /** Takes effect from the next token. */
  setWpm(wpm: number): void {
    this.#wpm = clampWpm(wpm);
  }

  #schedule(): void {
    const duration = tokenDurationMs(this.#timeline, this.#snapshot.index, this.#wpm);
    const now = this.#scheduler.now();
    // Timers fire late. Aiming at a running deadline stops that lateness from
    // accumulating — but after a real stall (throttled background tab, debugger)
    // start afresh instead of flashing through words to catch up.
    if (this.#deadline < now - duration) this.#deadline = now;
    this.#deadline += duration;
    this.#timer = this.#scheduler.setTimeout(this.#advance, Math.max(0, this.#deadline - now));
  }

  #advance = (): void => {
    this.#timer = null;
    const { index } = this.#snapshot;
    if (index >= this.length - 1) {
      this.#update({ index, status: 'finished' });
      return;
    }
    this.#update({ index: index + 1, status: 'playing' });
    this.#schedule();
  };

  #cancel(): void {
    if (this.#timer !== null) this.#scheduler.clearTimeout(this.#timer);
    this.#timer = null;
  }

  #clampIndex(index: number): number {
    return Math.min(Math.max(Math.trunc(index), 0), Math.max(this.length - 1, 0));
  }

  #update(next: PlayerSnapshot): void {
    if (next.index === this.#snapshot.index && next.status === this.#snapshot.status) return;
    this.#snapshot = next;
    for (const listener of this.#listeners) listener();
  }
}
