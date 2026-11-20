import { separation, stereogram } from '@/lib/stereograms';
import { drawTexture } from './textures';

/** Every built-in picture is drawn at 4K UHD. */
export const WIDTH = 3840;
export const HEIGHT = 2160;
/** Distance between the eyes, in pixels of the picture. It sets how wide the repeating strip is. */
const EYE_SEPARATION = 520;
/** The least distance, in pixels, over which the edge of a letter slopes up. */
const SLOPE = 40;

/** Draw the word in white on black: white is what stands out. Returns the height of its letters. */
function drawWord(context: CanvasRenderingContext2D, word: string): number {
  context.fillStyle = '#000000';
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = '#ffffff';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  // As large as fits, keeping clear of the edges, where the picture has nothing to repeat from.
  const room = WIDTH - 2 * EYE_SEPARATION;
  let size = 1100;
  context.font = `900 ${size}px Arial, Helvetica, sans-serif`;
  const measured = context.measureText(word).width;
  if (measured > room) size = Math.floor((size * room) / measured);
  context.font = `900 ${size}px Arial, Helvetica, sans-serif`;
  context.fillText(word, WIDTH / 2, HEIGHT / 2 + size * 0.06);
  return size;
}

/** Blur a depth map by averaging each pixel with those within `radius`, across and then down. */
function soften(depth: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  const span = radius * 2 + 1;
  const line = new Uint8Array(width);
  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    line.set(depth.subarray(row, row + width));
    let sum = 0;
    for (let x = 0; x < radius; x += 1) sum += line[x]!;
    for (let x = 0; x < width; x += 1) {
      if (x + radius < width) sum += line[x + radius]!;
      depth[row + x] = sum / span;
      if (x >= radius) sum -= line[x - radius]!;
    }
  }

  const softened = new Uint8Array(depth.length);
  const sums = new Int32Array(width);
  for (let y = 0; y < radius; y += 1) {
    for (let x = 0; x < width; x += 1) sums[x]! += depth[y * width + x]!;
  }
  for (let y = 0; y < height; y += 1) {
    const entering = (y + radius) * width;
    const leaving = (y - radius) * width;
    const row = y * width;
    for (let x = 0; x < width; x += 1) {
      if (y + radius < height) sums[x]! += depth[entering + x]!;
      softened[row + x] = sums[x]! / span;
      if (y >= radius) sums[x]! -= depth[leaving + x]!;
    }
  }
  return softened;
}

/**
 * Draw built-in picture number `index` on the canvas: the stereogram hiding
 * `word`, or, when `revealed`, the word itself. Does nothing where the browser
 * cannot draw.
 */
export function drawStereogram(
  canvas: HTMLCanvasElement,
  word: string,
  index: number,
  revealed: boolean,
) {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return;
  const size = drawWord(context, word);
  if (revealed) return;

  const strip = separation(0, EYE_SEPARATION);
  const texture = drawTexture(index, strip, HEIGHT);
  if (!texture) return;

  const source = context.getImageData(0, 0, WIDTH, HEIGHT).data;
  const depth = new Uint8Array(WIDTH * HEIGHT);
  for (let i = 0; i < depth.length; i += 1) depth[i] = source[i * 4]!;
  // The letters rise on a gentle slope, like something pressed up from behind.
  // A sharp edge would tear the texture; a slope only bends it.
  const slope = Math.max(SLOPE, Math.round(size * 0.06));

  const image = context.createImageData(WIDTH, HEIGHT);
  stereogram({
    depth: soften(depth, WIDTH, HEIGHT, slope),
    width: WIDTH,
    height: HEIGHT,
    eyeSeparation: EYE_SEPARATION,
    texture,
    into: new Uint32Array(image.data.buffer),
  });
  context.putImageData(image, 0, 0);

  // Two guide dots: relax the eyes until they become three, and the picture is in focus.
  for (const x of [WIDTH / 2 - strip / 2, WIDTH / 2 + strip / 2]) {
    context.beginPath();
    context.arc(x, 88, 36, 0, Math.PI * 2);
    context.fillStyle = '#ffffff';
    context.fill();
    context.beginPath();
    context.arc(x, 88, 24, 0, Math.PI * 2);
    context.fillStyle = '#000000';
    context.fill();
  }
}
