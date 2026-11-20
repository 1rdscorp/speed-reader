import type { DOMAttributes, MouseEvent } from 'react';

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

/**
 * The same for a panel of form controls, drop-downs included. A drop-down has
 * to keep focus while it is open, so it is released when a choice is made, and
 * only if that choice was made with the pointer: someone arrowing through the
 * options from the keyboard must not lose their place.
 *
 * Spread the result onto the element that contains the controls.
 */
export function releaseFocusHandlers(): Pick<
  DOMAttributes<HTMLElement>,
  'onClick' | 'onPointerDownCapture' | 'onKeyDownCapture' | 'onChangeCapture'
> {
  let usingPointer = false;
  return {
    onClick: releaseFocusAfterPointer,
    onPointerDownCapture: () => {
      usingPointer = true;
    },
    onKeyDownCapture: () => {
      usingPointer = false;
    },
    onChangeCapture: (event) => {
      if (usingPointer && event.target instanceof HTMLSelectElement) event.target.blur();
    },
  };
}
