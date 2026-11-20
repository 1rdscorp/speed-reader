import { useEffect, useRef, useState } from 'react';

const carriesFiles = (event: DragEvent) => event.dataTransfer?.types.includes('Files') ?? false;

/**
 * Accept files dropped anywhere on the page. Returns true while files are
 * being dragged over the window, so the page can show where they will land.
 */
export function useFileDrop(onDrop: (files: File[]) => void): boolean {
  const [dragging, setDragging] = useState(false);
  // The listeners are attached once and must not lose count mid-drag, so they
  // reach the current callback through a ref instead of re-subscribing.
  const latestOnDrop = useRef(onDrop);
  useEffect(() => {
    latestOnDrop.current = onDrop;
  });

  useEffect(() => {
    // dragenter and dragleave fire for every element crossed; count them to know when the window is left.
    let depth = 0;
    const handleEnter = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      depth += 1;
      setDragging(true);
    };
    const handleLeave = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragging(false);
    };
    const handleOver = (event: DragEvent) => {
      // Without this the browser would navigate to the dropped file.
      if (carriesFiles(event)) event.preventDefault();
    };
    const handleDrop = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      event.preventDefault();
      depth = 0;
      setDragging(false);
      const files = Array.from(event.dataTransfer?.files ?? []);
      if (files.length > 0) latestOnDrop.current(files);
    };

    window.addEventListener('dragenter', handleEnter);
    window.addEventListener('dragleave', handleLeave);
    window.addEventListener('dragover', handleOver);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragenter', handleEnter);
      window.removeEventListener('dragleave', handleLeave);
      window.removeEventListener('dragover', handleOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  return dragging;
}
