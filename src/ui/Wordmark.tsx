import { splitAtPivot } from '@/core';
import styles from './Wordmark.module.css';

/** The logotype, marked up the way the reader marks every word: around its pivot letter. */
export function Wordmark() {
  const { before, pivot, after } = splitAtPivot('speedreader');
  return (
    <span className={styles.wordmark}>
      {before}
      <span className={styles.pivot}>{pivot}</span>
      {after}
    </span>
  );
}
