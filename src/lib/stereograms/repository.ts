import type { KeyValueStore } from '@/lib/storage';

/** A stereogram picture the person added themselves. */
export interface OwnStereogram {
  id: string;
  /** Shown in the list: the file's name unless changed. */
  name: string;
  /** What is hidden in it, if they said. */
  answer: string;
}

export interface StereogramRepository {
  list(): Promise<OwnStereogram[]>;
  /** The picture, as a data URL. */
  image(id: string): Promise<string | undefined>;
  add(input: { name: string; answer: string; image: string }): Promise<OwnStereogram>;
  remove(id: string): Promise<void>;
}

const INDEX_KEY = 'stereograms/index';
const imageKey = (id: string) => `stereograms/image/${id}`;

export function createStereogramRepository(store: KeyValueStore): StereogramRepository {
  const readIndex = async () => (await store.get<OwnStereogram[]>(INDEX_KEY)) ?? [];
  // Changes run one at a time so two in quick succession cannot overwrite each other.
  let queue: Promise<unknown> = Promise.resolve();
  function exclusive<T>(task: () => Promise<T>): Promise<T> {
    const result = queue.then(task);
    queue = result.catch(() => {});
    return result;
  }

  return {
    async list() {
      await queue;
      return readIndex();
    },
    image: (id) => store.get<string>(imageKey(id)),
    add: ({ name, answer, image }) =>
      exclusive(async () => {
        const bytes = crypto.getRandomValues(new Uint8Array(8));
        const entry: OwnStereogram = {
          id: Array.from(bytes, (byte) => byte.toString(36).padStart(2, '0')).join(''),
          name: name.trim() || 'Untitled',
          answer: answer.trim(),
        };
        // Picture first: if it does not fit, nothing is left pointing at a missing image.
        await store.set(imageKey(entry.id), image);
        await store.set(INDEX_KEY, [...(await readIndex()), entry]);
        return entry;
      }),
    remove: (id) =>
      exclusive(async () => {
        await store.set(
          INDEX_KEY,
          (await readIndex()).filter((entry) => entry.id !== id),
        );
        await store.delete(imageKey(id));
      }),
  };
}
