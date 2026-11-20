import styles from './Logo.module.css';

/** The site's mark and name: lines of text with a red focus point. */
export function Logo() {
  return (
    <span className={styles.logo}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        strokeWidth="2.2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4 8h12M4 14h20M4 20h8" className={styles.lines} />
        <circle cx="22" cy="8" r="2.5" className={styles.dot} />
      </svg>
      <span className={styles.name}>Speed Reader</span>
    </span>
  );
}
