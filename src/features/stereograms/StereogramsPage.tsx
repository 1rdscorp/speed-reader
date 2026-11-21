import { useEffect, useRef, useState } from 'react';
import { APP_NAME } from '@/lib/config';
import { useServices } from '@/lib/services';
import { shuffledOrder, type OwnStereogram } from '@/lib/stereograms';
import { useAsync } from '@/lib/useAsync';
import { useFullscreen } from '@/lib/useFullscreen';
import { Button, CollapseIcon, ExpandIcon, IconButton } from '@/ui';
import { AddOwn } from './AddOwn';
import { BuiltInPicture } from './BuiltInPicture';
import { OwnPicture } from './OwnPicture';
import { BUILT_IN, pictureUrl } from './pictures';
import styles from './Stereograms.module.css';
import { styleName } from './textures';

export function StereogramsPage() {
  const { stereograms } = useServices();
  const saved = useAsync(() => stereograms.list(), [stereograms]);
  const own: OwnStereogram[] = saved.status === 'ready' ? saved.data : [];
  const total = BUILT_IN.length + own.length;

  // The built-in pictures come in a new order on every visit; your own follow them.
  const [order] = useState(() => shuffledOrder(BUILT_IN.length, Math.random));
  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const viewerRef = useRef<HTMLElement>(null);
  const fullscreen = useFullscreen(viewerRef);

  // A picture that was removed while it was showing leaves the position past the end.
  const index = Math.min(position, total - 1);
  // Which built-in picture is at this place in the order.
  const picture = order[index] ?? -1;
  const builtIn = BUILT_IN[picture];
  const ownEntry = own[index - BUILT_IN.length];

  function show(next: number) {
    setPosition((next + total) % total);
    setRevealed(false);
  }

  // The left and right arrow keys step through the pictures, unless something is being typed.
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.target instanceof Element && event.target.closest('input, textarea, select')) {
        return;
      }
      event.preventDefault();
      setPosition((index + (event.key === 'ArrowRight' ? 1 : -1) + total) % total);
      setRevealed(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [index, total]);

  return (
    <div className={`container ${styles.page}`}>
      <title>{`Stereograms · ${APP_NAME}`}</title>
      <header>
        <h1 className={styles.title}>Stereograms</h1>
        <p className={styles.lede}>
          Each picture hides a word. Look at the two dots at the top and relax your eyes, as if
          looking through the screen, until you see three dots. Hold that, and the word rises out of
          the pattern. The left and right arrow keys change the picture.
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
            {builtIn && <span> · {builtIn.kind ?? styleName(picture)}</span>}
          </span>
          <IconButton
            label={fullscreen.active ? 'Exit full screen' : 'Full screen'}
            aria-pressed={fullscreen.active}
            onClick={fullscreen.toggle}
          >
            {fullscreen.active ? <CollapseIcon /> : <ExpandIcon />}
          </IconButton>
        </div>

        {builtIn?.file && !revealed ? (
          <img
            className={styles.picture}
            src={pictureUrl(builtIn.file)}
            alt={`Stereogram ${index + 1}`}
            width={3840}
            height={2160}
          />
        ) : builtIn ? (
          <BuiltInPicture
            word={builtIn.word}
            index={picture}
            number={index + 1}
            revealed={revealed}
          />
        ) : (
          ownEntry && <OwnPicture entry={ownEntry} />
        )}

        {revealed && (
          <p className={styles.answer} role="status">
            {builtIn
              ? `The hidden word is ${builtIn.word}.`
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
        onView={(entry) => show(BUILT_IN.length + own.indexOf(entry))}
      />
    </div>
  );
}
