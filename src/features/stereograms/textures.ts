import { createNoise, fractal, seededRandom, type Noise } from '@/lib/stereograms';

type Rgb = [number, number, number];

/** Colour sets, each running from dark to light so every texture has contrast. */
const PALETTES: string[][] = [
  ['#2b1055', '#7b2d8e', '#e0527d', '#ff9a5f', '#ffe3a3'],
  ['#0b3d2e', '#1f7a4d', '#6fbf73', '#d9ed92', '#f4f1de'],
  ['#03045e', '#0077b6', '#00b4d8', '#90e0ef', '#f1fbff'],
  ['#6d2e8f', '#ff5d8f', '#ffb3c6', '#a0e7e5', '#fbf3c6'],
  ['#3c1518', '#8a2a12', '#c8641c', '#e9a44a', '#f2f3ae'],
  ['#2d0320', '#6a0572', '#b0589a', '#e7a9cf', '#f9e6ee'],
  ['#1d3540', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
  ['#12063a', '#ff206e', '#fbff12', '#41ead4', '#ffffff'],
  ['#283618', '#606c38', '#bc6c25', '#dda15e', '#fefae0'],
  ['#14213d', '#415a77', '#8fa6c4', '#dfe5ec', '#ffffff'],
];

/** What a style is given to draw one strip of texture. */
interface Tools {
  width: number;
  height: number;
  /** The palette, dark to light. */
  colors: Rgb[];
  random: () => number;
  noise: Noise;
}

interface Style {
  name: string;
  paint: (context: CanvasRenderingContext2D, tools: Tools) => void;
}

const css = ([red, green, blue]: Rgb, alpha = 1) =>
  `rgba(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)}, ${alpha})`;
const parse = (hex: string): Rgb =>
  [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16)) as Rgb;
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const scale = (color: Rgb, by: number): Rgb =>
  color.map((channel) => Math.min(255, channel * by)) as Rgb;
const mix = (a: Rgb, b: Rgb, t: number): Rgb =>
  a.map((channel, i) => channel + (b[i]! - channel) * t) as Rgb;

/** A colour from along the palette: 0 is its darkest, 1 its lightest. */
function along(colors: Rgb[], t: number): Rgb {
  const position = clamp(t) * (colors.length - 1);
  const index = Math.min(colors.length - 2, Math.floor(position));
  return mix(colors[index]!, colors[index + 1]!, position - index);
}

/** One of the palette's colours, a little lighter or darker than it is. */
function pick({ colors, random }: Tools, from = 0): Rgb {
  const color = colors[from + Math.floor(random() * (colors.length - from))]!;
  return scale(color, 0.86 + random() * 0.28);
}

/** Noise bunches up around the middle; spread it to use the whole range. */
const spread = (value: number, by: number) => clamp((value - 0.5) * by + 0.5);

/**
 * Draw a shape three times, a strip's width apart, so anything hanging over
 * one edge comes back in at the other and the strip joins up with itself.
 */
function across(context: CanvasRenderingContext2D, width: number, draw: () => void) {
  for (const shift of [-width, 0, width]) {
    context.save();
    context.translate(shift, 0);
    draw();
    context.restore();
  }
}

/** Fill the strip by working out each pixel's colour. */
function shade(
  context: CanvasRenderingContext2D,
  { width, height }: Tools,
  colorAt: (x: number, y: number) => Rgb,
) {
  const image = context.createImageData(width, height);
  const data = image.data;
  let at = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const color = colorAt(x, y);
      data[at] = color[0];
      data[at + 1] = color[1];
      data[at + 2] = color[2];
      data[at + 3] = 255;
      at += 4;
    }
  }
  context.putImageData(image, 0, 0);
}

/** How many shapes of about `area` pixels each cover the strip `layers` times over. */
const count = ({ width, height }: Tools, area: number, layers: number) =>
  Math.round(((width * height) / area) * layers);

