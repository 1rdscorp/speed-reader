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

/**
 * How far the hidden shape stands out from the background, as a fraction of
 * the viewing distance. More is a bolder shape, but every slope bends the
 * texture, and the bends add up along the row.
 */
const DEPTH_OF_FIELD = 1 / 4;
/** Depth maps hold one byte per pixel: 0 is the background, 255 the nearest point. */
const NEAREST = 255;
/** How many times the guess at which point of the scene a pixel shows is refined. */
const REFINEMENTS = 4;

/** How far apart the two eyes' views of one point are drawn, before rounding. */
const apart = (depth: number, eyeSeparation: number) =>
  ((1 - DEPTH_OF_FIELD * depth) * eyeSeparation) / (2 - DEPTH_OF_FIELD * depth);

/**
 * How far apart the two eyes' views of one point are drawn, for a depth from
 * 0 (far) to 1 (near). `eyeSeparation` is the distance between the eyes in
 * pixels of the picture; it sets how wide the repeating strip is.
 */
export function separation(depth: number, eyeSeparation: number): number {
  return Math.round(apart(depth, eyeSeparation));
}

export interface StereogramInput {
  /**
   * One byte per pixel, row by row: 0 for the background up to 255 for the
   * nearest point. It should change gently from pixel to pixel: a cliff is
   * seen by one eye only, and the texture tears along it.
   */
  depth: ArrayLike<number>;
  width: number;
  height: number;
  eyeSeparation: number;
  /**
   * The picture the stereogram is made of: one colour value per pixel, row by
   * row, `separation(0, eyeSeparation)` pixels wide and `height` tall. It
   * should join up with itself from its right edge to its left.
   */
  texture: ArrayLike<number>;
  /** Where to write the result; a new array if left out. */
  into?: Uint32Array;
}

/**
 * Turn a depth map into a stereogram. Every point of the scene is seen by the
 * two eyes at two places on the picture, closer together the nearer the point
 * is; those two places are given the same piece of the texture. Across a flat
 * background that simply repeats the texture in strips. Over a raised shape
 * the repeats come closer together, which is what the eyes read as depth.
 *
 * Rather than copying pixels, each row works out *where in the texture* every
 * pixel looks, as a position that need not be a whole number. So a slope
 * stretches the texture on its way up and squeezes it back on its way down,
 * instead of tearing it. The texture is laid down untouched in the middle of
 * the row and carried outwards from there, which shares the bending between
 * the two sides.
 *
 * Returns one colour value per pixel, each taken from the same row of the
 * texture.
 */
export function stereogram(input: StereogramInput): Uint32Array {
  const { depth, width, height, eyeSeparation, texture } = input;
  const pixels = input.into ?? new Uint32Array(width * height);
  const period = separation(0, eyeSeparation);
  const apartAt = new Float64Array(NEAREST + 1);
  for (let level = 0; level <= NEAREST; level += 1) {
    apartAt[level] = apart(level / NEAREST, eyeSeparation);
  }
  const last = width - 1;
  const middle = width >> 1;
  // Where in the texture each pixel of the row looks. It keeps counting up
  // from strip to strip, and is wrapped round only when the colour is fetched.
  const place = new Float64Array(width);

  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    const textureRow = y * period;
    const apartFor = (x: number) =>
      apartAt[depth[row + Math.min(last, Math.max(0, Math.round(x)))]! & NEAREST]!;
    /** The texture position at a point between two pixels. */
    const placeAt = (x: number) => {
      const clamped = Math.min(last, Math.max(0, x));
      const whole = Math.min(last - 1, Math.floor(clamped));
      const part = clamped - whole;
      return place[whole]! * (1 - part) + place[whole + 1]! * part;
    };

    let flat = true;
    for (let x = 0; x < width; x += 1) {
      place[x] = x;
      if (depth[row + x]) flat = false;
    }

    if (!flat) {
      /** How far apart the two views are of the point that pixel `x` shows, looking to `side`. */
      const gapFrom = (x: number, side: number) => {
        // Which point of the scene a pixel shows depends on how near that point is, so home in on it.
        let gap = period;
        for (let i = 0; i < REFINEMENTS; i += 1) gap = apartFor(x + (side * gap) / 2);
        return gap;
      };

      // Start in the middle, with one point's two views. Between them no two
      // pixels have to match, so one whole strip of texture is laid there,
      // drawn in a little where the point is near and its views are close.
      const start = middle - (period >> 1);
      const first = gapFrom(start, 1);
      const end = Math.min(width, Math.ceil(start + first));
      for (let x = start; x < end; x += 1) place[x] = start + ((x - start) * period) / first;

      // Then outwards. Going right each pixel is some point's right-eye view
      // and takes its place from the left-eye view; going left, the other way.
      for (let x = end; x < width; x += 1) place[x] = placeAt(x - gapFrom(x, -1)) + period;
      for (let x = start - 1; x >= 0; x -= 1) place[x] = placeAt(x + gapFrom(x, 1)) - period;
    }

    for (let x = 0; x < width; x += 1) {
      const column = ((Math.round(place[x]!) % period) + period) % period;
      pixels[row + x] = texture[textureRow + column]!;
    }
  }
  return pixels;
}
