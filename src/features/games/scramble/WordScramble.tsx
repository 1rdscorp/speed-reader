import { useState, type FormEvent } from 'react';
import {
  isAnswer,
  makeRound,
  ROUND_LENGTH,
  scramble,
  SCRAMBLE_LEVELS,
  type ScrambleLevel,
} from '@/lib/scramble';
import { Button } from '@/ui';
import { kit } from '../kit';
import { TopBar } from '../TopBar';
import styles from './WordScramble.module.css';

/** What a hint costs. */
const HINT_COST = 5;

/** Unscramble ten words, each with its theme as a clue. */
export function WordScramble() {
  const [level, setLevel] = useState<ScrambleLevel>('easy');
  const [round, setRound] = useState(() => makeRound('easy'));
  /** Which word is up; one past the last when the game is over. */
  const [index, setIndex] = useState(0);
  /** The letters as shown now: the same letters, reshuffled on request. */
  const [letters, setLetters] = useState(() => round[0]!.letters);
  const [guess, setGuess] = useState('');
  /** How many of the word's first letters a hint has given away. */
  const [revealed, setRevealed] = useState(0);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [message, setMessage] = useState('');

  const entry = round[index];
  const { points } = SCRAMBLE_LEVELS[level];

  function start(nextLevel: ScrambleLevel) {
    const nextRound = makeRound(nextLevel);
    setLevel(nextLevel);
    setRound(nextRound);
    setIndex(0);
    setLetters(nextRound[0]!.letters);
    setGuess('');
    setRevealed(0);
    setScore(0);
    setSolved(0);
    setMessage('');
  }

  /** Move on to the next word, saying how the last one went. */
  function advance(said: string, nextScore: number, nextSolved: number) {
    const nextIndex = index + 1;
    const upcoming = round[nextIndex];
    setIndex(nextIndex);
    setGuess('');
    setRevealed(0);
    if (upcoming) {
      setLetters(upcoming.letters);
      setMessage(said);
    } else {
      setMessage(
        `${said} You unscrambled ${nextSolved} of ${ROUND_LENGTH}. Final score: ${nextScore}.`,
      );
    }
  }

  function check(event: FormEvent) {
    event.preventDefault();
    if (!entry || guess.trim() === '') return;
    if (isAnswer(entry, guess)) {
      setScore(score + points);
      setSolved(solved + 1);
      advance(`Yes, ${guess.trim().toUpperCase()}: ${points} points.`, score + points, solved + 1);
    } else {
      setMessage(`Not ${guess.trim().toUpperCase()}. Try again.`);
    }
  }

  function hint() {
    if (!entry || revealed >= entry.word.length - 1) return;
    setRevealed(revealed + 1);
    setScore(Math.max(0, score - HINT_COST));
    setMessage(`It starts with ${entry.word.slice(0, revealed + 1)}.`);
  }

  return (
    <div className={kit.panel}>
      <TopBar
        levels={SCRAMBLE_LEVELS}
        level={level}
        onLevel={start}
        stats={[
          { label: 'Score', value: score },
          { label: 'Word', value: `${Math.min(index + 1, ROUND_LENGTH)} of ${ROUND_LENGTH}` },
          { label: 'Solved', value: solved },
        ]}
      />

      {entry ? (
        <form className={styles.play} onSubmit={check}>
          <p className={styles.clue}>
            Theme: <strong>{entry.theme}</strong>
          </p>
          <p className={styles.tiles} aria-label={`Scrambled letters: ${[...letters].join(' ')}`}>
            {[...letters].map((letter, i) => (
              // The same letter can appear twice, so its place is part of its key.
              // oxlint-disable-next-line react/no-array-index-key
              <span key={`${letter}${i}`} className={styles.tile} aria-hidden="true">
                {letter}
              </span>
            ))}
          </p>
          <label htmlFor="scramble-guess" className="visuallyHidden">
            Your answer
          </label>
          <input
            id="scramble-guess"
            className={styles.guess}
            type="text"
            value={guess}
            maxLength={entry.word.length}
            placeholder="Type the word"
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            onChange={(event) => setGuess(event.target.value)}
          />
          <div className={kit.actions}>
            <Button variant="primary" type="submit" disabled={guess.trim() === ''}>
              Check
            </Button>
            <Button onClick={() => setLetters(scramble(entry.word))}>Shuffle</Button>
            <Button onClick={hint} disabled={revealed >= entry.word.length - 1}>
              Hint
            </Button>
            <Button onClick={() => advance(`It was ${entry.word}.`, score, solved)}>Skip</Button>
          </div>
        </form>
      ) : (
        <div className={kit.actions}>
          <Button variant="primary" onClick={() => start(level)}>
            New game
          </Button>
        </div>
      )}

      <p className={kit.message} role="status">
        {message}
      </p>
      <p className={kit.help}>
        Put the letters back in order to spell a word from the theme. Shuffle rearranges them, a
        hint gives the next letter for {HINT_COST} points, and Skip shows the answer.
      </p>
    </div>
  );
}
