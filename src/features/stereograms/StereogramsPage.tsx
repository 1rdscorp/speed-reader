import { useEffect, useState } from 'react';
import { APP_NAME } from '@/lib/config';
import { useServices } from '@/lib/services';
import { HIDDEN_WORDS, type OwnStereogram } from '@/lib/stereograms';
import { useAsync } from '@/lib/useAsync';
import { Button } from '@/ui';
import { AddOwn } from './AddOwn';
import { BuiltInPicture } from './BuiltInPicture';
import { OwnPicture } from './OwnPicture';
import styles from './Stereograms.module.css';

/** How long each picture is shown before the answer is offered. */
const SECONDS = 30;

export function StereogramsPage() {
  const { stereograms } = useServices();
  const saved = useAsync(() => stereograms.list(), [stereograms]);
  const own: OwnStereogram[] = saved.status === 'ready' ? saved.data : [];
  const total = HIDDEN_WORDS.length + own.length;

  const [position, setPosition] = useState(0);
  const [remaining, setRemaining] = useState(SECONDS);
  const [paused, setPaused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // A picture that was removed while it was showing leaves the position past the end.
  const index = Math.min(position, total - 1);
  const word = HIDDEN_WORDS[index];
  const ownEntry = own[index - HIDDEN_WORDS.length];
  const timeUp = remaining === 0;

  useEffect(() => {
    if (paused || timeUp) return;
    const timer = setInterval(() => setRemaining((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearInterval(timer);
  }, [paused, timeUp, index]);

  function show(next: number) {
    setPosition((next + total) % total);
    setRemaining(SECONDS);
    setPaused(false);
    setRevealed(false);
  }

  return (
    <div className={`container ${styles.page}`}>
      <title>{`Stereograms · ${APP_NAME}`}</title>
      <header>
        <h1 className={styles.title}>Stereograms</h1>
        <p className={styles.lede}>
          Each picture hides a word. Look at the two dots at the top and relax your eyes, as if
          looking through the screen, until you see three dots. Hold that, and the word rises out of
          the pattern.
        </p>
      </header>

      <section className={styles.viewer} aria-label="Stereogram">
        <div className={styles.meta}>
          <span>
            Stereogram {index + 1} of {total}
            {ownEntry ? ` · ${ownEntry.name}` : ''}
          </span>
          <span className={styles.time} role="timer" aria-label="Time left">
            0:{String(remaining).padStart(2, '0')}
          </span>
        </div>
        <div
          className={styles.bar}
          style={{ '--left': remaining / SECONDS } as React.CSSProperties}
        />

        {word !== undefined ? (
          <BuiltInPicture word={word} index={index} revealed={revealed} />
        ) : (
          ownEntry && <OwnPicture entry={ownEntry} />
        )}

        {revealed && (
          <p className={styles.answer} role="status">
            {word !== undefined
              ? `The hidden word is ${word}.`
              : ownEntry?.answer
                ? `Hidden in it: ${ownEntry.answer}`
                : 'No answer was saved with this picture.'}
          </p>
        )}

        <div className={styles.actions}>
          <Button onClick={() => show(index - 1)}>Previous</Button>
          {timeUp ? (
            <Button variant="primary" onClick={() => setRevealed((shown) => !shown)}>
              {revealed ? 'Hide image' : 'Show image'}
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setPaused((value) => !value)}>
              {paused ? 'Resume' : 'Pause'}
            </Button>
          )}
          <Button onClick={() => show(index + 1)}>Next</Button>
        </div>
      </section>

      <AddOwn
        own={own}
        onChanged={saved.reload}
        onView={(entry) => show(HIDDEN_WORDS.length + own.indexOf(entry))}
      />
    </div>
  );
}
