import { MAX_WORDS_PER_FRAME, MAX_WPM, MIN_WPM, WPM_STEP } from '@/core';
import { useServices } from '@/lib/services';
import { FONT_SIZE_STEP, MAX_FONT_SIZE, MIN_FONT_SIZE, useSettings } from '@/lib/settings';
import { releaseFocusAfterPointer } from '../releaseFocus';
import styles from './ControlsPanel.module.css';
import { SKIP_WORDS } from './ReaderCard';

const WORD_CHOICES = Array.from({ length: MAX_WORDS_PER_FRAME }, (_, i) => i + 1);

/** How the text is shown and paced. Every choice is saved and applies to whatever is read next. */
export function ControlsPanel() {
  const { settings: store } = useServices();
  const settings = useSettings();

  return (
    <aside
      className={styles.panel}
      aria-label="Reading controls"
      onClick={releaseFocusAfterPointer}
    >
      <h2 className={styles.title}>Controls</h2>

      <div className={styles.field}>
        <div className={styles.row}>
          <label htmlFor="wpm" className={styles.label}>
            Speed
          </label>
          <output htmlFor="wpm" className={styles.value}>
            {settings.wpm} WPM
          </output>
        </div>
        <input
          id="wpm"
          type="range"
          className={styles.slider}
          min={MIN_WPM}
          max={MAX_WPM}
          step={WPM_STEP}
          value={settings.wpm}
          onChange={(event) => store.update({ wpm: Number(event.target.value) })}
        />
        <div className={styles.ends} aria-hidden="true">
          <span>{MIN_WPM}</span>
          <span>{MAX_WPM}</span>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="words-per-frame" className={styles.label}>
          Words at a time
        </label>
        <select
          id="words-per-frame"
          className={styles.select}
          value={settings.wordsPerFrame}
          onChange={(event) => {
            store.update({ wordsPerFrame: Number(event.target.value) });
            event.target.blur();
          }}
        >
          {WORD_CHOICES.map((count) => (
            <option key={count} value={count}>
              {count === 1 ? '1 word' : `${count} words`}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <div className={styles.row}>
          <label htmlFor="font-size" className={styles.label}>
            Font size
          </label>
          <output htmlFor="font-size" className={styles.quietValue}>
            {settings.fontSize} px
          </output>
        </div>
        <input
          id="font-size"
          type="range"
          className={styles.slider}
          min={MIN_FONT_SIZE}
          max={MAX_FONT_SIZE}
          step={FONT_SIZE_STEP}
          value={settings.fontSize}
          onChange={(event) => store.update({ fontSize: Number(event.target.value) })}
        />
      </div>

      <label className={styles.toggle}>
        Dark reading area
        <input
          type="checkbox"
          checked={settings.darkReader}
          onChange={(event) => store.update({ darkReader: event.target.checked })}
        />
      </label>

      <label className={styles.toggle}>
        Pause longer on punctuation
        <input
          type="checkbox"
          checked={settings.punctuationPauses}
          onChange={(event) => store.update({ punctuationPauses: event.target.checked })}
        />
      </label>

      <p className={styles.tip}>
        Tip: keep your eyes on the red marks. The highlighted letter always lands in the same spot.
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
        · <kbd>R</kbd> restart
      </p>
    </aside>
  );
}
