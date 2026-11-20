import { useRef } from 'react';
import { Link, useParams } from 'react-router';
import { APP_NAME } from '@/lib/config';
import { paths } from '@/lib/paths';
import { Button, ExpandIcon } from '@/ui';
import { GAMES, gameUrl } from './games';
import styles from './Games.module.css';

/** One game, shown in a frame: each game is its own page with its own look and its own saved scores. */
export function GamePage() {
  const { gameId } = useParams();
  const game = GAMES.find((candidate) => candidate.id === gameId);
  const frame = useRef<HTMLIFrameElement>(null);

  if (!game) {
    return (
      <div className={`container ${styles.page}`}>
        <title>{`Games · ${APP_NAME}`}</title>
        <h1 className={styles.title}>There is no game at this address.</h1>
        <p>
          <Link to={paths.games()}>See all games</Link>
        </p>
      </div>
    );
  }

  return (
    <div className={`container ${styles.game}`}>
      <title>{`${game.title} · ${APP_NAME}`}</title>
      <div className={styles.bar}>
        <Link to={paths.games()} className={styles.back}>
          All games
        </Link>
        <h1>{game.title}</h1>
        <Button onClick={() => frame.current?.requestFullscreen?.().catch(() => {})}>
          <ExpandIcon />
          Full screen
        </Button>
      </div>
      <iframe
        ref={frame}
        className={styles.frame}
        src={gameUrl(game)}
        title={game.title}
        allow="fullscreen"
      />
    </div>
  );
}
