import { useState } from 'react';
import { Link } from 'react-router';
import { paths } from '@/lib/paths';
import {
  DarkReaderSetting,
  FOCUS_COLORS,
  FontSizeSetting,
  PunctuationSetting,
  SpeedSetting,
  WordsPerFrameSetting,
  useSettings,
} from '@/lib/settings';
import { releaseFocusHandlers } from '../releaseFocus';
import styles from './ControlsPanel.module.css';
import { SKIP_WORDS } from './ReaderCard';

/** The settings worth having at hand while reading. The Settings page has them all. */
export function ControlsPanel() {
  const { focusColor } = useSettings();
  const colorName = FOCUS_COLORS.find((color) => color.id === focusColor)?.label.toLowerCase();
  const [releaseFocus] = useState(releaseFocusHandlers);

  return (
    <aside className={styles.panel} aria-label="Reading controls" {...releaseFocus}>
      <h2 className={styles.title}>Controls</h2>

      <SpeedSetting />
      <WordsPerFrameSetting />
      <FontSizeSetting />
      <DarkReaderSetting />
      <PunctuationSetting />

      <p className={styles.tip}>
        Tip: keep your eyes on the {colorName} marks. The highlighted letter always lands in the
        same spot.
      </p>
      <p className={`${styles.tip} ${styles.keys}`}>
        Keyboard: <kbd>Space</kbd> play or pause ·{' '}
        <span className={styles.together}>
          <kbd>←</kbd> <kbd>→</kbd> skip {SKIP_WORDS} words
        </span>{' '}
        ·{' '}
        <span className={styles.together}>
          <kbd>Shift</kbd> + <kbd>←</kbd> <kbd>→</kbd> sentence
        </span>{' '}
        ·{' '}
        <span className={styles.together}>
          <kbd>↑</kbd> <kbd>↓</kbd> speed
        </span>{' '}
        · <kbd>R</kbd> restart ·{' '}
        <span className={styles.together}>
          <kbd>F</kbd> full screen
        </span>
      </p>
      <Link to={paths.settings()} className={styles.more}>
        All settings
      </Link>
    </aside>
  );
}
