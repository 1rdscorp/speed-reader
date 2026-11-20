import { useCallback, useEffect, useRef, useState } from 'react';
import type { DocumentMeta } from '@/lib/documents';
import { useServices } from '@/lib/services';

/** How long a removal can be taken back. */
const UNDO_WINDOW_MS = 8_000;

/**
 * Removing a book should be one click, and so should changing your mind. A
 * removed document is hidden at once but only deleted when the undo window
 * closes, the next removal starts, or the page is left.
 */
export function useUndoableRemoval() {
  const { documents } = useServices();
  const [pending, setPending] = useState<DocumentMeta | null>(null);
  const pendingRef = useRef<DocumentMeta | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const settle = useCallback(
    (action: 'delete' | 'keep') => {
      clearTimeout(timer.current);
      const document = pendingRef.current;
      pendingRef.current = null;
      setPending(null);
      if (document && action === 'delete') void documents.remove(document.id);
    },
    [documents],
  );

  const remove = useCallback(
    (document: DocumentMeta) => {
      settle('delete');
      pendingRef.current = document;
      setPending(document);
      timer.current = setTimeout(() => settle('delete'), UNDO_WINDOW_MS);
    },
    [settle],
  );

  const undo = useCallback(() => settle('keep'), [settle]);

  // Leaving the page confirms the removal.
  useEffect(() => () => settle('delete'), [settle]);

  return { pending, remove, undo };
}
