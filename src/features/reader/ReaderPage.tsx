import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router';
import { paths } from '@/lib/paths';
import { useServices } from '@/lib/services';
import { useAsync } from '@/lib/useAsync';
import { buttonClassName } from '@/ui';
import styles from './Reader.module.css';
import { ReaderSession } from './ReaderSession';

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className={styles.notice}>
      <title>{title}</title>
      <h1>{title}</h1>
      <p>{children}</p>
      <Link to={paths.home()} className={buttonClassName('primary')}>
        Read something else
      </Link>
    </main>
  );
}

export function ReaderPage() {
  const { documentId = '' } = useParams();
  const { documents } = useServices();
  const state = useAsync(() => documents.get(documentId), [documents, documentId]);

  if (state.status === 'error') {
    return (
      <Notice title="This text could not be opened">
        Something went wrong reading it from this browser’s storage. Reloading the page may help.
      </Notice>
    );
  }
  // Nothing is shown while loading (it takes an instant), or while a previous text is being replaced.
  if (state.status === 'loading' || (state.data && state.data.id !== documentId)) return null;
  if (!state.data || state.data.wordCount === 0) {
    return (
      <Notice title="This text is not here">
        It may have been removed, or it was saved in a different browser. Texts are kept only on the
        device where you added them.
      </Notice>
    );
  }
  return <ReaderSession key={state.data.id} document={state.data} />;
}
