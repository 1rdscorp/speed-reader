import type { CSSProperties, MouseEvent } from 'react';
import { MAX_WPM, MIN_WPM, type PlayerStatus } from '@/core';
import { formatClock } from '@/lib/format';
import {
  BackSentenceIcon,
  ForwardSentenceIcon,
  IconButton,
  MinusIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RestartIcon,
} from '@/ui';
import type { ReaderActions } from '../useReaderShortcuts';
import styles from './Controls.module.css';

interface ControlsProps {
  status: PlayerStatus;
  index: number;
  length: number;
  remainingMs: number;
  wpm: number;
  actions: ReaderActions;
  onSeek: (index: number) => void;
}

const PLAY_BUTTON = {
  playing: { label: 'Pause', icon: <PauseIcon /> },
  paused: { label: 'Play', icon: <PlayIcon /> },
  finished: { label: 'Read again', icon: <RestartIcon /> },
} satisfies Record<PlayerStatus, unknown>;

/**
 * After a mouse or touch press, give focus back to the page. Otherwise the
 * pressed control keeps it, and Space would repeat that control instead of
 * toggling playback. Keyboard users (event.detail === 0) keep their focus.
 */
function releaseFocusAfterPointer(event: MouseEvent) {
  if (event.detail > 0 && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

export function Controls({
  status,
  index,
  length,
  remainingMs,
  wpm,
  actions,
  onSeek,
}: ControlsProps) {
  const lastIndex = Math.max(length - 1, 1);
  const fraction = status === 'finished' ? 1 : index / lastIndex;
  const play = PLAY_BUTTON[status];

  return (
    <div className={styles.controls} onClick={releaseFocusAfterPointer}>
      <input
        type="range"
        className={styles.scrubber}
        style={{ '--fill': `${fraction * 100}%` } as CSSProperties}
        min={0}
        max={lastIndex}
        value={index}
        onChange={(event) => onSeek(Number(event.target.value))}
        aria-label="Position in text"
        aria-valuetext={`${Math.round(fraction * 100)}%`}
      />

      <div className={styles.bar}>
        <p className={styles.status}>
          {status === 'finished' ? (
            'Done'
          ) : (
            <>
              <span className={styles.clock}>{formatClock(remainingMs)}</span> left
            </>
          )}
        </p>

        <div className={styles.transport}>
          <IconButton label="Back a sentence" onClick={actions.back}>
            <BackSentenceIcon />
          </IconButton>
          <button
            type="button"
            className={styles.play}
            aria-label={play.label}
            onClick={actions.toggle}
          >
            {play.icon}
          </button>
          <IconButton label="Forward a sentence" onClick={actions.forward}>
            <ForwardSentenceIcon />
          </IconButton>
        </div>

        <div className={styles.speed} role="group" aria-label="Reading speed">
          <IconButton label="Slower" disabled={wpm <= MIN_WPM} onClick={actions.slower}>
            <MinusIcon />
          </IconButton>
          <output className={styles.speedValue}>
            <span className={styles.speedNumber}>{wpm}</span> wpm
          </output>
          <IconButton label="Faster" disabled={wpm >= MAX_WPM} onClick={actions.faster}>
            <PlusIcon />
          </IconButton>
        </div>
      </div>

      <p className={styles.keys}>
        <kbd>Space</kbd> play · <kbd>←</kbd> <kbd>→</kbd> sentence · <kbd>↑</kbd> <kbd>↓</kbd> speed
        · <kbd>R</kbd> restart · <kbd>Esc</kbd> close
      </p>
    </div>
  );
}
