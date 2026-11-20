import { Link } from 'react-router';
import { describeProgress, type DocumentMeta } from '@/lib/documents';
import { formatCount } from '@/lib/format';
import { paths } from '@/lib/paths';
import styles from './HomePage.module.css';

/** How many texts the start page shows before pointing to the library. */
const SHOWN = 5;

/** The texts read most recently, as a shortcut back into them. The library has the rest. */
export function RecentList({ documents }: { documents: DocumentMeta[] }) {
  return (
    <section aria-labelledby="recent-title">
      <div className={styles.recentHeader}>
        <h2 id="recent-title" className={styles.sectionTitle}>
          Recent
        </h2>
        <Link to={paths.library()} className={styles.libraryLink}>
          {documents.length > SHOWN ? `All ${documents.length} in your library` : 'Library'}
        </Link>
      </div>
      <ul className={styles.list}>
        {documents.slice(0, SHOWN).map((document) => (
          <li key={document.id} className={styles.item}>
            <Link to={paths.read(document.id)} className={styles.itemLink}>
              <span className={styles.itemTitle}>{document.title}</span>
              <span className={styles.itemMeta}>
                {describeProgress(document.progress.fraction)} · {formatCount(document.wordCount)}{' '}
                {document.wordCount === 1 ? 'word' : 'words'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
