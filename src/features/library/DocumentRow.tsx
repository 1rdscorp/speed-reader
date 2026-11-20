import { useState, type CSSProperties, type FormEvent } from 'react';
import { Link } from 'react-router';
import { describeProgress, describeSource, type DocumentMeta } from '@/lib/documents';
import { formatCount, formatReadingTime } from '@/lib/format';
import { paths } from '@/lib/paths';
import { Button, IconButton, PencilIcon, TrashIcon } from '@/ui';
import styles from './LibraryPage.module.css';

interface DocumentRowProps {
  document: DocumentMeta;
  wpm: number;
  onRename: (title: string) => void;
  onRemove: () => void;
}

function describe(document: DocumentMeta, wpm: number): string {
  const { fraction } = document.progress;
  const wordsLeft = Math.round(document.wordCount * (1 - fraction));
  return [
    describeProgress(fraction),
    fraction > 0 && fraction < 1 && `${formatReadingTime(wordsLeft, wpm)} left`,
    fraction === 0 && formatReadingTime(document.wordCount, wpm),
    `${formatCount(document.wordCount)} ${document.wordCount === 1 ? 'word' : 'words'}`,
    describeSource(document.source),
  ]
    .filter(Boolean)
    .join(' · ');
}

export function DocumentRow({ document, wpm, onRename, onRemove }: DocumentRowProps) {
  const [renaming, setRenaming] = useState(false);

  function handleRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = String(new FormData(event.currentTarget).get('title') ?? '').trim();
    if (title && title !== document.title) onRename(title);
    setRenaming(false);
  }

  return (
    <li
      className={styles.row}
      style={
        { '--progress-at': `${Math.round(document.progress.fraction * 100)}%` } as CSSProperties
      }
    >
      {renaming ? (
        <form
          className={styles.rename}
          onSubmit={handleRename}
          onKeyDown={(event) => event.key === 'Escape' && setRenaming(false)}
        >
          <input
            name="title"
            className={styles.field}
            defaultValue={document.title}
            aria-label="Title"
            maxLength={200}
            autoFocus
            onFocus={(event) => event.currentTarget.select()}
          />
          <Button type="submit" variant="primary">
            Save
          </Button>
          <Button onClick={() => setRenaming(false)}>Cancel</Button>
        </form>
      ) : (
        <>
          <Link to={paths.read(document.id)} className={styles.rowLink}>
            <span className={styles.rowTitle}>{document.title}</span>
            <span className={styles.rowMeta}>{describe(document, wpm)}</span>
          </Link>
          <IconButton label={`Rename “${document.title}”`} onClick={() => setRenaming(true)}>
            <PencilIcon />
          </IconButton>
          <IconButton label={`Remove “${document.title}”`} onClick={onRemove}>
            <TrashIcon />
          </IconButton>
        </>
      )}
    </li>
  );
}
