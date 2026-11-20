import { useMemo, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import { countWords } from '@/core';
import { APP_NAME } from '@/lib/config';
import type { NewDocument } from '@/lib/documents';
import { formatCount, formatReadingTime } from '@/lib/format';
import { paths } from '@/lib/paths';
import { useServices } from '@/lib/services';
import { useSettings } from '@/lib/settings';
import { StorageFullError } from '@/lib/storage';
import { useAsync } from '@/lib/useAsync';
import { Button } from '@/ui';
import styles from './HomePage.module.css';
import { ImportPanel } from './ImportPanel';
import { RecentList } from './RecentList';
import { SAMPLE_TEXT, SAMPLE_TITLE } from './sample';
import { useFileDrop } from './useFileDrop';
import { useImport } from './useImport';

export function HomePage() {
  const { documents } = useServices();
  const { wpm } = useSettings();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recent = useAsync(() => documents.list(), [documents]);
  const imports = useImport(recent.reload);
  const dragging = useFileDrop(imports.importFiles);

  const wordCount = useMemo(() => countWords(text), [text]);

  async function open(input: NewDocument) {
    setError(null);
    try {
      const created = await documents.create(input);
      await navigate(paths.read(created.id));
    } catch (cause) {
      setError(
        cause instanceof StorageFullError
          ? 'There is not enough room in this browser to save that text. Remove a recent text or try a shorter one.'
          : 'That text could not be saved. Check that this site is allowed to store data, then try again.',
      );
    }
  }

  function submit() {
    if (wordCount > 0) void open({ text, source: { kind: 'paste' } });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      submit();
    }
  }

  async function openSample() {
    // Reuse the sample if it is already saved, so trying it twice keeps your place.
    const existing = (await documents.list()).find((document) => document.source.kind === 'sample');
    if (existing) await navigate(paths.read(existing.id));
    else await open({ title: SAMPLE_TITLE, text: SAMPLE_TEXT, source: { kind: 'sample' } });
  }

  return (
    <div className={styles.page}>
      <title>{APP_NAME}</title>

      <header>
        <h1 className={styles.title}>Read faster, one word at a time.</h1>
        <p className={styles.lede}>
          Paste some text or open a book. Words appear one by one at a fixed point, so your eyes
          stay still and your pace stays steady.
        </p>
      </header>

      <form className={styles.composer} onSubmit={handleSubmit}>
        <label htmlFor="text-input" className="visuallyHidden">
          Text to read
        </label>
        <textarea
          id="text-input"
          className={styles.textarea}
          placeholder="Paste the text you want to read…"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          aria-describedby="text-summary"
        />
        <div className={styles.footer}>
          <p id="text-summary" className={styles.summary}>
            {wordCount === 0
              ? `Reading at ${wpm} words per minute`
              : `${formatCount(wordCount)} ${wordCount === 1 ? 'word' : 'words'} · ${formatReadingTime(wordCount, wpm)} at ${wpm} wpm`}
          </p>
          <div className={styles.actions}>
            <Button variant="quiet" onClick={() => void openSample()}>
              Try a sample
            </Button>
            <Button variant="primary" type="submit" disabled={wordCount === 0}>
              Start reading
            </Button>
          </div>
        </div>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
      </form>

      <ImportPanel
        state={imports.state}
        accept={imports.accept}
        onFiles={(files) => void imports.importFiles(files)}
        onLink={imports.importLink && ((address) => void imports.importLink?.(address))}
      />

      {recent.status === 'ready' && recent.data.length > 0 && (
        <RecentList documents={recent.data} />
      )}

      {dragging && (
        <div className={styles.dropTarget} aria-hidden="true">
          <p>Drop to add to your library</p>
        </div>
      )}
    </div>
  );
}
