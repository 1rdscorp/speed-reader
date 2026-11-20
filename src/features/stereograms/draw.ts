import { EYE_SEPARATION, seededRandom, separation, stereogram } from '@/lib/stereograms';

/** The size every built-in picture is drawn at. */
export const WIDTH = 960;
export const HEIGHT = 480;

type Rgb = [number, number, number];

function hslToRgb(hue: number, saturation: number, lightness: number): Rgb {
  const chroma = saturation * Math.min(lightness, 1 - lightness);
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12;
    return Math.round(255 * (lightness - chroma * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  return [channel(0), channel(8), channel(4)];
}

/** A handful of dot colours around one hue, from dark to light, different for each picture. */
function palette(index: number, random: () => number): Rgb[] {
  const hue = (index * 47) % 360;
  return [0.14, 0.32, 0.5, 0.68, 0.88].map((lightness) =>
    hslToRgb((hue + random() * 70 + 325) % 360, 0.55 + random() * 0.35, lightness),
  );
}

/** Draw the word in white on black: white is what stands out. Returns false where drawing is unavailable. */
function drawWord(context: CanvasRenderingContext2D, word: string) {
  context.fillStyle = '#000000';
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = '#ffffff';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  // As large as fits, keeping clear of the edges, where the picture has nothing to repeat from.
  const room = WIDTH - 2 * EYE_SEPARATION;
  let size = 300;
  context.font = `900 ${size}px Arial, Helvetica, sans-serif`;
  const measured = context.measureText(word).width;
  if (measured > room) size = Math.floor((size * room) / measured);
  context.font = `900 ${size}px Arial, Helvetica, sans-serif`;
  context.fillText(word, WIDTH / 2, HEIGHT / 2 + 18);
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
  drawWord(context, word);
  if (revealed) return;

  const source = context.getImageData(0, 0, WIDTH, HEIGHT).data;
  const depth = new Float32Array(WIDTH * HEIGHT);
  for (let i = 0; i < depth.length; i += 1) depth[i] = (source[i * 4] ?? 0) / 255;

  const random = seededRandom(1000 + index);
  const colors = palette(index, random);
  const dots = stereogram(depth, WIDTH, HEIGHT, colors.length, random);
  const image = context.createImageData(WIDTH, HEIGHT);
  for (let i = 0; i < dots.length; i += 1) {
    const [red, green, blue] = colors[dots[i]!]!;
    image.data[i * 4] = red;
    image.data[i * 4 + 1] = green;
    image.data[i * 4 + 2] = blue;
    image.data[i * 4 + 3] = 255;
  }
  context.putImageData(image, 0, 0);

  // Two guide dots: relax the eyes until they become three, and the picture is in focus.
  const apart = separation(0);
  for (const x of [WIDTH / 2 - apart / 2, WIDTH / 2 + apart / 2]) {
    context.beginPath();
    context.arc(x, 22, 9, 0, Math.PI * 2);
    context.fillStyle = '#ffffff';
    context.fill();
    context.beginPath();
    context.arc(x, 22, 6, 0, Math.PI * 2);
    context.fillStyle = '#000000';
    context.fill();
  }
}
