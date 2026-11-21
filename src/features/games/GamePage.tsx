import { Suspense, useRef } from 'react';
import { Link, useParams } from 'react-router';
import { APP_NAME } from '@/lib/config';
import { paths } from '@/lib/paths';
import { Button, ExpandIcon } from '@/ui';
import { GAMES, gameUrl } from './games';
import styles from './Games.module.css';

/**
 * One game. A game that is its own page is shown in a frame, with its own look
 * and its own saved scores; one built into the site is shown as part of the page.
 */
export function GamePage() {
  const { gameId } = useParams();
  const game = GAMES.find((candidate) => candidate.id === gameId);
  const frame = useRef<HTMLIFrameElement & HTMLDivElement>(null);

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
      {'file' in game ? (
        <iframe
          ref={frame}
          className={styles.frame}
          src={gameUrl(game)}
          title={game.title}
          allow="fullscreen"
        />
      ) : (
        <div ref={frame} className={styles.builtIn}>
          <Suspense fallback={<p className={styles.loading}>Loading…</p>}>
            <game.Play />
          </Suspense>
        </div>
      )}
    </div>
  );
}
