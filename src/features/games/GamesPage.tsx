import { Link } from 'react-router';
import { APP_NAME } from '@/lib/config';
import { paths } from '@/lib/paths';
import { GAMES } from './games';
import styles from './Games.module.css';

export function GamesPage() {
  return (
    <div className={`container ${styles.page}`}>
      <title>{`Games · ${APP_NAME}`}</title>
      <header>
        <h1 className={styles.title}>Games</h1>
        <p className={styles.lede}>Typing games for a break between reads. Both need a keyboard.</p>
      </header>
      <ul className={styles.list}>
        {GAMES.map((game) => (
          <li key={game.id}>
            <Link to={paths.games(game.id)} className={styles.card}>
              <h2>{game.title}</h2>
              <p>{game.description}</p>
              <span className={styles.play}>Play</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
