import { useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { countWords } from '@/core';
import { formatCount, formatReadingTime } from '@/lib/format';
import { paths } from '@/lib/paths';
import {
  PRACTICE_LENGTHS,
  PRACTICE_TOPICS,
  generatePracticeText,
  type PracticeLength,
  type PracticeTopicChoice,
} from '@/lib/practice';
import { useServices } from '@/lib/services';
import { useSettings } from '@/lib/settings';
import { StorageFullError } from '@/lib/storage';
import { Button, FileIcon, SelectField } from '@/ui';
import { useFileDrop } from '../useFileDrop';
import { useImport } from '../useImport';
import styles from './AddText.module.css';

const TOPIC_CHOICES: Array<{ value: PracticeTopicChoice; label: string }> = [
  { value: 'mixed', label: 'A mix of topics' },
  ...PRACTICE_TOPICS.map((topic) => ({ value: topic.id, label: topic.label })),
];
const LENGTH_CHOICES = PRACTICE_LENGTHS.map((length) => ({
  value: length.id,
  label: `${length.label} · about ${length.words} words`,
}));

const SAVE_FAILED =
  'That text could not be saved. Check that this site is allowed to store data, then try again.';

/**
 * Where new text comes in: pasted, opened from files, generated for practice,
 * or fetched from a link where supported.
 */
export function AddText() {
  const { documents } = useServices();
  const { wpm } = useSettings();
  const navigate = useNavigate();
  const imports = useImport();
  const dragging = useFileDrop(imports.importFiles);
  const fileInput = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState<PracticeTopicChoice>('mixed');
  const [length, setLength] = useState<PracticeLength>('medium');

  const wordCount = useMemo(() => countWords(text), [text]);
  const busy = imports.state.reading !== null;

  async function readPasted() {
    if (wordCount === 0) return;
    setError(null);
    try {
      const created = await documents.create({ text, source: { kind: 'paste' } });
      setText('');
      await navigate(paths.read(created.id));
    } catch (cause) {
      setError(
        cause instanceof StorageFullError
          ? 'There is not enough room in this browser to save that text. Remove something from your library or try a shorter text.'
          : SAVE_FAILED,
      );
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void readPasted();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void readPasted();
    }
  }

  async function generate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const generated = await generatePracticeText({ topic, length });
      const created = await documents.create(generated);
      // Show what was generated in the text box as well, where it can be read over or edited.
      setText(generated.text);
      await navigate(paths.read(created.id));
    } catch {
      setError(SAVE_FAILED);
    }
  }

  function handleLink(event: FormEvent) {
    event.preventDefault();
    if (address.trim()) void imports.importLink?.(address);
  }

  return (
    <section className={styles.card} aria-label="Add a text">
      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="text-input" className={styles.label}>
          Your text
        </label>
        <textarea
          id="text-input"
          className={styles.textarea}
          rows={6}
          placeholder="Paste the text you want to read…"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          aria-describedby="text-hint"
        />
        <p id="text-hint" className={styles.hint}>
          {wordCount === 0
            ? 'Paste anything here. Your text stays in your browser.'
            : `${formatCount(wordCount)} ${wordCount === 1 ? 'word' : 'words'} · ${formatReadingTime(wordCount, wpm)} at ${wpm} WPM`}
        </p>
        <div className={styles.actions}>
          <Button variant="primary" type="submit" disabled={wordCount === 0}>
            Read this text
          </Button>
          <input
            ref={fileInput}
            type="file"
            className="visuallyHidden"
            aria-label="Files to add"
            tabIndex={-1}
            multiple
            accept={imports.accept}
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              // Reset so choosing the same file again still counts as a change.
              event.target.value = '';
              if (files.length > 0) void imports.importFiles(files);
            }}
          />
          <Button disabled={busy} onClick={() => fileInput.current?.click()}>
            <FileIcon />
            Open a file
          </Button>
          <p className={styles.formats}>
            Text, Markdown, saved web pages, EPUB and PDF. You can also drop files anywhere on this
            page.
          </p>
        </div>
      </form>

      <form className={styles.generate} onSubmit={(event) => void generate(event)}>
        <div>
          <h2 className={styles.label}>Nothing to hand? Generate a practice text</h2>
          <p className={styles.hint}>
            Short reads on the topic you pick, put together in your browser. Each one is saved to
            your library like any other text.
          </p>
        </div>
        <div className={styles.generateFields}>
          <SelectField
            id="practice-topic"
            label="Topic"
            value={topic}
            options={TOPIC_CHOICES}
            onChange={setTopic}
          />
          <SelectField
            id="practice-length"
            label="Length"
            value={length}
            options={LENGTH_CHOICES}
            onChange={setLength}
          />
          <Button type="submit">Generate text</Button>
        </div>
      </form>

      {imports.importLink && (
        <form className={styles.actions} onSubmit={handleLink}>
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
            placeholder="Or paste a link to an article"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
          <Button type="submit" disabled={busy || address.trim() === ''}>
            Add link
          </Button>
        </form>
      )}

      <p role="status" className={styles.status}>
        {busy && `Reading “${imports.state.reading}”…`}
      </p>
      {imports.state.added > 0 && (
        <p className={styles.status}>
          {imports.state.added === 1 ? '1 text was' : `${imports.state.added} texts were`} added to
          your <Link to={paths.library()}>library</Link>.
        </p>
      )}
      {[...imports.state.problems, ...(error ? [error] : [])].map((problem) => (
        <p key={problem} role="alert" className={styles.error}>
          {problem}
        </p>
      ))}

      {dragging && (
        <div className={styles.dropTarget} aria-hidden="true">
          <p>Drop to add to your library</p>
        </div>
      )}
    </section>
  );
}
