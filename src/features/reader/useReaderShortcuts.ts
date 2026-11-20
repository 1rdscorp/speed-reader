import { useEffect } from 'react';

export interface ReaderActions {
  toggle: () => void;
  /** Skip back or forward a fixed number of words. */
  back: () => void;
  forward: () => void;
  previousSentence: () => void;
  nextSentence: () => void;
  faster: () => void;
  slower: () => void;
  restart: () => void;
}

const KEYS: Record<string, keyof ReaderActions> = {
  ' ': 'toggle',
  k: 'toggle',
  ArrowLeft: 'back',
  ArrowRight: 'forward',
  'Shift+ArrowLeft': 'previousSentence',
  'Shift+ArrowRight': 'nextSentence',
  ArrowUp: 'faster',
  ArrowDown: 'slower',
  r: 'restart',
};

/** True when the key should be left to the focused control instead. */
function belongsToFocusedControl(event: KeyboardEvent): boolean {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || target.matches('input, textarea, select')) return true;
  // Space and Enter activate a focused button or link; every other key is still ours.
  return (event.key === ' ' || event.key === 'Enter') && target.matches('button, a[href]');
}

/** Keyboard control for the reader. `actions` should be stable between renders. */
export function useReaderShortcuts(actions: ReaderActions): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (belongsToFocusedControl(event)) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const action =
        KEYS[event.shiftKey ? `Shift+${key}` : key] ?? (event.shiftKey ? undefined : KEYS[key]);
      if (!action) return;
      event.preventDefault();
      actions[action]();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);
}
