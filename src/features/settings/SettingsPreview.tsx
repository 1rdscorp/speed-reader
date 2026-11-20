import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_PAUSES, NO_PAUSES, splitFrame, tokenize } from '@/core';
import { useSettings } from '@/lib/settings';
import { usePlayback } from '@/lib/usePlayback';
import { Button, ReadingSurface, WordStage } from '@/ui';
import styles from './SettingsPage.module.css';

const TEXT =
  'Reading settings change how every text looks and moves. Change one, and this preview follows: the size of the word, the color of its focus letter, how many words arrive together, and how long the pauses are.';
/** How long the last word stays up before the preview starts over. */
const LOOP_PAUSE_MS = 1_200;

/** A small reader that shows the current settings at work, still or playing on a loop. */
export function SettingsPreview() {
  const { wpm, wordsPerFrame, punctuationPauses, fontSize, darkReader, focusColor } = useSettings();
  const tokens = useMemo(() => tokenize(TEXT), []);
  const { player, frame, status } = usePlayback(tokens, {
    wpm,
    wordsPerFrame,
    pauses: punctuationPauses ? DEFAULT_PAUSES : NO_PAUSES,
  });
  // Whether the person asked for it to play; it then loops until they stop it.
  const [looping, setLooping] = useState(false);

  useEffect(() => {
    if (!looping || status !== 'finished') return;
    const timer = setTimeout(() => player.play(), LOOP_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [player, looping, status]);

  function toggle() {
    if (looping) player.pause();
    else player.play();
    setLooping(!looping);
  }

  return (
    <ReadingSurface className={styles.preview} dark={darkReader} focus={focusColor}>
      <div className={styles.previewMeta}>
        <span>Preview</span>
        <span>{wpm} WPM</span>
      </div>
      <WordStage
        split={frame ? splitFrame(frame) : { before: '', pivot: '', after: '' }}
        fontSize={fontSize}
        height={180}
      />
      <div className={styles.previewActions}>
        <Button onClick={toggle}>{looping ? 'Pause preview' : 'Play preview'}</Button>
      </div>
    </ReadingSurface>
  );
}
