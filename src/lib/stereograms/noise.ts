/** A repeatable value from 0 to 1 for a point on a grid. */
function hash(x: number, y: number, seed: number): number {
  let h = Math.imul(x, 0x27d4eb2d) ^ Math.imul(y, 0x165667b1) ^ Math.imul(seed, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Smooth noise from 0 to 1. `cells` is how many grid cells span one repeat across. */
export type Noise = (x: number, y: number, cells: number) => number;

/**
 * Smooth noise that repeats exactly every `period` pixels across, so a texture
 * made from it joins up with itself edge to edge. It does not repeat downwards.
 */
export function createNoise(period: number, seed: number): Noise {
  return (x, y, cells) => {
    const scale = cells / period;
    const gridX = x * scale;
    const gridY = y * scale;
    const x0 = Math.floor(gridX);
    const y0 = Math.floor(gridY);
    const tx = gridX - x0;
    const ty = gridY - y0;
    const smoothX = tx * tx * (3 - 2 * tx);
    const smoothY = ty * ty * (3 - 2 * ty);
    const left = ((x0 % cells) + cells) % cells;
    const right = (left + 1) % cells;
    const salt = seed + cells * 131;
    const top = hash(left, y0, salt) * (1 - smoothX) + hash(right, y0, salt) * smoothX;
    const bottom = hash(left, y0 + 1, salt) * (1 - smoothX) + hash(right, y0 + 1, salt) * smoothX;
    return top * (1 - smoothY) + bottom * smoothY;
  };
}

/** Several layers of noise, each twice as fine and half as strong: clouds rather than blobs. */
export function fractal(noise: Noise, x: number, y: number, cells: number, layers: number): number {
  let total = 0;
  let weight = 0;
  let strength = 1;
  for (let layer = 0; layer < layers; layer += 1) {
    total += noise(x, y, cells << layer) * strength;
    weight += strength;
    strength /= 2;
  }
  return total / weight;
}
