import { useEffect } from 'react';
import type { Player, Token } from '@/core';
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
  tokens: readonly Token[],
  textLength: number,
  player: Player,
): void {
  const { documents } = useServices();

  useEffect(() => {
    let lastStatus = player.getSnapshot().status;
    let lastSavedAt = 0;

    const save = () => {
      const { index, status } = player.getSnapshot();
      const token = tokens[index];
      if (!token) return;
      const finished = status === 'finished';
      lastSavedAt = Date.now();
      documents
        .saveProgress(documentId, {
          offset: finished ? textLength : token.start,
          fraction: finished ? 1 : index / tokens.length,
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
  }, [documents, documentId, tokens, textLength, player]);
}
