// Generates branded placeholder "pin" artwork as SVGs in public/images/pins.
// Replace these with real photos when your blog has them — keep them tall
// (2:3 or 4:5) so cards and Pinterest shares look right.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'images', 'pins');
mkdirSync(outDir, { recursive: true });

const pins = [
  {
    file: 'soft-bobby-pin-updos',
    w: 800, h: 1200,
    kicker: '10-MINUTE STYLES',
    lines: ['Soft', 'Bobby Pin', 'Updos'],
    from: '#b85c38', to: '#e3a687',
  },
  {
    file: 'messy-buns-that-hold',
    w: 800, h: 1000,
    kicker: 'EFFORTLESS',
    lines: ['Messy Buns', 'That Hold'],
    from: '#bf7247', to: '#eecdb0',
  },
  {
    file: 'heatless-curls-overnight',
    w: 800, h: 1200,
    kicker: 'NO HEAT',
    lines: ['Heatless', 'Curls', 'Overnight'],
    from: '#c26d7f', to: '#ecc4c0',
  },
  {
    file: 'hollywood-glamour-waves',
    w: 800, h: 800,
    kicker: 'GOLDEN HOUR',
    lines: ['Glamour', 'Waves'],
    from: '#96714a', to: '#e2c39b',
  },
  {
    file: 'beginner-braid-guide',
    w: 800, h: 1000,
    kicker: 'STEP BY STEP',
    lines: ['Braid Your', 'Own Hair'],
    from: '#a9713f', to: '#e6c79a',
  },
  {
    file: 'boho-braids',
    w: 800, h: 800,
    kicker: 'FESTIVAL READY',
    lines: ['Boho', 'Braids'],
    from: '#ab8152', to: '#e8d3ae',
  },
  {
    file: 'curtain-bangs-guide',
    w: 800, h: 1200,
    kicker: 'FACE FRAMING',
    lines: ['Curtain', 'Bangs 101'],
    from: '#9a6b6f', to: '#dcb9b3',
  },
  {
    file: 'french-bob-comeback',
    w: 800, h: 1000,
    kicker: 'TRENDING NOW',
    lines: ['The French', 'Bob'],
    from: '#8a6f4d', to: '#d9c9a8',
  },
];

function pinSvg({ w, h, kicker, lines, from, to }) {
  const lineH = 92;
  const blockH = (lines.length - 1) * lineH;
  const titleCenter = Math.round(h * 0.54);
  const baselineStart = titleCenter - blockH / 2;
  const kickerY = Math.round(h * 0.31);
  const dividerY = titleCenter + blockH / 2 + 70;

  const titleText = lines
    .map(
      (line, i) =>
        `<tspan x="400" y="${Math.round(baselineStart + i * lineH)}">${line}</tspan>`
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="HairMuse pin">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <circle cx="${w - 60}" cy="130" r="230" fill="#ffffff" opacity="0.09"/>
  <circle cx="40" cy="${h - 90}" r="280" fill="#2a211b" opacity="0.07"/>
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.05"/>
  <text x="400" y="92" text-anchor="middle" font-family="Georgia, serif" font-size="30" letter-spacing="10" fill="#ffffff" opacity="0.85">HAIRMUSE</text>
  <text x="400" y="${kickerY}" text-anchor="middle" font-family="Verdana, sans-serif" font-size="22" letter-spacing="7" fill="#ffffff" opacity="0.8">${kicker}</text>
  <text text-anchor="middle" font-family="Georgia, serif" font-size="72" font-weight="bold" fill="#ffffff">${titleText}</text>
  <line x1="330" y1="${dividerY}" x2="470" y2="${dividerY}" stroke="#ffffff" stroke-width="2" opacity="0.7"/>
  <text x="400" y="${h - 64}" text-anchor="middle" font-family="Verdana, sans-serif" font-size="20" letter-spacing="6" fill="#ffffff" opacity="0.75">HAIRMUSE.COM</text>
</svg>
`;
}

for (const pin of pins) {
  const dest = join(outDir, `${pin.file}.svg`);
  writeFileSync(dest, pinSvg(pin), 'utf8');
  console.log('created', dest);
}
