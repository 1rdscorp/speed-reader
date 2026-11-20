import { describe, expect, it, vi } from 'vitest';
import { Player, type Scheduler } from './player';
import { buildTimeline } from './timing';
import { tokenize } from './tokenize';

/** A hand-cranked clock: time only moves when the test says so. */
class FakeScheduler implements Scheduler {
  time = 0;
  #pending: { at: number; callback: () => void } | null = null;

  now = () => this.time;
  setTimeout = (callback: () => void, delayMs: number) => {
    this.#pending = { at: this.time + delayMs, callback };
    return this.#pending;
  };
  clearTimeout = (handle: unknown) => {
    if (this.#pending === handle) this.#pending = null;
  };

  /** Move time forward, firing timers as they come due. `lateBy` simulates timer jitter. */
  advance(ms: number, lateBy = 0) {
    const end = this.time + ms;
    while (this.#pending && this.#pending.at + lateBy <= end) {
      const { at, callback } = this.#pending;
      this.#pending = null;
      this.time = at + lateBy;
      callback();
    }
    this.time = end;
  }
}

// Five plain words and no punctuation: at 600 wpm the first four last 100 ms
// each once the closing paragraph pause is accounted for.
function setup(text = 'aa bb cc dd ee', wpm = 600) {
  const scheduler = new FakeScheduler();
  const timeline = buildTimeline(tokenize(text), { clause: 0, sentence: 0, paragraph: 0 });
  const player = new Player(timeline, { wpm, scheduler });
  return { scheduler, player };
}

describe('Player', () => {
  it('starts paused on the first token', () => {
    const { player } = setup();
    expect(player.getSnapshot()).toEqual({ index: 0, status: 'paused' });
  });

  it('advances one token per interval while playing', () => {
    const { player, scheduler } = setup();
    player.play();
    expect(player.getSnapshot()).toEqual({ index: 0, status: 'playing' });
    scheduler.advance(99);
    expect(player.getSnapshot().index).toBe(0);
    scheduler.advance(1);
    expect(player.getSnapshot().index).toBe(1);
    scheduler.advance(200);
    expect(player.getSnapshot().index).toBe(3);
  });

  it('finishes after the last token has had its time', () => {
    const { player, scheduler } = setup();
    player.play();
    scheduler.advance(499);
    expect(player.getSnapshot()).toEqual({ index: 4, status: 'playing' });
    scheduler.advance(1);
    expect(player.getSnapshot()).toEqual({ index: 4, status: 'finished' });
  });

  it('holds its place when paused and resumes from there', () => {
    const { player, scheduler } = setup();
    player.play();
    scheduler.advance(250);
    player.pause();
    scheduler.advance(10_000);
    expect(player.getSnapshot()).toEqual({ index: 2, status: 'paused' });
    player.toggle();
    scheduler.advance(100);
    expect(player.getSnapshot()).toEqual({ index: 3, status: 'playing' });
  });

  it('restarts from the beginning when played after finishing', () => {
    const { player, scheduler } = setup();
    player.play();
    scheduler.advance(500);
    player.play();
    expect(player.getSnapshot()).toEqual({ index: 0, status: 'playing' });
  });

  it('seeks while paused, clamping to the text', () => {
    const { player } = setup();
    player.seek(3);
    expect(player.getSnapshot()).toEqual({ index: 3, status: 'paused' });
    player.seek(99);
    expect(player.getSnapshot().index).toBe(4);
    player.seek(-1);
    expect(player.getSnapshot().index).toBe(0);
  });

  it('keeps playing after a seek, giving the new token its full time', () => {
    const { player, scheduler } = setup();
    player.play();
    scheduler.advance(50);
    player.seek(2);
    scheduler.advance(99);
    expect(player.getSnapshot()).toEqual({ index: 2, status: 'playing' });
    scheduler.advance(1);
    expect(player.getSnapshot().index).toBe(3);
  });

  it('leaves the finished state when seeking back', () => {
    const { player, scheduler } = setup();
    player.play();
    scheduler.advance(500);
    player.seek(1);
    expect(player.getSnapshot()).toEqual({ index: 1, status: 'paused' });
  });

  it('applies a speed change from the next token', () => {
    const { player, scheduler } = setup();
    player.play();
    player.setWpm(300);
    scheduler.advance(100);
    expect(player.getSnapshot().index).toBe(1);
    scheduler.advance(199);
    expect(player.getSnapshot().index).toBe(1);
    scheduler.advance(1);
    expect(player.getSnapshot().index).toBe(2);
  });

  it('does not let late timers slow the overall pace', () => {
    const { player, scheduler } = setup();
    player.play();
    // Every timer fires 10 ms late, yet tokens still change on the 100 ms grid.
    scheduler.advance(315, 10);
    expect(player.getSnapshot().index).toBe(3);
    expect(scheduler.time).toBe(315);
  });

  it('does not race to catch up after a long stall', () => {
    const { player, scheduler } = setup();
    player.play();
    scheduler.advance(2_100, 2_000); // the first timer fires two seconds late: the tab was asleep
    expect(player.getSnapshot().index).toBe(1);
    scheduler.advance(99);
    expect(player.getSnapshot().index).toBe(1);
    scheduler.advance(1);
    expect(player.getSnapshot().index).toBe(2);
  });

  it('notifies subscribers of changes until they unsubscribe', () => {
    const { player, scheduler } = setup();
    const listener = vi.fn();
    const unsubscribe = player.subscribe(listener);
    player.play();
    scheduler.advance(100);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    scheduler.advance(100);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('is inert for an empty text', () => {
    const scheduler = new FakeScheduler();
    const player = new Player(buildTimeline([]), { wpm: 300, scheduler });
    player.play();
    expect(player.getSnapshot()).toEqual({ index: 0, status: 'paused' });
  });
});
