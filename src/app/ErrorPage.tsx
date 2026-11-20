import { useRouteError } from 'react-router';
import { Button } from '@/ui';
import styles from './AppShell.module.css';

/** Last-resort screen when a page throws while loading or rendering. */
export function ErrorPage() {
  const error = useRouteError();
  console.error(error);
  return (
    <div className={styles.message}>
      <title>Something went wrong</title>
      <h1>Something went wrong.</h1>
      <p>Your saved texts are untouched. Reloading the page usually fixes it.</p>
      <Button variant="primary" onClick={() => window.location.reload()}>
        Reload
      </Button>
    </div>
  );
}
