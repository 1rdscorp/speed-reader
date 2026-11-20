import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  WPM_STEP,
  buildTimeline,
  indexAtOffset,
  nextSentence,
  previousSentence,
  remainingMs,
  tokenize,
} from '@/core';
import { APP_NAME } from '@/lib/config';
import type { ReadingDocument } from '@/lib/documents';
import { paths } from '@/lib/paths';
import { useServices } from '@/lib/services';
import { useSettings } from '@/lib/settings';
import { ArrowLeftIcon, buttonClassName } from '@/ui';
import { Controls } from './components/Controls';
import { Stage } from './components/Stage';
import styles from './Reader.module.css';
import { usePlayer } from './usePlayer';
import { useProgressSync } from './useProgressSync';
import { useReaderShortcuts, type ReaderActions } from './useReaderShortcuts';

/**
 * One sitting with one document. Mount with `key={document.id}`: the text is
 * tokenised and the player created once, for the lifetime of the component.
 */
export function ReaderSession({ document }: { document: ReadingDocument }) {
  const { settings } = useServices();
  const { wpm } = useSettings();
  const navigate = useNavigate();

  const tokens = useMemo(() => tokenize(document.text), [document.text]);
  const timeline = useMemo(() => buildTimeline(tokens), [tokens]);
  // Resume where the reader left off; a finished text starts over.
  const [startIndex] = useState(() =>
    document.progress.fraction >= 1 ? 0 : indexAtOffset(tokens, document.progress.offset),
  );
  const { player, index, status } = usePlayer(timeline, wpm, startIndex);
  useProgressSync(document.id, tokens, document.text.length, player);

  const actions = useMemo<ReaderActions>(
    () => ({
      toggle: () => player.toggle(),
      back: () => player.seek(previousSentence(tokens, player.getSnapshot().index)),
      forward: () => player.seek(nextSentence(tokens, player.getSnapshot().index)),
      restart: () => player.seek(0),
      faster: () => settings.update({ wpm: settings.get().wpm + WPM_STEP }),
      slower: () => settings.update({ wpm: settings.get().wpm - WPM_STEP }),
      exit: () => void navigate(paths.home()),
    }),
    [player, tokens, settings, navigate],
  );
  useReaderShortcuts(actions);

  const announcement = {
    playing: `Playing at ${wpm} words per minute`,
    paused: `Paused at word ${index + 1} of ${tokens.length}`,
    finished: 'Finished',
  }[status];

  return (
    <div className={styles.reader} data-status={status}>
      <title>{`${document.title} · ${APP_NAME}`}</title>

      <header className={`${styles.topbar} ${styles.chrome}`}>
        <Link
          to={paths.home()}
          className={buttonClassName('quiet', true)}
          aria-label="Close reader"
          title="Close reader"
        >
          <ArrowLeftIcon />
        </Link>
        <h1 className={styles.title}>{document.title}</h1>
      </header>

      <Stage
        word={tokens[index]?.text ?? ''}
        status={status}
        atStart={index === 0}
        onToggle={actions.toggle}
      />

      <div className={styles.chrome}>
        <Controls
          status={status}
          index={index}
          length={tokens.length}
          remainingMs={remainingMs(timeline, index, wpm)}
          wpm={wpm}
          actions={actions}
          onSeek={(target) => player.seek(target)}
        />
      </div>

      <p role="status" className="visuallyHidden">
        {announcement}
      </p>
    </div>
  );
}
