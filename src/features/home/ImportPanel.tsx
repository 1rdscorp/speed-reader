import { useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { paths } from '@/lib/paths';
import { Button, FileIcon } from '@/ui';
import styles from './HomePage.module.css';
import type { ImportState } from './useImport';

interface ImportPanelProps {
  state: ImportState;
  accept: string;
  onFiles: (files: File[]) => void;
  /** Omitted when link import is not available. */
  onLink?: (address: string) => void;
}

/** The ways to bring a text in other than pasting it: files, and links where supported. */
export function ImportPanel({ state, accept, onFiles, onLink }: ImportPanelProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [address, setAddress] = useState('');
  const busy = state.reading !== null;

  function handleLink(event: FormEvent) {
    event.preventDefault();
    if (address.trim()) onLink?.(address);
  }

  return (
    <section className={styles.import} aria-labelledby="import-title">
      <h2 id="import-title" className={styles.sectionTitle}>
        {onLink ? 'Or open a file or a link' : 'Or open a file'}
      </h2>

      <div className={styles.importRow}>
        <input
          ref={fileInput}
          type="file"
          className="visuallyHidden"
          aria-label="Files to add"
          tabIndex={-1}
          multiple
          accept={accept}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            // Reset so choosing the same file again still counts as a change.
            event.target.value = '';
            if (files.length > 0) onFiles(files);
          }}
        />
        <Button disabled={busy} onClick={() => fileInput.current?.click()}>
          <FileIcon />
          Choose files
        </Button>
        <p className={styles.hint}>
          Text, Markdown, saved web pages, EPUB and PDF. You can also drop files anywhere on this
          page.
        </p>
      </div>

      {onLink && (
        <form className={styles.importRow} onSubmit={handleLink}>
          <label htmlFor="link-input" className="visuallyHidden">
            Link to an article
          </label>
          <input
            id="link-input"
            className={styles.linkField}
            type="text"
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Paste a link to an article"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
          <Button type="submit" disabled={busy || address.trim() === ''}>
            Add link
          </Button>
        </form>
      )}

      <p role="status" className={styles.reading}>
        {busy && `Reading “${state.reading}”…`}
      </p>
      {state.added > 0 && (
        <p className={styles.summary}>
          {state.added === 1 ? '1 text was' : `${state.added} texts were`} added to your{' '}
          <Link to={paths.library()}>library</Link>.
        </p>
      )}
      {state.problems.map((problem) => (
        <p key={problem} role="alert" className={styles.error}>
          {problem}
        </p>
      ))}
    </section>
  );
}
