import { useEffect } from 'react';

export interface ReaderActions {
  toggle: () => void;
  back: () => void;
  forward: () => void;
  faster: () => void;
  slower: () => void;
  restart: () => void;
  exit: () => void;
}

const KEYS: Record<string, keyof ReaderActions> = {
  ' ': 'toggle',
  k: 'toggle',
  ArrowLeft: 'back',
  j: 'back',
  ArrowRight: 'forward',
  l: 'forward',
  ArrowUp: 'faster',
  ArrowDown: 'slower',
  r: 'restart',
  Escape: 'exit',
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
      const action = KEYS[event.key.length === 1 ? event.key.toLowerCase() : event.key];
      if (!action) return;
      event.preventDefault();
      actions[action]();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);
}
