import { useServices } from '@/lib/services';
import type { OwnStereogram } from '@/lib/stereograms';
import { useAsync } from '@/lib/useAsync';
import styles from './Stereograms.module.css';

/** A stereogram the person added, shown as it is. */
export function OwnPicture({ entry }: { entry: OwnStereogram }) {
  const { stereograms } = useServices();
  const image = useAsync(() => stereograms.image(entry.id), [stereograms, entry.id]);

  if (image.status === 'loading') return <p className={styles.placeholder}>Loading…</p>;
  if (image.status === 'error' || !image.data) {
    return <p className={styles.placeholder}>This picture could not be loaded.</p>;
  }
  return <img className={styles.picture} src={image.data} alt={`Your stereogram: ${entry.name}`} />;
}
