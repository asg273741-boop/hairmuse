// Prints dimensions of every JPG in public/images/pins by parsing SOF markers.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(process.cwd(), 'public', 'images', 'pins');

function jpegSize(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    // SOF0..SOF15 except DHT (C4), JPG (C8), DAC (CC)
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    const len = buf.readUInt16BE(i + 2);
    i += 2 + len;
  }
  return null;
}

for (const file of readdirSync(dir).filter((f) => f.endsWith('.jpg'))) {
  const buf = readFileSync(join(dir, file));
  const size = jpegSize(buf);
  console.log(`${file}: ${size ? `${size.width}x${size.height}` : 'unknown'}  ${Math.round(buf.length / 1024)}KB`);
}
