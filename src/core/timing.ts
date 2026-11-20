import type { Frame } from './frames';
import type { Token } from './tokenize';

export const MIN_WPM = 100;
export const MAX_WPM = 1000;
export const WPM_STEP = 25;
export const DEFAULT_WPM = 300;

export function clampWpm(wpm: number): number {
  if (!Number.isFinite(wpm)) return DEFAULT_WPM;
  return Math.min(MAX_WPM, Math.max(MIN_WPM, Math.round(wpm)));
}

/** Extra time after a boundary, in multiples of an ordinary word's display time. */
export interface Pauses {
  clause: number;
  sentence: number;
  paragraph: number;
}

export const DEFAULT_PAUSES: Pauses = { clause: 0.4, sentence: 1, paragraph: 1.6 };
/** Every word gets the same beat, whatever follows it. */
export const NO_PAUSES: Pauses = { clause: 0, sentence: 0, paragraph: 0 };

/** Words longer than this stay on screen a little longer for each extra character. */
const LONG_WORD_LENGTH = 7;
const EXTRA_PER_LONG_CHARACTER = 0.08;

/** Relative display time of a token; an ordinary short word weighs 1. */
export function tokenWeight(token: Token, pauses: Pauses = DEFAULT_PAUSES): number {
  const lengthExtra = Math.max(0, token.text.length - LONG_WORD_LENGTH) * EXTRA_PER_LONG_CHARACTER;
  const pause = token.boundary === 'none' ? 0 : pauses[token.boundary];
  return 1 + lengthExtra + pause;
}

/**
 * Pre-computed pacing for a sequence of steps: tokens, or frames of several
 * tokens. Weights are independent of reading speed, so changing WPM never
 * requires rebuilding the timeline.
 */
export interface Timeline {
  /** Relative display time of each step. */
  weights: Float64Array;
  /** cumulative[i] is the total weight of all steps before i; its length is steps + 1. */
  cumulative: Float64Array;
  /** Real words in the text (a long word split into pieces counts once). */
  wordCount: number;
}

/**
 * Build the pacing for a text. Without `frames` there is one step per token;
 * with them, one step per frame, lasting as long as its tokens would in turn.
 */
export function buildTimeline(
  tokens: readonly Token[],
  pauses: Pauses = DEFAULT_PAUSES,
  frames?: readonly Frame[],
): Timeline {
  const steps = frames ?? tokens.map((_, index) => ({ first: index, last: index }));
  const weights = new Float64Array(steps.length);
  const cumulative = new Float64Array(steps.length + 1);
  steps.forEach((step, i) => {
    let weight = 0;
    for (let index = step.first; index <= step.last; index += 1) {
      weight += tokenWeight(tokens[index]!, pauses);
    }
    weights[i] = weight;
    cumulative[i + 1] = cumulative[i]! + weight;
  });
  const wordCount = tokens.reduce((count, token) => count + (token.continues ? 0 : 1), 0);
  return { weights, cumulative, wordCount };
}

/**
 * Milliseconds per unit of weight at a given speed.
 *
 * Pacing is normalised so the chosen WPM is the true average over the whole
 * text, pauses included: reading N words at W wpm takes exactly N / W minutes.
 */
function msPerWeight(timeline: Timeline, wpm: number): number {
  const totalWeight = timeline.cumulative[timeline.weights.length] ?? 0;
  if (totalWeight === 0) return 0;
  return (60_000 * timeline.wordCount) / (wpm * totalWeight);
}

/** How long the token at `index` stays on screen. */
export function tokenDurationMs(timeline: Timeline, index: number, wpm: number): number {
  return (timeline.weights[index] ?? 0) * msPerWeight(timeline, wpm);
}

/** Reading time left from the start of the token at `index` to the end of the text. */
export function remainingMs(timeline: Timeline, index: number, wpm: number): number {
  const total = timeline.cumulative[timeline.weights.length] ?? 0;
  const done = timeline.cumulative[Math.min(Math.max(index, 0), timeline.weights.length)] ?? 0;
  return (total - done) * msPerWeight(timeline, wpm);
}