const STYLES: Style[] = [
  {
    name: 'Confetti',
    paint(context, tools) {
      const { width, height, colors, random } = tools;
      context.fillStyle = css(colors[0]!);
      context.fillRect(0, 0, width, height);
      for (let i = count(tools, 700, 3); i > 0; i -= 1) {
        const x = random() * width;
        const y = random() * height;
        const radius = 7 + random() * 17;
        context.fillStyle = css(pick(tools));
        across(context, width, () => {
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
        });
      }
    },
  },
  {
    name: 'Marble',
    paint(context, tools) {
      const { colors, noise } = tools;
      shade(context, tools, (x, y) => {
        const cloud = fractal(noise, x, y, 2, 5);
        const swirl = fractal(noise, x, y + 7919, 4, 3);
        const vein = 0.5 + 0.5 * Math.sin(cloud * 26 + swirl * 5);
        return along(colors, vein * 0.82 + noise(x, y, 52) * 0.18);
      });
    },
  },
  {
    name: 'Mosaic',
    paint(context, tools) {
      const { width, height, colors, random } = tools;
      context.fillStyle = css(scale(colors[0]!, 0.55));
      context.fillRect(0, 0, width, height);
      const gap = 1.5;
      // Five big squares across; some are cut into four, and some of those into four again.
      const square = (x: number, y: number, size: number, level: number) => {
        if (level < 2 && random() < (level === 0 ? 0.8 : 0.45)) {
          const half = size / 2;
          for (const [dx, dy] of [
            [0, 0],
            [half, 0],
            [0, half],
            [half, half],
          ] as const) {
            square(x + dx, y + dy, half, level + 1);
          }
          return;
        }
        context.fillStyle = css(pick(tools, 1));
        context.fillRect(x + gap, y + gap, size - gap * 2, size - gap * 2);
      };
      const size = width / 5;
      for (let y = 0; y < height; y += size) {
        for (let column = 0; column < 5; column += 1) square(column * size, y, size, 0);
      }
    },
  },
  {
    name: 'Facets',
    paint(context, tools) {
      const { width, height, colors, random } = tools;
      context.fillStyle = css(colors[2]!);
      context.fillRect(0, 0, width, height);
      const size = width / 6;
      const triangle = (points: number[]) => {
        const color = css(pick(tools));
        context.fillStyle = color;
        context.strokeStyle = color;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(points[0]!, points[1]!);
        context.lineTo(points[2]!, points[3]!);
        context.lineTo(points[4]!, points[5]!);
        context.closePath();
        context.fill();
        context.stroke();
      };
      for (let y = 0; y < height; y += size) {
        for (let column = 0; column < 6; column += 1) {
          const x = column * size;
          const [right, bottom] = [x + size, y + size];
          if (random() < 0.5) {
            triangle([x, y, right, y, x, bottom]);
            triangle([right, y, right, bottom, x, bottom]);
          } else {
            triangle([x, y, right, y, right, bottom]);
            triangle([x, y, right, bottom, x, bottom]);
          }
        }
      }
    },
  },
  {
    name: 'Camouflage',
    paint(context, tools) {
      const { colors, noise } = tools;
      shade(context, tools, (x, y) => {
        const blobs = spread(fractal(noise, x, y, 3, 4), 2.6);
        const patch = spread(fractal(noise, x, y + 4409, 5, 3), 2.2);
        const index = Math.min(
          colors.length - 1,
          Math.floor((blobs * 0.65 + patch * 0.35) * colors.length),
        );
        return scale(colors[index]!, 0.9 + noise(x, y, 65) * 0.2);
      });
    },
  },
  {
    name: 'Contours',
    paint(context, tools) {
      const { colors, noise } = tools;
      shade(context, tools, (x, y) => {
        const land = fractal(noise, x, y, 2, 4) * 16;
        const level = Math.floor(land);
        const color = colors[level % colors.length]!;
        // A dark line where one level meets the next, as on a map.
        return land - level < 0.16
          ? scale(color, 0.4)
          : scale(color, 0.92 + noise(x, y, 52) * 0.16);
      });
    },
  },
  {
    name: 'Galaxy',
    paint(context, tools) {
      const { width, height, colors, random, noise } = tools;
      const night: Rgb = [7, 8, 22];
      shade(context, tools, (x, y) => {
        const first = spread(fractal(noise, x, y, 2, 5), 2.4);
        const second = spread(fractal(noise, x, y + 6007, 3, 4), 2.4);
        const glow = mix(night, colors[1]!, first * first * 0.9);
        return mix(glow, colors[2]!, second * second * second * 0.8);
      });
      for (let i = count(tools, 330, 1); i > 0; i -= 1) {
        const x = random() * width;
        const y = random() * height;
        const size = 1.2 + random() ** 3 * 6;
        const color = mix([255, 255, 255], colors[3 + Math.floor(random() * 2)]!, random() * 0.6);
        across(context, width, () => {
          context.fillStyle = css(color, 0.22);
          context.beginPath();
          context.arc(x, y, size * 2.4, 0, Math.PI * 2);
          context.fill();
          context.fillStyle = css(color);
          context.beginPath();
          context.arc(x, y, size, 0, Math.PI * 2);
          context.fill();
        });
      }
    },
  },
  {
    name: 'Bubbles',
    paint(context, tools) {
      const { width, height, colors, random } = tools;
      context.fillStyle = css(colors[0]!);
      context.fillRect(0, 0, width, height);
      for (let i = count(tools, 1500, 3.2); i > 0; i -= 1) {
        const x = random() * width;
        const y = random() * height;
        const radius = 9 + random() * 26;
        const color = pick(tools, 1);
        across(context, width, () => {
          const light = context.createRadialGradient(
            x - radius * 0.35,
            y - radius * 0.35,
            radius * 0.08,
            x,
            y,
            radius,
          );
          light.addColorStop(0, css(mix(color, [255, 255, 255], 0.75)));
          light.addColorStop(0.45, css(color));
          light.addColorStop(1, css(scale(color, 0.55)));
          context.fillStyle = light;
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
          context.strokeStyle = css(scale(colors[0]!, 0.6), 0.8);
          context.lineWidth = 2;
          context.stroke();
        });
      }
    },
  },
  {
    name: 'Brush strokes',
    paint(context, tools) {
      const { width, height, colors, random } = tools;
      context.fillStyle = css(colors[1]!);
      context.fillRect(0, 0, width, height);
      context.lineCap = 'round';
      for (let i = count(tools, 620, 3); i > 0; i -= 1) {
        const x = random() * width;
        const y = random() * height;
        const angle = random() * Math.PI * 2;
        const length = 30 + random() * 60;
        const bend = (random() - 0.5) * 50;
        const [dx, dy] = [Math.cos(angle) * length, Math.sin(angle) * length];
        context.strokeStyle = css(pick(tools));
        context.lineWidth = 5 + random() * 9;
        across(context, width, () => {
          context.beginPath();
          context.moveTo(x, y);
          context.quadraticCurveTo(
            x + dx / 2 - dy * (bend / length),
            y + dy / 2 + dx * (bend / length),
            x + dx,
            y + dy,
          );
          context.stroke();
        });
      }
    },
  },
  {
    name: 'Leaves',
    paint(context, tools) {
      const { width, height, colors, random } = tools;
      context.fillStyle = css(scale(colors[0]!, 0.7));
      context.fillRect(0, 0, width, height);
      for (let i = count(tools, 900, 3.4); i > 0; i -= 1) {
        const x = random() * width;
        const y = random() * height;
        const long = 18 + random() * 20;
        const wide = long * (0.3 + random() * 0.15);
        const angle = random() * Math.PI;
        const color = pick(tools, 1);
        across(context, width, () => {
          context.translate(x, y);
          context.rotate(angle);
          context.fillStyle = css(color);
          context.beginPath();
          // A leaf: two curves meeting in a point at each end.
          context.moveTo(-long, 0);
          context.quadraticCurveTo(0, -wide * 2, long, 0);
          context.quadraticCurveTo(0, wide * 2, -long, 0);
          context.fill();
          context.strokeStyle = css(scale(color, 0.6));
          context.lineWidth = 1.5;
          context.beginPath();
          context.moveTo(-long, 0);
          context.lineTo(long, 0);
          context.stroke();
        });
      }
    },
  },
];

/** The name of the style picture number `index` is drawn in. */
export const styleName = (index: number) => STYLES[index % STYLES.length]!.name;

/**
 * Draw the strip of texture for picture number `index`, `width` by `height`
 * pixels, and return its pixels. Styles take turns, and each time a style
 * comes round it has a different palette. Returns nothing where the browser
 * cannot draw.
 */
export function drawTexture(index: number, width: number, height: number): Uint32Array | undefined {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return undefined;

  const style = index % STYLES.length;
  const round = Math.floor(index / STYLES.length);
  const palette = PALETTES[(style * 3 + round * 7) % PALETTES.length]!;
  STYLES[style]!.paint(context, {
    width,
    height,
    colors: palette.map(parse),
    random: seededRandom(1000 + index),
    noise: createNoise(width, 1000 + index),
  });
  return new Uint32Array(context.getImageData(0, 0, width, height).data.buffer);
}
