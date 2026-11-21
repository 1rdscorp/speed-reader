import { useRef, useState } from 'react';
import { APP_NAME } from '@/lib/config';
import { useServices } from '@/lib/services';
import { HIDDEN_WORDS, type OwnStereogram } from '@/lib/stereograms';
import { useAsync } from '@/lib/useAsync';
import { useFullscreen } from '@/lib/useFullscreen';
import { Button, CollapseIcon, ExpandIcon, IconButton } from '@/ui';
import { AddOwn } from './AddOwn';
import { BuiltInPicture } from './BuiltInPicture';
import { OwnPicture } from './OwnPicture';
import styles from './Stereograms.module.css';
import { styleName } from './textures';

export function StereogramsPage() {
  const { stereograms } = useServices();
  const saved = useAsync(() => stereograms.list(), [stereograms]);
  const own: OwnStereogram[] = saved.status === 'ready' ? saved.data : [];
  const total = HIDDEN_WORDS.length + own.length;

  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const viewerRef = useRef<HTMLElement>(null);
  const fullscreen = useFullscreen(viewerRef);

  // A picture that was removed while it was showing leaves the position past the end.
  const index = Math.min(position, total - 1);
  const word = HIDDEN_WORDS[index];
  const ownEntry = own[index - HIDDEN_WORDS.length];

  function show(next: number) {
    setPosition((next + total) % total);
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

      <section
        ref={viewerRef}
        className={styles.viewer}
        aria-label="Stereogram"
        data-fullscreen={fullscreen.active || undefined}
      >
        <div className={styles.meta}>
          <span>
            Stereogram {index + 1} of {total}
            {ownEntry ? ` · ${ownEntry.name}` : ''}
            {word !== undefined && <span> · {styleName(index)}</span>}
          </span>
          <IconButton
            label={fullscreen.active ? 'Exit full screen' : 'Full screen'}
            aria-pressed={fullscreen.active}
            onClick={fullscreen.toggle}
          >
            {fullscreen.active ? <CollapseIcon /> : <ExpandIcon />}
          </IconButton>
        </div>

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
          <Button variant="primary" onClick={() => setRevealed((shown) => !shown)}>
            {revealed ? 'Hide image' : 'Show image'}
          </Button>
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
