import { useEffect, useMemo, type CSSProperties } from 'react';
import { splitFrame, tokenize } from '@/core';
import { usePlayback } from '@/lib/usePlayback';
import { WordStage } from '@/ui';
import styles from './HomePage.module.css';

const TEXT = 'Reading one word at a time keeps your eyes still, so the words come to you instead.';
const WPM = 350;
/** How long the last word stays up before the preview starts over. */
const LOOP_PAUSE_MS = 1_400;

/** The reader in miniature, playing a sentence on a loop with the real engine. */
export function LivePreview() {
  const tokens = useMemo(() => tokenize(TEXT), []);
  const { player, frames, frame, index, status } = usePlayback(tokens, { wpm: WPM });

  useEffect(() => {
    // People who ask for less motion get the first word, held still.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    player.play();
  }, [player]);

  useEffect(() => {
    if (status !== 'finished') return;
    const timer = setTimeout(() => player.play(), LOOP_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [player, status]);

  const fraction = status === 'finished' ? 1 : index / Math.max(frames.length - 1, 1);

  return (
    <div className={styles.previewCard}>
      <div className={styles.previewMeta}>
        <span>Live preview</span>
        <strong>{WPM} WPM</strong>
      </div>
      <WordStage
        split={frame ? splitFrame(frame) : { before: '', pivot: '', after: '' }}
        fontSize={56}
        height={150}
      />
      <div className={styles.bar} aria-hidden="true">
        <span style={{ '--fill': `${fraction * 100}%` } as CSSProperties} />
      </div>
    </div>
  );
}
