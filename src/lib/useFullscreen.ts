import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

export interface Fullscreen {
  active: boolean;
  toggle: () => void;
}

/**
 * Let an element take over the screen. Where the browser has real full screen
 * it is used; where it does not (iPhones, some embedded pages) `active` is
 * still true, and the element's own styles stretch it over the window instead.
 * Either way Escape, or the browser's own exit, brings it back.
 */
export function useFullscreen(ref: RefObject<HTMLElement | null>): Fullscreen {
  const [active, setActive] = useState(false);
  // True while the browser itself is showing the element full screen.
  const native = useRef(false);

  const leave = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    native.current = false;
    setActive(false);
  }, []);

  const toggle = useCallback(() => {
    if (active) {
      leave();
    } else {
      setActive(true);
      // Refused or missing is fine: the stretched-over-the-window form already applies.
      ref.current?.requestFullscreen?.().catch(() => {});
    }
  }, [active, leave, ref]);

  useEffect(() => {
    if (!active) return;

    const handleChange = () => {
      if (document.fullscreenElement === ref.current) {
        native.current = true;
      } else if (native.current) {
        // Left through the browser: Escape, or its own exit control.
        native.current = false;
        setActive(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      // Browsers usually take Escape for themselves in real full screen and
      // report the change above; where the key does reach the page, act on it.
      if (event.key === 'Escape') leave();
    };
    document.addEventListener('fullscreenchange', handleChange);
    window.addEventListener('keydown', handleKey);

    // The page behind must not scroll while it is covered.
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
      window.removeEventListener('keydown', handleKey);
      root.style.overflow = previousOverflow;
    };
  }, [active, leave, ref]);

  // Do not leave the browser in full screen if the element goes away.
  useEffect(
    () => () => {
      if (native.current && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    },
    [],
  );

  return { active, toggle };
}
