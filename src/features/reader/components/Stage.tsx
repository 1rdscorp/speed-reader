import { splitAtPivot, type PlayerStatus } from '@/core';
import styles from './Stage.module.css';

interface StageProps {
  /** The token text to show. */
  word: string;
  status: PlayerStatus;
  /** True before any reading has happened in this session's text. */
  atStart: boolean;
  onToggle: () => void;
}

function hintFor(status: PlayerStatus, atStart: boolean): string {
  if (status === 'playing') return '';
  if (status === 'finished') return 'Finished · press space to read again';
  return atStart ? 'Press space or tap to start' : 'Paused';
}

/**
 * The reading stage. Purely visual: it is hidden from assistive technology,
 * which gets the play controls and status announcements instead.
 */
export function Stage({ word, status, atStart, onToggle }: StageProps) {
  const { before, pivot, after } = splitAtPivot(word);
  return (
    <div className={styles.stage} onClick={onToggle}>
      <div className={styles.frame} aria-hidden="true">
        <div className={`${styles.rule} ${styles.ruleTop}`} />
        <div className={styles.word} data-testid="stage-word">
          <span className={styles.pivot}>
            <span className={styles.before}>{before}</span>
            {pivot}
            <span className={styles.after}>{after}</span>
          </span>
        </div>
        <div className={`${styles.rule} ${styles.ruleBottom}`} />
        <p className={styles.hint}>
          <span className={styles.hintText}>{hintFor(status, atStart)}</span>
        </p>
      </div>
    </div>
  );
}
