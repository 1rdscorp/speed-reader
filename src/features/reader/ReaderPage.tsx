import { useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { countWords } from '@/core';
import { APP_NAME } from '@/lib/config';
import type { NewDocument, ReadingDocument } from '@/lib/documents';
import { useServices } from '@/lib/services';
import { useAsync } from '@/lib/useAsync';
import { AddText } from './components/AddText';
import { ControlsPanel } from './components/ControlsPanel';
import styles from './Reader.module.css';
import { ReaderSession } from './ReaderSession';
import { SAMPLE_DOCUMENT } from './sample';

/**
 * The reading page. With a document id it shows that document; without one it
 * shows whatever was read last, or a short explanation of the reader itself
 * when the library is empty.
 */
export function ReaderPage() {
  const { documentId } = useParams();
  const { documents } = useServices();
  const state = useAsync(async () => {
    if (documentId) return (await documents.get(documentId)) ?? null;
    const [latest] = await documents.list();
    return (latest && (await documents.get(latest.id))) ?? SAMPLE_DOCUMENT;
  }, [documents, documentId]);

  // A generated practice text is read without being saved. It is held here,
  // tied to the visit it was made on, so moving to another text lets it go.
  const visit = useLocation().key;
  const [practice, setPractice] = useState<{ visit: string; document: ReadingDocument }>();
  const showPractice = (text: NewDocument, serial = Date.now()) =>
    setPractice({
      visit,
      document: {
        // Not the id of anything stored, so saving its reading position does nothing.
        id: `practice-${serial}`,
        title: text.title ?? 'Practice text',
        text: text.text,
        source: text.source,
        wordCount: countWords(text.text),
        createdAt: 0,
        lastReadAt: 0,
        progress: { offset: 0, fraction: 0 },
      },
    });

  const loaded = state.status === 'ready' ? state.data : undefined;
  const document = practice?.visit === visit ? practice.document : loaded;
  // While another text is loading the previous one stays up; do not show it under the new address.
  const current =
    document && (document !== loaded || !documentId || document.id === documentId)
      ? document
      : undefined;
  const missing = document === null || (current !== undefined && current.wordCount === 0);

  return (
    <div className={`container ${styles.page}`}>
      <title>{current && !missing ? `${current.title} · ${APP_NAME}` : `Read · ${APP_NAME}`}</title>

      <div className={styles.main}>
        {state.status === 'error' && (
          <div className={styles.notice} role="alert">
            <h1>This text could not be opened</h1>
            <p>
              Something went wrong reading it from this browser’s storage. Reloading the page may
              help.
            </p>
          </div>
        )}
        {missing && (
          <div className={styles.notice}>
            <h1>This text is not here</h1>
            <p>
              It may have been removed, or it was saved in a different browser. Texts are kept only
              on the device where you added them.
            </p>
          </div>
        )}
        {current && !missing && <ReaderSession key={current.id} document={current} />}
        <AddText onGenerated={showPractice} />
      </div>

      <ControlsPanel />
    </div>
  );
}
