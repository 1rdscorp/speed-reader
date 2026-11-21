import { useState } from 'react';
import { shuffled } from '@/lib/random';
import { Button } from '@/ui';
import { formatTime, kit, useStopwatch } from '../kit';
import { TopBar } from '../TopBar';
import styles from './SchulteTable.module.css';

type Level = 'easy' | 'medium' | 'hard';
const LEVELS: Record<Level, { label: string; side: number }> = {
  easy: { label: '3 × 3', side: 3 },
  medium: { label: '4 × 4', side: 4 },
  hard: { label: '5 × 5', side: 5 },
};

const deal = (side: number) => shuffled(Array.from({ length: side * side }, (_, i) => i + 1));

/**
 * A Schulte table: the numbers from 1 up, scattered over a square. Find them
 * in order as fast as you can. The classic way is to keep your eyes on the
 * middle and find each number without looking straight at it.
 */
export function SchulteTable() {
  const [level, setLevel] = useState<Level>('medium');
  const [numbers, setNumbers] = useState(() => deal(LEVELS.medium.side));
  /** The number to find next; one past the last when the table is finished. */
  const [next, setNext] = useState(1);
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const [message, setMessage] = useState('Find 1 to start the clock.');
  /** The fastest finish at each size, this visit. */
  const [best, setBest] = useState<Partial<Record<Level, number>>>({});
  const watch = useStopwatch();

  const { side } = LEVELS[level];
  const last = side * side;
  const done = next > last;

  function start(nextLevel: Level) {
    setLevel(nextLevel);
    setNumbers(deal(LEVELS[nextLevel].side));
    setNext(1);
    setMisses(0);
    setWrong(null);
    setMessage('Find 1 to start the clock.');
    watch.reset();
  }

  function choose(number: number) {
    if (done) return;
    if (number !== next) {
      // A number already found is not a miss, just a stray click.
      if (number > next) {
        setMisses(misses + 1);
        setWrong(number);
        setMessage(`That is ${number}. You are looking for ${next}.`);
      }
      return;
    }
    setWrong(null);
    if (number === 1) watch.start();
    setNext(number + 1);
    if (number < last) {
      setMessage(`Next: ${number + 1}`);
      return;
    }
    const taken = watch.stop();
    const record = best[level] === undefined || taken < best[level];
    if (record) setBest({ ...best, [level]: taken });
    setMessage(
      `All ${last} found in ${formatTime(taken)}${misses === 0 ? '' : `, with ${misses} ${misses === 1 ? 'miss' : 'misses'}`}.${record && best[level] !== undefined ? ' Your best yet.' : ''}`,
    );
  }

  return (
    <div className={kit.panel}>
      <TopBar
        levels={LEVELS}
        level={level}
        onLevel={start}
        stats={[
          { label: 'Next', value: done ? '–' : next },
          { label: 'Misses', value: misses },
          { label: 'Time', value: formatTime(watch.elapsed), timer: true },
          { label: 'Best', value: best[level] === undefined ? '–' : formatTime(best[level]) },
        ]}
      />

      <div
        className={styles.table}
        role="group"
        aria-label={`Numbers 1 to ${last}`}
        style={{ '--side': side } as React.CSSProperties}
      >
        {numbers.map((number) => (
          <button
            key={number}
            type="button"
            className={styles.number}
            data-found={number < next || undefined}
            data-wrong={number === wrong || undefined}
            onClick={() => choose(number)}
          >
            {number}
          </button>
        ))}
      </div>

      <p className={kit.message} role="status">
        {message}
      </p>
      <div className={kit.actions}>
        <Button variant={done ? 'primary' : 'secondary'} onClick={() => start(level)}>
          New table
        </Button>
      </div>
      <p className={kit.help}>
        Click the numbers in order, from 1 to {last}. To train your eyes for reading, keep them on
        the middle of the table and find each number without looking straight at it.
      </p>
    </div>
  );
}
