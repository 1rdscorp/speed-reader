import type { ReactNode } from 'react';
import { Button } from '@/ui';
import styles from './kit.module.css';

interface TopBarProps<Level extends string> {
  levels: Record<Level, { label: string }>;
  level: Level;
  /** Choosing a level, even the current one, starts a new game at it. */
  onLevel: (level: Level) => void;
  /** The figures shown beside the levels: score, time and so on. */
  stats: Array<{ label: string; value: ReactNode; timer?: boolean }>;
}

/** The row every built-in game starts with: its levels on one side, its figures on the other. */
export function TopBar<Level extends string>({
  levels,
  level,
  onLevel,
  stats,
}: TopBarProps<Level>) {
  return (
    <div className={styles.top}>
      <div className={styles.levels} role="group" aria-label="Level">
        {(Object.keys(levels) as Level[]).map((option) => (
          <Button
            key={option}
            variant={option === level ? 'primary' : 'secondary'}
            aria-pressed={option === level}
            onClick={() => onLevel(option)}
          >
            {levels[option].label}
          </Button>
        ))}
      </div>
      <dl className={styles.stats}>
        {stats.map(({ label, value, timer }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd role={timer ? 'timer' : undefined} aria-label={timer ? label : undefined}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
