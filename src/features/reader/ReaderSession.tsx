import { useMemo, useState } from 'react';
import {
  DEFAULT_PAUSES,
  NO_PAUSES,
  WPM_STEP,
  frameIndexOf,
  indexAtOffset,
  nextSentence,
  previousSentence,
  remainingMs,
  splitFrame,
  tokenize,
} from '@/core';
import type { ReadingDocument } from '@/lib/documents';
import { useServices } from '@/lib/services';
import { useSettings } from '@/lib/settings';
import { usePlayback } from '@/lib/usePlayback';
import { ReaderCard, SKIP_WORDS } from './components/ReaderCard';
import styles from './Reader.module.css';
import { useProgressSync } from './useProgressSync';
import { useReaderShortcuts, type ReaderActions } from './useReaderShortcuts';

/**
 * One sitting with one document. Mount with `key={document.id}`: the text is
 * split into words and the player created once, for the lifetime of the component.
 */
export function ReaderSession({ document }: { document: ReadingDocument }) {
  const { settings } = useServices();
  const { wpm, fontSize, darkReader, focusColor, wordsPerFrame, punctuationPauses } = useSettings();

  const tokens = useMemo(() => tokenize(document.text), [document.text]);
  // Resume where the reader left off; a finished text starts over.
  const [startToken] = useState(() =>
    document.progress.fraction >= 1 ? 0 : indexAtOffset(tokens, document.progress.offset),
  );
  const { player, frames, timeline, frame, index, status } = usePlayback(tokens, {
    wpm,
    wordsPerFrame,
    pauses: punctuationPauses ? DEFAULT_PAUSES : NO_PAUSES,
    startToken,
  });

  useProgressSync(document.id, document.text.length, tokens, frames, player);

  const actions = useMemo<ReaderActions>(() => {
    const current = () => frames[player.getSnapshot().index]?.first ?? 0;
    const seekToken = (token: number) => {
      const clamped = Math.min(Math.max(token, 0), tokens.length - 1);
      player.seek(frameIndexOf(frames, clamped));
    };
    return {
      toggle: () => player.toggle(),
      back: () => seekToken(current() - SKIP_WORDS),
      forward: () => seekToken(current() + SKIP_WORDS),
      previousSentence: () => seekToken(previousSentence(tokens, current())),
      nextSentence: () => seekToken(nextSentence(tokens, current())),
      restart: () => player.seek(0),
      faster: () => settings.update({ wpm: settings.get().wpm + WPM_STEP }),
      slower: () => settings.update({ wpm: settings.get().wpm - WPM_STEP }),
    };
  }, [player, tokens, frames, settings]);
  useReaderShortcuts(actions);

  const wordNumber = (frame?.first ?? 0) + 1;
  const announcement = {
    playing: `Playing at ${wpm} words per minute`,
    paused: `Paused at word ${wordNumber} of ${tokens.length}`,
    finished: 'Finished',
  }[status];

  return (
    <>
      <h1 className={styles.title}>{document.title}</h1>
      <ReaderCard
        split={frame ? splitFrame(frame) : { before: '', pivot: '', after: '' }}
        status={status}
        wordNumber={wordNumber}
        wordTotal={tokens.length}
        remainingMs={remainingMs(timeline, index, wpm)}
        step={index}
        stepCount={frames.length}
        fontSize={fontSize}
        dark={darkReader}
        focusColor={focusColor}
        actions={actions}
        onSeek={(step) => player.seek(step)}
      />
      <p role="status" className="visuallyHidden">
        {announcement}
      </p>
    </>
  );
}
