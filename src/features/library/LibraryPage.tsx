import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { APP_NAME } from '@/lib/config';
import type { DocumentMeta } from '@/lib/documents';
import { paths } from '@/lib/paths';
import { useServices } from '@/lib/services';
import { useSettings } from '@/lib/settings';
import { useAsync } from '@/lib/useAsync';
import { SearchIcon, buttonClassName } from '@/ui';
import { DocumentRow } from './DocumentRow';
import styles from './LibraryPage.module.css';
import { useUndoableRemoval } from './useUndoableRemoval';

const byTitle = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });

const ORDERS = {
  recent: { label: 'Recently read', compare: (a, b) => b.lastReadAt - a.lastReadAt },
  added: { label: 'Recently added', compare: (a, b) => b.createdAt - a.createdAt },
  title: { label: 'Title', compare: (a, b) => byTitle.compare(a.title, b.title) },
} satisfies Record<
  string,
  { label: string; compare: (a: DocumentMeta, b: DocumentMeta) => number }
>;

type Order = keyof typeof ORDERS;

export function LibraryPage() {
  const { documents } = useServices();
  const { wpm } = useSettings();
  const library = useAsync(() => documents.list(), [documents]);
  const removal = useUndoableRemoval();
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<Order>('recent');

  const all = useMemo(
    () =>
      library.status === 'ready'
        ? library.data.filter((document) => document.id !== removal.pending?.id)
        : [],
    [library, removal.pending],
  );
  const shown = useMemo(() => {
    const wanted = query.trim().toLowerCase();
    return all
      .filter((document) => document.title.toLowerCase().includes(wanted))
      .toSorted(ORDERS[order].compare);
  }, [all, query, order]);

  async function rename(document: DocumentMeta, title: string) {
    await documents.rename(document.id, title);
    library.reload();
  }

  return (
    <div className={styles.page}>
      <title>{`Library · ${APP_NAME}`}</title>

      <header className={styles.header}>
        <h1 className={styles.title}>Library</h1>
        {all.length > 0 && (
          <p className={styles.count}>
            {all.length} {all.length === 1 ? 'text' : 'texts'}
          </p>
        )}
        <Link to={paths.home()} className={`${buttonClassName('primary')} ${styles.add}`}>
          Add a text
        </Link>
      </header>

      {library.status === 'error' && (
        <p role="alert" className={styles.empty}>
          Your library could not be opened. Reloading the page may help.
        </p>
      )}

      {library.status === 'ready' && all.length === 0 && (
        <div className={styles.empty}>
          <strong>Nothing here yet.</strong>
          <p>Texts you paste or open are kept here, on this device, with your place in each.</p>
        </div>
      )}

      {all.length > 0 && (
        <>
          <div className={styles.toolbar}>
            <label className={styles.search}>
              <span className="visuallyHidden">Search titles</span>
              <SearchIcon />
              <input
                type="search"
                className={styles.field}
                placeholder="Search titles"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <label>
              <span className="visuallyHidden">Sort by</span>
              <select
                className={styles.field}
                value={order}
                onChange={(event) => setOrder(event.target.value as Order)}
              >
                {Object.entries(ORDERS).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {shown.length === 0 ? (
            <p className={styles.empty}>No titles match “{query.trim()}”.</p>
          ) : (
            <ul className={styles.list}>
              {shown.map((document) => (
                <DocumentRow
                  key={document.id}
                  document={document}
                  wpm={wpm}
                  onRename={(title) => void rename(document, title)}
                  onRemove={() => removal.remove(document)}
                />
              ))}
            </ul>
          )}
        </>
      )}

      {removal.pending && (
        <div className={styles.toast} role="status">
          <span className={styles.toastText}>Removed “{removal.pending.title}”</span>
          <button type="button" className={styles.toastAction} onClick={removal.undo}>
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
