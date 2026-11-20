import type { MouseEvent } from 'react';

/**
 * After a mouse or touch press, give focus back to the page. Otherwise the
 * pressed control keeps it, and Space would repeat that control instead of
 * toggling playback. Keyboard users (event.detail === 0) keep their focus,
 * and an open drop-down is left alone.
 */
export function releaseFocusAfterPointer(event: MouseEvent): void {
  const focused = document.activeElement;
  if (event.detail > 0 && focused instanceof HTMLElement && !focused.matches('select, textarea')) {
    focused.blur();
  }
}
