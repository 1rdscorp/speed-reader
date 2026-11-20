import { Link } from 'react-router';
import { paths } from '@/lib/paths';
import { buttonClassName } from '@/ui';
import styles from './AppShell.module.css';

export function NotFoundPage() {
  return (
    <div className={`container ${styles.message}`}>
      <title>Page not found</title>
      <h1>There is nothing at this address.</h1>
      <p>The link may be mistyped or out of date.</p>
      <Link to={paths.home()} className={buttonClassName('primary')}>
        Go to the start
      </Link>
    </div>
  );
}
