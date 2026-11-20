import { countWords } from '@/core';
import type { ReadingDocument } from '@/lib/documents';

const TEXT = `Most of the time you spend reading is not spent reading. Your eyes hop along each line in small jumps, pause, and hop again, and every so often they dart backwards to check something they already passed. Each hop is quick, but together they add up.

This reader removes the hopping. Words arrive one at a time at the same spot on the screen, and one letter in each word is shown in red. That letter sits close to the point where your eye recognises a word fastest, so you can keep your gaze on the red marks and let the text come to you.

A few things are worth knowing before you turn the speed up. Short pauses are added after commas, full stops and paragraphs, because rhythm carries meaning. Longer words stay on screen slightly longer. The speed you choose is the real average speed, pauses included.

Faster is not always better. At very high speeds most people follow the gist but lose detail, and dense material — contracts, proofs, poetry — deserves a slower pace or an ordinary page. Use this for articles, emails, and the long reads you keep meaning to finish.

Start around three hundred words per minute. When that feels comfortable, nudge it up by twenty-five and stay there for a while. If you lose the thread, step back ten words and read it again. That is all there is to it.`;

/**
 * What the reader shows before anything has been added. It is not saved in
 * the library: saving its reading position is a no-op, because no stored
 * document has this id.
 */
export const SAMPLE_DOCUMENT: ReadingDocument = {
  id: 'sample',
  title: 'How this works',
  text: TEXT,
  source: { kind: 'sample' },
  wordCount: countWords(TEXT),
  createdAt: 0,
  lastReadAt: 0,
  progress: { offset: 0, fraction: 0 },
};
