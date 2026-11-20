import { Link } from 'react-router';
import type { DocumentMeta } from '@/lib/documents';
import { formatCount } from '@/lib/format';
import { paths } from '@/lib/paths';
import { CloseIcon, IconButton } from '@/ui';
import styles from './HomePage.module.css';

function progressLabel(fraction: number): string {
  if (fraction >= 1) return 'Finished';
  const percent = Math.round(fraction * 100);
  return percent === 0 ? 'Not started' : `${percent}% read`;
}

interface RecentListProps {
  documents: DocumentMeta[];
  onRemove: (document: DocumentMeta) => void;
}

export function RecentList({ documents, onRemove }: RecentListProps) {
  return (
    <section aria-labelledby="recent-title">
      <h2 id="recent-title" className={styles.recentTitle}>
        Recent
      </h2>
      <ul className={styles.list}>
        {documents.map((document) => (
          <li key={document.id} className={styles.item}>
            <Link to={paths.read(document.id)} className={styles.itemLink}>
              <span className={styles.itemTitle}>{document.title}</span>
              <span className={styles.itemMeta}>
                {progressLabel(document.progress.fraction)} · {formatCount(document.wordCount)}{' '}
                {document.wordCount === 1 ? 'word' : 'words'}
              </span>
            </Link>
            <IconButton label={`Remove “${document.title}”`} onClick={() => onRemove(document)}>
              <CloseIcon />
            </IconButton>
          </li>
        ))}
      </ul>
    </section>
  );
}
