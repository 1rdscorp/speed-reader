import { useEffect, useState } from 'react';
import styles from './kit.module.css';

/** The styles the built-in games share. */
export { styles as kit };

/** A length of time for a game's clock: "23.4 s", or "1:05.2" past a minute. */
export function formatTime(milliseconds: number): string {
  const tenths = Math.floor(milliseconds / 100);
  const seconds = Math.floor(tenths / 10);
  if (seconds < 60) return `${seconds}.${tenths % 10} s`;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}.${tenths % 10}`;
}

/**
 * A stopwatch for a game. `start` sets it going from zero, `stop` halts it and
 * returns the exact time taken, `reset` puts it back to zero.
 */
export function useStopwatch() {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (startedAt === null) return;
    const timer = setInterval(() => setElapsed(Date.now() - startedAt), 100);
    return () => clearInterval(timer);
  }, [startedAt]);

  return {
    elapsed,
    running: startedAt !== null,
    start() {
      setElapsed(0);
      setStartedAt(Date.now());
    },
    stop() {
      const taken = startedAt === null ? elapsed : Date.now() - startedAt;
      setElapsed(taken);
      setStartedAt(null);
      return taken;
    },
    reset() {
      setElapsed(0);
      setStartedAt(null);
    },
  };
}
