import { useState } from 'react';
import { makeOddRound, ODD_LEVELS, ODD_ROUNDS, type OddLevel, type OddRound } from '@/lib/oddone';
import { Button } from '@/ui';
import { formatTime, kit, useStopwatch } from '../kit';
import { TopBar } from '../TopBar';
import styles from './OddOneOut.module.css';

/** Find the word that is not quite like the rest, ten times, as fast as you can. */
export function OddOneOut() {
  const [level, setLevel] = useState<OddLevel>('easy');
  /** The words on show; none before Start is pressed or after the last is found. */
  const [round, setRound] = useState<OddRound | null>(null);
  /** How many odd words have been found this game. */
  const [found, setFound] = useState(0);
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const watch = useStopwatch();

  const { columns } = ODD_LEVELS[level];
  const done = found === ODD_ROUNDS;

  /** Choosing a level sets the game up; the clock waits for Start. */
  function setUp(nextLevel: OddLevel) {
    setLevel(nextLevel);
    setRound(null);
    setFound(0);
    setMisses(0);
    setWrong(null);
    setMessage('');
    watch.reset();
  }

  function start() {
    setUp(level);
    setRound(makeOddRound(level));
    watch.start();
  }

  function choose(index: number) {
    if (!round) return;
    if (index !== round.oddIndex) {
      setMisses(misses + 1);
      setWrong(index);
      setMessage('Not that one: it is the same as the rest.');
      return;
    }
    setWrong(null);
    setFound(found + 1);
    if (found + 1 < ODD_ROUNDS) {
      setRound(makeOddRound(level));
      setMessage(`Yes: “${round.odd}” among “${round.word}”.`);
      return;
    }
    const taken = watch.stop();
    setRound(null);
    setMessage(
      `All ${ODD_ROUNDS} found in ${formatTime(taken)}${misses === 0 ? ', without a miss' : `, with ${misses} ${misses === 1 ? 'miss' : 'misses'}`}.`,
    );
  }

  return (
    <div className={kit.panel}>
      <TopBar
        levels={ODD_LEVELS}
        level={level}
        onLevel={setUp}
        stats={[
          { label: 'Found', value: `${found} of ${ODD_ROUNDS}` },
          { label: 'Misses', value: misses },
          { label: 'Time', value: formatTime(watch.elapsed), timer: true },
        ]}
      />

      {round ? (
        <div
          className={styles.words}
          role="group"
          aria-label="Words: one is different"
          style={{ '--columns': columns } as React.CSSProperties}
        >
          {round.cells.map((word, index) => (
            <button
              // The words are alike by design; only their places tell them apart.
              // oxlint-disable-next-line react/no-array-index-key
              key={`${found}-${index}`}
              type="button"
              className={styles.word}
              data-wrong={index === wrong || undefined}
              onClick={() => choose(index)}
            >
              {word}
            </button>
          ))}
        </div>
      ) : (
        <div className={styles.waiting}>
          <Button variant="primary" onClick={start}>
            {done ? 'Play again' : 'Start'}
          </Button>
        </div>
      )}

      <p className={kit.message} role="status">
        {message}
      </p>
      <p className={kit.help}>
        Every word is the same but one, which has a single letter changed for one that looks like
        it. Click the odd one. There are {ODD_ROUNDS} to find, and the clock starts when you press
        Start.
      </p>
    </div>
  );
}
