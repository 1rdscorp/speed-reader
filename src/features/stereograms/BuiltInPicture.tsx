import { useEffect, useRef } from 'react';
import { drawStereogram, HEIGHT, WIDTH } from './draw';
import styles from './Stereograms.module.css';

interface BuiltInPictureProps {
  word: string;
  index: number;
  revealed: boolean;
}

/** One of the built-in stereograms, drawn in the browser. */
export function BuiltInPicture({ word, index, revealed }: BuiltInPictureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current) drawStereogram(canvasRef.current, word, index, revealed);
  }, [word, index, revealed]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.picture}
      width={WIDTH}
      height={HEIGHT}
      role="img"
      aria-label={revealed ? `The hidden word: ${word}` : `Stereogram ${index + 1}`}
    />
  );
}
