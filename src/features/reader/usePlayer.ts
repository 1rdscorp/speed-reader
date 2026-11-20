import { useEffect, useState, useSyncExternalStore } from 'react';
import { Player, type PlayerSnapshot, type Timeline } from '@/core';

/**
 * Own a Player for the lifetime of the component and re-render as it moves.
 * `timeline` and `startIndex` are read once; remount (change `key`) for a new text.
 */
export function usePlayer(
  timeline: Timeline,
  wpm: number,
  startIndex: number,
): PlayerSnapshot & { player: Player } {
  const [player] = useState(() => new Player(timeline, { wpm, startIndex }));
  const snapshot = useSyncExternalStore(player.subscribe, player.getSnapshot);

  useEffect(() => {
    player.setWpm(wpm);
  }, [player, wpm]);

  // Stop the clock when the reader goes away.
  useEffect(() => () => player.pause(), [player]);

  return { player, ...snapshot };
}
