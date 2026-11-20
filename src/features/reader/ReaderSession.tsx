import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  DEFAULT_PAUSES,
  NO_PAUSES,
  Player,
  WPM_STEP,
  buildFrames,
  buildTimeline,
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
  const { wpm, fontSize, darkReader, wordsPerFrame, punctuationPauses } = useSettings();

  const tokens = useMemo(() => tokenize(document.text), [document.text]);
  const frames = useMemo(() => buildFrames(tokens, wordsPerFrame), [tokens, wordsPerFrame]);
  const timeline = useMemo(
    () => buildTimeline(tokens, punctuationPauses ? DEFAULT_PAUSES : NO_PAUSES, frames),
    [tokens, punctuationPauses, frames],
  );

  const [player] = useState(() => {
    // Resume where the reader left off; a finished text starts over.
    const startToken =
      document.progress.fraction >= 1 ? 0 : indexAtOffset(tokens, document.progress.offset);
    return new Player(timeline, { wpm, startIndex: frameIndexOf(frames, startToken) });
  });
  const { index, status } = useSyncExternalStore(player.subscribe, player.getSnapshot);

  // When the words-at-a-time or pause setting changes, the same text gets new
  // frames. Hand them to the player at the frame holding the word it was on.
  // A layout effect, so the stage never paints an old index against new frames.
  const playing = useRef({ frames, timeline });
  useLayoutEffect(() => {
    if (playing.current.timeline === timeline) return;
    const token = playing.current.frames[player.getSnapshot().index]?.first ?? 0;
    playing.current = { frames, timeline };
    player.retime(timeline, frameIndexOf(frames, token));
  }, [player, frames, timeline]);

  useEffect(() => {
    player.setWpm(wpm);
  }, [player, wpm]);

  // Stop the clock when the reader goes away.
  useEffect(() => () => player.pause(), [player]);

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

  const frame = frames[Math.min(index, frames.length - 1)];
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
        actions={actions}
        onSeek={(step) => player.seek(step)}
      />
      <p role="status" className="visuallyHidden">
        {announcement}
      </p>
    </>
  );
}
