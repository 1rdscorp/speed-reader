import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  DEFAULT_PAUSES,
  Player,
  buildFrames,
  buildTimeline,
  frameIndexOf,
  type Frame,
  type Pauses,
  type PlayerSnapshot,
  type Timeline,
  type Token,
} from '@/core';

export interface PlaybackOptions {
  wpm: number;
  /** How many words are shown together. */
  wordsPerFrame?: number;
  /** Pass a constant such as DEFAULT_PAUSES or NO_PAUSES: a new object each render would rebuild the pacing. */
  pauses?: Pauses;
  /** Token to start on. Read once, when the player is created. */
  startToken?: number;
}

export interface Playback extends PlayerSnapshot {
  player: Player;
  frames: readonly Frame[];
  timeline: Timeline;
  /** What is on stage now; undefined only for an empty text. */
  frame: Frame | undefined;
}

/**
 * Run the reading engine over a text: owns a Player for the lifetime of the
 * component, re-renders as it moves, and keeps its place when the speed,
 * grouping or pauses change. For a different text, remount (change `key`).
 */
export function usePlayback(tokens: readonly Token[], options: PlaybackOptions): Playback {
  const { wpm, wordsPerFrame = 1, pauses = DEFAULT_PAUSES } = options;

  const frames = useMemo(() => buildFrames(tokens, wordsPerFrame), [tokens, wordsPerFrame]);
  const timeline = useMemo(() => buildTimeline(tokens, pauses, frames), [tokens, pauses, frames]);

  const [player] = useState(
    () => new Player(timeline, { wpm, startIndex: frameIndexOf(frames, options.startToken ?? 0) }),
  );
  const snapshot = useSyncExternalStore(player.subscribe, player.getSnapshot);

  // When grouping or pauses change, the same text gets new frames. Hand them
  // to the player at the frame holding the word it was on. A layout effect,
  // so the stage never paints an old index against new frames.
  const running = useRef({ frames, timeline });
  useLayoutEffect(() => {
    if (running.current.timeline === timeline) return;
    const token = running.current.frames[player.getSnapshot().index]?.first ?? 0;
    running.current = { frames, timeline };
    player.retime(timeline, frameIndexOf(frames, token));
  }, [player, frames, timeline]);

  useEffect(() => {
    player.setWpm(wpm);
  }, [player, wpm]);

  // Stop the clock when the component goes away.
  useEffect(() => () => player.pause(), [player]);

  return {
    player,
    frames,
    timeline,
    frame: frames[Math.min(snapshot.index, frames.length - 1)],
    ...snapshot,
  };
}
