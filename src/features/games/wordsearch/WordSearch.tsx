import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import {
  generatePuzzle,
  LEVELS,
  lineTowards,
  wordAlong,
  type Cell,
  type Difficulty,
  type Placement,
} from '@/lib/wordsearch';
import { Button } from '@/ui';
import styles from './WordSearch.module.css';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
/** Found words are marked in these colours, in turn. */
const COLORS = ['red', 'teal', 'orange', 'blue', 'green', 'purple'];
/** What a hint costs, and how long it stays on the grid. */
const HINT_COST = 15;
const HINT_MS = 2500;

const sameCell = (a: Cell | null, b: Cell | null) =>
  a !== null && b !== null && a.row === b.row && a.col === b.col;
const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

/** The middle of a cell, in the grid's own units: one unit is one cell. */
const middle = ({ row, col }: Cell) => ({ x: col + 0.5, y: row + 0.5 });

/** A word search: find the listed words hidden in a square of letters. */
export function WordSearch() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [puzzle, setPuzzle] = useState(() => generatePuzzle('easy'));
  /** The words found so far, in the order they were found. */
  const [found, setFound] = useState<Placement[]>([]);
  /** A first letter chosen by clicking, waiting for the last. */
  const [anchor, setAnchor] = useState<Cell | null>(null);
  /** A drag in progress. */
  const [drag, setDrag] = useState<{ from: Cell; to: Cell } | null>(null);
  /** The cell the arrow keys move from. */
  const [cursor, setCursor] = useState<Cell>({ row: 0, col: 0 });
  const [hint, setHint] = useState<Cell | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);

  const level = LEVELS[difficulty];
  const { size } = puzzle;
  const total = puzzle.placements.length;
  const complete = found.length === total;
  const selection = drag ? lineTowards(drag.from, drag.to, size) : anchor ? [anchor] : [];

  // The clock runs until the last word is found.
  useEffect(() => {
    if (complete) return;
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [complete, puzzle]);

  useEffect(() => {
    if (!hint) return;
    const timer = setTimeout(() => setHint(null), HINT_MS);
    return () => clearTimeout(timer);
  }, [hint]);

  // A drag let go of anywhere, even off the grid, is over.
  const dragging = drag !== null;
  useEffect(() => {
    if (!dragging) return;
    const stop = () => setDrag(null);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [dragging]);

  function start(next: Difficulty) {
    setDifficulty(next);
    setPuzzle(generatePuzzle(next));
    setFound([]);
    setAnchor(null);
    setDrag(null);
    setCursor({ row: 0, col: 0 });
    setHint(null);
    setSeconds(0);
    setScore(0);
    setMessage('');
  }

  /** Check a marked line of letters against the hidden words. */
  function attempt(cells: Cell[]) {
    const placement = wordAlong(puzzle, cells);
    const letters = cells.map(({ row, col }) => puzzle.grid[row]![col]).join('');
    if (!placement) {
      setMessage(`${letters} is not one of the words.`);
    } else if (found.includes(placement)) {
      setMessage(`You already found ${placement.word}.`);
    } else {
      const points = placement.word.length * level.pointsPerLetter;
      const count = found.length + 1;
      setFound([...found, placement]);
      setScore(score + points);
      setHint(null);
      setMessage(
        count === total
          ? `You found all ${total} words in ${clock(seconds)}. Score: ${score + points}.`
          : `Found ${placement.word}: ${points} points. ${total - count} to go.`,
      );
    }
  }

  /** Clicking, or pressing Enter on, a letter: the first click marks one end of a word, the second the other. */
  function choose(cell: Cell) {
    if (complete) return;
    if (!anchor) {
      setAnchor(cell);
      setMessage('Now choose the last letter of the word.');
    } else if (sameCell(anchor, cell)) {
      setAnchor(null);
      setMessage('');
    } else {
      attempt(lineTowards(anchor, cell, size));
      setAnchor(null);
    }
  }

  function handlePointerMove(event: PointerEvent) {
    if (!drag) return;
    // A finger keeps reporting to the letter it first touched, so ask what is under it now.
    const under = document.elementFromPoint?.(event.clientX, event.clientY);
    const letter = under?.closest<HTMLElement>('[data-row]');
    if (!letter || !gridRef.current?.contains(letter)) return;
    const to = { row: Number(letter.dataset.row), col: Number(letter.dataset.col) };
    if (!sameCell(to, drag.to)) setDrag({ from: drag.from, to });
  }

  function handlePointerUp() {
    if (!drag) return;
    const cells = lineTowards(drag.from, drag.to, size);
    // A drag that went nowhere is a click, and is handled as one.
    if (cells.length > 1) {
      attempt(cells);
      setAnchor(null);
    }
    setDrag(null);
  }

  function handleKeyDown(event: KeyboardEvent) {
    const steps: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const step = steps[event.key];
    if (step) {
      event.preventDefault();
      const row = Math.min(size - 1, Math.max(0, cursor.row + step[0]));
      const col = Math.min(size - 1, Math.max(0, cursor.col + step[1]));
      gridRef.current
        ?.querySelector<HTMLElement>(`[data-row="${row}"][data-col="${col}"]`)
        ?.focus();
    } else if (event.key === 'Escape' && anchor) {
      setAnchor(null);
      setMessage('');
    }
  }

  function showHint() {
    const hidden = puzzle.placements.filter((placement) => !found.includes(placement));
    const pick = hidden[Math.floor(Math.random() * hidden.length)];
    if (!pick) return;
    setHint(pick.start);
    setScore(Math.max(0, score - HINT_COST));
    setMessage(`${pick.word} starts at the flashing letter.`);
  }

  const marked = new Set(
    found.flatMap(({ start, end }) =>
      lineTowards(start, end, size).map(({ row, col }) => `${row},${col}`),
    ),
  );

  return (
    <div className={styles.game}>
      <div className={styles.top}>
        <div className={styles.levels} role="group" aria-label="Level">
          {DIFFICULTIES.map((option) => (
            <Button
              key={option}
              variant={option === difficulty ? 'primary' : 'secondary'}
              aria-pressed={option === difficulty}
              onClick={() => start(option)}
            >
              {LEVELS[option].label}
            </Button>
          ))}
        </div>
        <dl className={styles.stats}>
          <div>
            <dt>Score</dt>
            <dd>{score}</dd>
          </div>
          <div>
            <dt>Found</dt>
            <dd>
              {found.length} of {total}
            </dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd role="timer" aria-label="Time taken">
              {clock(seconds)}
            </dd>
          </div>
        </dl>
      </div>

      <div className={styles.board}>
        <div className={styles.gridWrap} style={{ '--size': size } as React.CSSProperties}>
          <svg className={styles.marks} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
            {found.map(({ word, start, end }, i) => (
              <line
                key={word}
                x1={middle(start).x}
                y1={middle(start).y}
                x2={middle(end).x}
                y2={middle(end).y}
                className={styles.foundMark}
                style={{ stroke: `var(--mark-${COLORS[i % COLORS.length]})` }}
              />
            ))}
            {selection.length > 0 && (
              <line
                x1={middle(selection[0]!).x}
                y1={middle(selection[0]!).y}
                x2={middle(selection[selection.length - 1]!).x}
                y2={middle(selection[selection.length - 1]!).y}
                className={styles.selectionMark}
              />
            )}
            {hint && (
              <circle
                cx={middle(hint).x}
                cy={middle(hint).y}
                r="0.42"
                className={styles.hintMark}
              />
            )}
          </svg>
          <div
            ref={gridRef}
            className={styles.grid}
            role="group"
            aria-label={`Letters: ${size} rows of ${size}`}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onKeyDown={handleKeyDown}
          >
            {puzzle.grid.flatMap((letters, row) =>
              letters.map((letter, col) => {
                const cell = { row, col };
                return (
                  <button
                    key={`${row},${col}`}
                    type="button"
                    className={styles.letter}
                    data-row={row}
                    data-col={col}
                    data-found={marked.has(`${row},${col}`) || undefined}
                    aria-label={`${letter}, row ${row + 1}, column ${col + 1}`}
                    aria-pressed={sameCell(anchor, cell)}
                    tabIndex={sameCell(cursor, cell) ? 0 : -1}
                    onFocus={() => setCursor(cell)}
                    onPointerDown={(event) => {
                      if (event.button === 0 && !complete) setDrag({ from: cell, to: cell });
                    }}
                    onClick={() => choose(cell)}
                  >
                    {letter}
                  </button>
                );
              }),
            )}
          </div>
        </div>

        <div className={styles.side}>
          <h2 className={styles.theme}>{puzzle.theme}</h2>
          <ul className={styles.words} aria-label="Words to find">
            {puzzle.placements.map((placement) => {
              const isFound = found.includes(placement);
              return (
                <li key={placement.word} data-found={isFound || undefined}>
                  {placement.word}
                  {isFound && <span className="visuallyHidden"> (found)</span>}
                </li>
              );
            })}
          </ul>
          <p className={styles.message} role="status">
            {message}
          </p>
          <div className={styles.actions}>
            <Button onClick={showHint} disabled={complete}>
              Hint
            </Button>
            <Button variant={complete ? 'primary' : 'secondary'} onClick={() => start(difficulty)}>
              New game
            </Button>
          </div>
          <p className={styles.help}>
            Drag across a word, or click its first letter and then its last. {level.summary} A hint
            costs {HINT_COST} points.
          </p>
        </div>
      </div>
    </div>
  );
}
