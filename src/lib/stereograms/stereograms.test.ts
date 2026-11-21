import { describe, expect, it } from 'vitest';
import { createMemoryStore } from '@/lib/storage';
import { createStereogramRepository } from './repository';
import { createNoise, fractal } from './noise';
import { seededRandom, separation, stereogram } from './sirds';
import { HIDDEN_WORDS } from './words';

describe('stereogram', () => {
  const width = 400;
  const height = 3;
  const eyeSeparation = 130;
  const period = separation(0, eyeSeparation);
  // A texture in which every pixel is different, so a match can only mean "the same texture pixel".
  const texture = Uint32Array.from({ length: period * height }, (_, i) => i + 1);
  const make = (depth: Uint8Array) => stereogram({ depth, width, height, eyeSeparation, texture });

  it('repeats the texture in strips across a flat background', () => {
    const pixels = make(new Uint8Array(width * height));
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x + period < width; x += 1) {
        expect(pixels[y * width + x + period]).toBe(pixels[y * width + x]);
      }
      // Each strip is the whole texture row, in order.
      const strip = Array.from(pixels.slice(y * width + width - period, y * width + width));
      expect(new Set(strip).size).toBe(period);
      expect(Math.min(...strip)).toBe(y * period + 1);
    }
  });

  /** A raised block with sloping sides, as the letters have. */
  function block() {
    const depth = new Uint8Array(width * height);
    for (let x = 120; x < 280; x += 1) {
      depth[x] = Math.round(255 * Math.min(1, (x - 120) / 30, (280 - x) / 30));
    }
    return depth;
  }

  it('draws a raised shape with a shorter repeat, which is what makes it stand out', () => {
    const pixels = make(block());
    const near = separation(1, eyeSeparation);
    expect(near).toBeLessThan(period);
    // A point on top of the shape is seen at two pixels `near` apart: they
    // show the same place in the texture, to within the rounding to whole pixels.
    for (let x = 180; x < 250; x += 1) {
      const left = x - near / 2;
      const off = (pixels[left + near]! - pixels[left]! + period) % period;
      expect(Math.min(off, period - off)).toBeLessThanOrEqual(1);
    }
  });

  it('bends the texture over a slope without tearing it', () => {
    const pixels = make(block());
    for (let x = 1; x < width; x += 1) {
      expect(pixels[x]).toBeGreaterThanOrEqual(1);
      expect(pixels[x]).toBeLessThanOrEqual(period);
      // From one pixel to the next the texture moves on by none, one or a few pixels: never a leap.
      const moved = (pixels[x]! - pixels[x - 1]! + period) % period;
      expect(moved).toBeLessThanOrEqual(3);
    }
    // Away from the shape the background repeats as usual, still showing most of the texture.
    for (let x = 0; x < 40; x += 1) expect(pixels[x + period]).toBe(pixels[x]);
    expect(new Set(pixels.slice(0, period)).size).toBeGreaterThan(period * 0.7);
  });

  it('writes into the array it is given', () => {
    const into = new Uint32Array(width * height);
    const depth = new Uint8Array(width * height);
    expect(stereogram({ depth, width, height, eyeSeparation, texture, into })).toBe(into);
    expect(into[0]).not.toBe(0);
  });
});

describe('noise', () => {
  it('joins up with itself across, and is the same for the same seed', () => {
    const noise = createNoise(260, 7);
    for (const [x, y] of [
      [0, 0],
      [13.5, 400],
      [259, 2000],
    ] as const) {
      const value = fractal(noise, x, y, 2, 4);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
      expect(fractal(noise, x + 260, y, 2, 4)).toBeCloseTo(value, 10);
      expect(fractal(createNoise(260, 7), x, y, 2, 4)).toBe(value);
    }
    expect(createNoise(260, 8)(13.5, 400, 4)).not.toBe(noise(13.5, 400, 4));
  });

  it('gives the same random numbers for the same seed', () => {
    const a = seededRandom(5);
    const b = seededRandom(5);
    const c = seededRandom(6);
    const first = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(first);
    expect([c(), c(), c()]).not.toEqual(first);
  });
});

describe('hidden words', () => {
  it('are ten different short words', () => {
    expect(HIDDEN_WORDS).toHaveLength(10);
    expect(new Set(HIDDEN_WORDS).size).toBe(10);
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
