import { useId, useRef, useState, type FormEvent } from 'react';
import { useServices } from '@/lib/services';
import type { OwnStereogram } from '@/lib/stereograms';
import { Button } from '@/ui';
import styles from './Stereograms.module.css';

/** The largest picture accepted. Pictures are kept in the browser, so there is a limit. */
const MAX_BYTES = 8 * 1024 * 1024;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('The file could not be read.'));
    reader.readAsDataURL(file);
  });
}

interface AddOwnProps {
  own: OwnStereogram[];
  onChanged: () => void;
  onView: (entry: OwnStereogram) => void;
}

/** Add your own stereogram pictures, and see or remove the ones already added. */
export function AddOwn({ own, onChanged, onView }: AddOwnProps) {
  const { stereograms } = useServices();
  const fileId = useId();
  const answerId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function add(event: FormEvent) {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return setMessage('Choose a picture first.');
    if (!file.type.startsWith('image/')) return setMessage('That file is not a picture.');
    if (file.size > MAX_BYTES) return setMessage('That picture is too large. The limit is 8 MB.');
    setBusy(true);
    try {
      await stereograms.add({ name: file.name, answer, image: await readAsDataUrl(file) });
      setAnswer('');
      if (fileRef.current) fileRef.current.value = '';
      setMessage(`Added “${file.name}”. It is at the end of the list.`);
      onChanged();
    } catch {
      setMessage('The picture could not be saved. The browser may be out of room.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(entry: OwnStereogram) {
    await stereograms.remove(entry.id);
    setMessage(`Removed “${entry.name}”.`);
    onChanged();
  }

  return (
    <section className={styles.own} aria-labelledby={`${fileId}-title`}>
      <h2 id={`${fileId}-title`} className={styles.sectionTitle}>
        Your stereograms
      </h2>
      <p className={styles.hint}>
        Add stereogram pictures of your own. They are shown after the built-in ones, with the same
        timer, and are saved only in this browser.
      </p>
      <form className={styles.form} onSubmit={add}>
        <div className={styles.field}>
          <label htmlFor={fileId}>Picture</label>
          <input id={fileId} ref={fileRef} type="file" accept="image/*" />
        </div>
        <div className={styles.field}>
          <label htmlFor={answerId}>What is hidden in it? (optional)</label>
          <input
            id={answerId}
            className={styles.text}
            type="text"
            value={answer}
            maxLength={80}
            onChange={(event) => setAnswer(event.target.value)}
          />
        </div>
        <Button type="submit" variant="primary" disabled={busy}>
          Add stereogram
        </Button>
      </form>
      <p className={styles.hint} role="status">
        {message}
      </p>
      {own.length > 0 && (
        <ul className={styles.ownList}>
          {own.map((entry) => (
            <li key={entry.id}>
              <span className={styles.ownName}>{entry.name}</span>
              <Button onClick={() => onView(entry)} aria-label={`View ${entry.name}`}>
                View
              </Button>
              <Button onClick={() => remove(entry)} aria-label={`Remove ${entry.name}`}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
