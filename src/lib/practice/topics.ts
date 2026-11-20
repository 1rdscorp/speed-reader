/** What a practice text can be about. */
export const PRACTICE_TOPICS = [
  { id: 'nature', label: 'Nature' },
  { id: 'science', label: 'Science' },
  { id: 'history', label: 'History' },
  { id: 'technology', label: 'Technology' },
  { id: 'everyday', label: 'Everyday life' },
] as const;

export type PracticeTopic = (typeof PRACTICE_TOPICS)[number]['id'];

/** A topic to ask for: one of the above, or a mix of all of them. */
export type PracticeTopicChoice = PracticeTopic | 'mixed';

/** How long a practice text can be, as a number of passages of about eighty words each. */
export const PRACTICE_LENGTHS = [
  { id: 'short', label: 'Short', passages: 2, words: 150 },
  { id: 'medium', label: 'Medium', passages: 5, words: 400 },
  { id: 'long', label: 'Long', passages: 10, words: 800 },
] as const;

export type PracticeLength = (typeof PRACTICE_LENGTHS)[number]['id'];
