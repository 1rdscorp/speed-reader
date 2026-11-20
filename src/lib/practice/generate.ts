import type { NewDocument } from '@/lib/documents';
import type { Passage } from './bank';
import { PRACTICE_LENGTHS, type PracticeLength, type PracticeTopicChoice } from './topics';

export interface PracticeOptions {
  topic: PracticeTopicChoice;
  length: PracticeLength;
  /** Source of randomness, returning numbers in [0, 1). Replace it to make the result repeatable. */
  random?: () => number;
}

/**
 * Put together a practice text: a random selection of passages on the chosen
 * topic, in random order, each under its own heading. Nothing is repeated
 * within one text.
 */
export function composePracticeText(
  passages: readonly Passage[],
  { topic, length, random = Math.random }: PracticeOptions,
): NewDocument {
  const pool = passages.filter((passage) => topic === 'mixed' || passage.topic === topic);
  // Shuffle (Fisher–Yates), then take as many as the length asks for.
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  const wanted = PRACTICE_LENGTHS.find((choice) => choice.id === length)?.passages ?? 1;
  const chosen = pool.slice(0, wanted);
  const [first] = chosen;
  if (!first) throw new Error(`No practice passages for topic "${topic}"`);

  return {
    title: chosen.length === 1 ? first.title : `${first.title} and ${chosen.length - 1} more`,
    text: chosen.map((passage) => `${passage.title}\n\n${passage.text}`).join('\n\n'),
    source: { kind: 'generated', topic },
  };
}

/** Generate a practice text from the built-in passages, which are loaded on first use. */
export async function generatePracticeText(options: PracticeOptions): Promise<NewDocument> {
  const { PASSAGES } = await import('./bank');
  return composePracticeText(PASSAGES, options);
}
