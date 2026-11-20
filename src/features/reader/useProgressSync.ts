import { useEffect } from 'react';
import type { Frame, Player, Token } from '@/core';
import { useServices } from '@/lib/services';

/** While playing, the position is saved at most this often. */
const SAVE_INTERVAL_MS = 5_000;

/**
 * Keep the saved reading position up to date: whenever playback starts, stops
 * or finishes, periodically while it runs, and when the reader or tab goes away.
 * Also pauses playback when the tab is hidden, since nobody is reading.
 */
export function useProgressSync(
  documentId: string,
  textLength: number,
  tokens: readonly Token[],
  frames: readonly Frame[],
  player: Player,
): void {
  const { documents } = useServices();

  useEffect(() => {
    let lastStatus = player.getSnapshot().status;
    let lastSavedAt = 0;

    const save = () => {
      const { index, status } = player.getSnapshot();
      const frame = frames[index];
      const token = frame && tokens[frame.first];
      if (!frame || !token) return;
      const finished = status === 'finished';
      lastSavedAt = Date.now();
      documents
        .saveProgress(documentId, {
          offset: finished ? textLength : token.start,
          fraction: finished ? 1 : frame.first / tokens.length,
        })
        // Losing a position save is not worth interrupting reading for.
        .catch(() => {});
    };

    const unsubscribe = player.subscribe(() => {
      const { status } = player.getSnapshot();
      if (status !== lastStatus || Date.now() - lastSavedAt >= SAVE_INTERVAL_MS) save();
      lastStatus = status;
    });

    const handleVisibility = () => {
      if (document.visibilityState !== 'hidden') return;
      player.pause();
      save();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibility);
      save();
    };
  }, [documents, documentId, textLength, tokens, frames, player]);
}
