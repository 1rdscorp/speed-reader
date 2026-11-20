/** A small repeatable random-number generator (mulberry32), so a given seed always draws the same picture. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Distance between the eyes, in pixels of the picture. It sets how far apart the repeats are. */
export const EYE_SEPARATION = 130;
/** How far the hidden shape stands out from the background, as a fraction of the viewing distance. */
const DEPTH_OF_FIELD = 1 / 3;

/** How far apart the two eyes' views of one point are drawn, for a depth from 0 (far) to 1 (near). */
export function separation(depth: number): number {
  return Math.round(((1 - DEPTH_OF_FIELD * depth) * EYE_SEPARATION) / (2 - DEPTH_OF_FIELD * depth));
}

/**
 * Turn a depth map into a random-dot stereogram (the Thimbleby, Inglis and
 * Witten method). Every point of the scene is seen by both eyes at two places
 * on the picture; those two pixels are made the same colour. Everything else
 * is noise, so the shape appears only when the eyes line the repeats up.
 *
 * `depth` holds one value per pixel, row by row, from 0 (background) to 1
 * (nearest). Returns one palette index per pixel, each below `colors`.
 */
export function stereogram(
  depth: ArrayLike<number>,
  width: number,
  height: number,
  colors: number,
  random: () => number,
): Uint8Array {
  const pixels = new Uint8Array(width * height);
  // same[x] points at a pixel to the right that x must match; a pixel pointing at itself is free.
  const same = new Int32Array(width);

  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    for (let x = 0; x < width; x += 1) same[x] = x;

    for (let x = 0; x < width; x += 1) {
      const apart = separation(depth[row + x] ?? 0);
      let left = x - (apart >> 1);
      let right = left + apart;
      if (left < 0 || right >= width) continue;
      // Join the two pixels, following any links already made so chains stay consistent.
      for (let k = same[left]!; k !== left && k !== right; k = same[left]!) {
        if (k < right) {
          left = k;
        } else {
          left = right;
          right = k;
        }
      }
      same[left] = right;
    }

    for (let x = width - 1; x >= 0; x -= 1) {
      pixels[row + x] = same[x] === x ? Math.floor(random() * colors) : pixels[row + same[x]!]!;
    }
  }
  return pixels;
}
