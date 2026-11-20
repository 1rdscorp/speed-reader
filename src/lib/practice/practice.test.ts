import { describe, expect, it } from 'vitest';
import { countWords } from '@/core';
import { PASSAGES } from './bank';
import { composePracticeText } from './generate';
import { PRACTICE_LENGTHS, PRACTICE_TOPICS } from './topics';

/** A repeatable stand-in for Math.random. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe('the passage bank', () => {
  it('has enough on every topic for the longest text', () => {
    const longest = Math.max(...PRACTICE_LENGTHS.map((length) => length.passages));
    for (const topic of PRACTICE_TOPICS) {
      const count = PASSAGES.filter((passage) => passage.topic === topic.id).length;
      expect(count, topic.label).toBeGreaterThanOrEqual(longest);
    }
  });

  it('holds passages of similar length, so the stated lengths mean something', () => {
    for (const passage of PASSAGES) {
      const words = countWords(passage.text);
      expect(words, passage.title).toBeGreaterThanOrEqual(65);
      expect(words, passage.title).toBeLessThanOrEqual(95);
    }
  });

  it('has no duplicate titles', () => {
    const titles = PASSAGES.map((passage) => passage.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe('composePracticeText', () => {
  it('builds a text of the requested length on the requested topic', () => {
    for (const length of PRACTICE_LENGTHS) {
      const document = composePracticeText(PASSAGES, {
        topic: 'history',
        length: length.id,
        random: seeded(7),
      });
      const blocks = document.text.split('\n\n');
      // Each passage contributes a heading and a body.
      expect(blocks).toHaveLength(length.passages * 2);
      const headings = blocks.filter((_, i) => i % 2 === 0);
      for (const heading of headings) {
        expect(PASSAGES.find((passage) => passage.title === heading)?.topic).toBe('history');
      }
      // Within a third of the length the menu promises.
      const words = countWords(document.text);
      expect(Math.abs(words - length.words) / length.words, `${length.id}: ${words}`).toBeLessThan(
        0.34,
      );
      expect(document.source).toEqual({ kind: 'generated', topic: 'history' });
    }
  });

  it('never repeats a passage within a text', () => {
    const document = composePracticeText(PASSAGES, {
      topic: 'mixed',
      length: 'long',
      random: seeded(3),
    });
    const headings = document.text.split('\n\n').filter((_, i) => i % 2 === 0);
    expect(new Set(headings).size).toBe(headings.length);
  });

  it('draws on every topic when mixed', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 20; seed += 1) {
      const document = composePracticeText(PASSAGES, {
        topic: 'mixed',
        length: 'long',
        random: seeded(seed),
      });
      for (const block of document.text.split('\n\n')) {
        const passage = PASSAGES.find((candidate) => candidate.title === block);
        if (passage) seen.add(passage.topic);
      }
    }
    expect(seen.size).toBe(PRACTICE_TOPICS.length);
  });

  it('gives a different text each time, and the same text for the same randomness', () => {
    const make = (seed: number) =>
      composePracticeText(PASSAGES, { topic: 'science', length: 'medium', random: seeded(seed) })
        .text;
    expect(make(1)).toBe(make(1));
    expect(new Set([1, 2, 3, 4, 5, 6].map(make)).size).toBeGreaterThan(3);
  });

  it('names the text after its first passage', () => {
    const short = composePracticeText(PASSAGES, {
      topic: 'nature',
      length: 'short',
      random: seeded(5),
    });
    const [firstHeading] = short.text.split('\n\n');
    expect(short.title).toBe(`${firstHeading} and 1 more`);
  });
});
