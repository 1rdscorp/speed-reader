import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import type { PivotSplit } from '@/core';
import styles from './WordStage.module.css';

interface WordStageProps {
  /** The text to show, divided around its focus letter. */
  split: PivotSplit;
  /** Word size in CSS pixels. Text too wide for the stage is scaled down to fit. */
  fontSize: number;
  /** Height of the stage in CSS pixels. */
  height: number;
}

/** Breathing room kept between the text and the edges of the stage. */
const EDGE_MARGIN = 12;

/**
 * Shows text on the focus point. Purely visual: it is hidden from assistive
 * technology, which gets the surrounding controls and announcements instead.
 */
export function WordStage({ split, fontSize, height }: WordStageProps) {
  const word = useRef<HTMLDivElement>(null);

  // Long words, or several words at once, can be wider than half the stage.
  // Measure at full size, then shrink just enough that both sides fit.
  useLayoutEffect(() => {
    const element = word.current;
    if (!element) return;
    const fit = () => {
      element.style.setProperty('--fit', '1');
      const [before, pivot, after] = Array.from(element.children) as HTMLElement[];
      const widest = Math.max(before?.offsetWidth ?? 0, after?.offsetWidth ?? 0);
      const room = (element.clientWidth - (pivot?.offsetWidth ?? 0)) / 2 - EDGE_MARGIN;
      if (widest > room && room > 0) element.style.setProperty('--fit', String(room / widest));
    };
    fit();
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(fit);
    observer?.observe(element);
    return () => observer?.disconnect();
  }, [split.before, split.pivot, split.after, fontSize]);

  return (
    <div
      className={styles.stage}
      style={{ height, '--word-size': `${fontSize}px` } as CSSProperties}
      aria-hidden="true"
    >
      <span className={`${styles.tick} ${styles.tickTop}`} />
      <span className={`${styles.tick} ${styles.tickBottom}`} />
      <div ref={word} className={styles.word} data-testid="stage-word">
        <span className={styles.before}>{split.before}</span>
        <span className={styles.pivot}>{split.pivot}</span>
        <span className={styles.after}>{split.after}</span>
      </div>
    </div>
  );
}
