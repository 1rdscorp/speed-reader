import type { CSSProperties, RefObject } from 'react';
import type { PivotSplit, PlayerStatus } from '@/core';
import { formatClock, formatCount } from '@/lib/format';
import { SCREEN_COLORS, type ScreenColor } from '@/lib/settings';
import {
  CollapseIcon,
  ExpandIcon,
  ForwardIcon,
  PauseIcon,
  PlayIcon,
  ReadingSurface,
  RestartIcon,
  RewindIcon,
  WordStage,
} from '@/ui';
import { releaseFocusAfterPointer } from '../releaseFocus';
import type { ReaderActions } from '../useReaderShortcuts';
import styles from './ReaderCard.module.css';

/** How many words the skip buttons and arrow keys move. */
export const SKIP_WORDS = 10;

/** In full screen there is room for a bigger word than the size chosen for the page. */
const FULLSCREEN_SCALE = 1.6;

interface ReaderCardProps {
  split: PivotSplit;
  status: PlayerStatus;
  /** Position of the word on stage, counting from 1, and how many there are. */
  wordNumber: number;
  wordTotal: number;
  remainingMs: number;
  /** Position along the scrubber: the step on stage and how many steps there are. */
  step: number;
  stepCount: number;
  fontSize: number;
  dark: boolean;
  /** Name of the focus colour in use. */
  focusColor: string;
  wpm: number;
  /** The colour chosen for full screen, and how to change it. */
  screenColor: ScreenColor;
  onScreenColor: (color: ScreenColor) => void;
  /** The card's own element, so it can be shown full screen. */
  cardRef: RefObject<HTMLDivElement | null>;
  fullscreen: boolean;
  actions: ReaderActions;
  onSeek: (step: number) => void;
}

/** The reading area: the word on its focus point, with progress and transport under it. */
export function ReaderCard({
  split,
  status,
  wordNumber,
  wordTotal,
  remainingMs,
  step,
  stepCount,
  fontSize,
  dark,
  focusColor,
  wpm,
  screenColor,
  onScreenColor,
  cardRef,
  fullscreen,
  actions,
  onSeek,
}: ReaderCardProps) {
  const lastStep = Math.max(stepCount - 1, 1);
  const fraction = status === 'finished' ? 1 : step / lastStep;
  const playing = status === 'playing';
  // A colour chosen for full screen replaces the page's look while full screen lasts.
  const screen = fullscreen && screenColor !== 'auto' ? screenColor : undefined;
  const isDark = screen ? screen === 'dark' : dark;

  return (
    <ReadingSurface
      ref={cardRef}
      className={styles.card}
      dark={isDark}
      focus={focusColor}
      data-fullscreen={fullscreen || undefined}
      data-screen={screen}
      onClick={releaseFocusAfterPointer}
    >
      <div className={styles.meta}>
        <span>
          Word {formatCount(wordNumber)} of {formatCount(wordTotal)}
          {/* The speed control is out of sight in full screen, so say what it is set to. */}
          {fullscreen && ` · ${wpm} WPM`}
        </span>
        {fullscreen && (
          <span className={styles.screens} role="group" aria-label="Screen color">
            {SCREEN_COLORS.map((color) => (
              <button
                key={color.id}
                type="button"
                className={styles.screenChoice}
                data-color={color.id}
                aria-label={color.label}
                title={color.label}
                aria-pressed={screenColor === color.id}
                onClick={() => onScreenColor(color.id)}
              />
            ))}
          </span>
        )}
        <span className={styles.metaEnd}>
          {formatClock(status === 'finished' ? 0 : remainingMs)} left
          <button
            type="button"
            className={styles.expand}
            aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}
            title={fullscreen ? 'Exit full screen (F)' : 'Full screen (F)'}
            aria-pressed={fullscreen}
            onClick={actions.fullscreen}
          >
            {fullscreen ? <CollapseIcon /> : <ExpandIcon />}
          </button>
        </span>
      </div>

      <div className={styles.stageArea} onClick={actions.toggle}>
        <WordStage
          split={split}
          fontSize={fullscreen ? fontSize * FULLSCREEN_SCALE : fontSize}
          height={fullscreen ? 'min(46dvh, 26rem)' : 200}
        />
      </div>

      <input
        type="range"
        className={styles.scrubber}
        style={{ '--fill': `${fraction * 100}%` } as CSSProperties}
        min={0}
        max={lastStep}
        value={step}
        onChange={(event) => onSeek(Number(event.target.value))}
        aria-label="Position in text"
        aria-valuetext={`${Math.round(fraction * 100)}%`}
      />

      <div className={styles.transport}>
        <button
          type="button"
          className={styles.round}
          aria-label={`Back ${SKIP_WORDS} words`}
          onClick={actions.back}
        >
          <RewindIcon />
        </button>
        <button
          type="button"
          className={styles.play}
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={actions.toggle}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          type="button"
          className={styles.round}
          aria-label={`Forward ${SKIP_WORDS} words`}
          onClick={actions.forward}
        >
          <ForwardIcon />
        </button>
        <button
          type="button"
          className={styles.round}
          aria-label="Restart"
          onClick={actions.restart}
        >
          <RestartIcon />
        </button>
      </div>
    </ReadingSurface>
  );
}
