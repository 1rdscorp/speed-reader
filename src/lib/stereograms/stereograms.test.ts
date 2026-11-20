import { describe, expect, it } from 'vitest';
import { createMemoryStore } from '@/lib/storage';
import { createStereogramRepository } from './repository';
import { seededRandom, separation, stereogram } from './sirds';
import { HIDDEN_WORDS } from './words';

describe('stereogram', () => {
  const width = 400;
  const height = 3;

  it('repeats a flat background at the far separation', () => {
    const pixels = stereogram(new Float32Array(width * height), width, height, 8, seededRandom(1));
    const apart = separation(0);
    for (let x = 0; x + apart < width; x += 1) expect(pixels[x + apart]).toBe(pixels[x]);
    // It is noise, not one flat colour.
    expect(new Set(pixels.slice(0, apart)).size).toBeGreaterThan(3);
  });

  it('draws a raised shape with a shorter repeat, which is what makes it stand out', () => {
    const depth = new Float32Array(width * height);
    for (let x = 150; x < 250; x += 1) depth[x] = 1;
    const pixels = stereogram(depth, width, height, 16, seededRandom(2));
    const near = separation(1);
    expect(near).toBeLessThan(separation(0));
    // A point in the middle of the shape is seen at two pixels `near` apart.
    for (let x = 170; x < 230; x += 1) {
      const left = x - (near >> 1);
      expect(pixels[left + near]).toBe(pixels[left]);
    }
  });

  it('draws the same picture for the same seed and a different one otherwise', () => {
    const depth = new Float32Array(width * height);
    const make = (seed: number) =>
      Array.from(stereogram(depth, width, height, 8, seededRandom(seed)));
    expect(make(5)).toEqual(make(5));
    expect(make(5)).not.toEqual(make(6));
  });
});

describe('hidden words', () => {
  it('are fifty different short words', () => {
    expect(HIDDEN_WORDS).toHaveLength(50);
    expect(new Set(HIDDEN_WORDS).size).toBe(50);
    for (const word of HIDDEN_WORDS) expect(word).toMatch(/^[A-Z]{3,6}$/);
  });
});

describe('own stereograms', () => {
  it('keeps added pictures with their answers, and removes them', async () => {
    const store = createMemoryStore();
    const repository = createStereogramRepository(store);
    const first = await repository.add({
      name: ' shark.png ',
      answer: ' A shark ',
      image: 'data:image/png;base64,AAAA',
    });
    const second = await repository.add({
      name: '',
      answer: '',
      image: 'data:image/png;base64,BBBB',
    });

    expect(await repository.list()).toEqual([
      { id: first.id, name: 'shark.png', answer: 'A shark' },
      { id: second.id, name: 'Untitled', answer: '' },
    ]);
    expect(await repository.image(first.id)).toBe('data:image/png;base64,AAAA');

    await repository.remove(first.id);
    expect((await repository.list()).map((entry) => entry.id)).toEqual([second.id]);
    expect(await repository.image(first.id)).toBeUndefined();
  });
});
