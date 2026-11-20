/**
 * The reading engine: text in, paced tokens out. Framework-free by design
 * (enforced by the linter) so it can be tested, reused and reasoned about alone.
 */
export { graphemes } from './graphemes';
export { nextSentence, previousSentence, sentenceStart, indexAtOffset } from './navigation';
export { splitAtPivot, type PivotSplit } from './orp';
export {
  Player,
  type PlayerOptions,
  type PlayerSnapshot,
  type PlayerStatus,
  type Scheduler,
} from './player';
export {
  DEFAULT_PAUSES,
  DEFAULT_WPM,
  MAX_WPM,
  MIN_WPM,
  WPM_STEP,
  buildTimeline,
  clampWpm,
  remainingMs,
  tokenDurationMs,
  tokenWeight,
  type Pauses,
  type Timeline,
} from './timing';
export { MAX_TOKEN_LENGTH, countWords, tokenize, type Boundary, type Token } from './tokenize';
