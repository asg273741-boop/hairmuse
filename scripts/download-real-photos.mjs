import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import sharp from 'sharp';

const outputDir = path.resolve('public/images/pins');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Copy the 3 already generated high-res realistic images
const brainDir = 'C:/Users/TCA/.gemini/antigravity/brain/38fac403-60ed-4190-9e4f-1965bff2c0cc';
const generated = {
  'beginner-braid-guide.jpg': 'beginner_braid_guide_1791097317441.jpg',
  'boho-braids.jpg': 'boho_braids_1791097333019.jpg',
  'messy-buns-that-hold.jpg': 'messy_buns_that_hold_1791097348225.jpg',
};

async function processImage(inputBuffer, targetFile) {
  await sharp(inputBuffer)
    .resize(800, 1200, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(targetFile);
  console.log(`Saved: ${targetFile}`);
}

async function copyGenerated() {
  for (const [targetName, srcName] of Object.entries(generated)) {
    const srcPath = path.join(brainDir, srcName);
    const destPath = path.join(outputDir, targetName);
    if (fs.existsSync(srcPath)) {
      const buffer = fs.readFileSync(srcPath);
      await processImage(buffer, destPath);
    }
  }
}

// 2. High quality direct Unsplash curated hairstyle photos for the remaining 5
const unsplashPhotos = {
  // Curtain bangs / face framing hairstyle
  'curtain-bangs-guide.jpg': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80',
  // French bob chic haircut
  'french-bob-comeback.jpg': 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&q=80',
  // Heatless soft bouncy curls
  'heatless-curls-overnight.jpg': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
  // Hollywood glamour waves / vintage glossy waves
  'hollywood-glamour-waves.jpg': 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&q=80',
  // Soft romantic bobby pin updo / low bun with pins
  'soft-bobby-pin-updos.jpg': 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1200&q=80',
};

function downloadUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(downloadUrl(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function downloadRemaining() {
  for (const [filename, url] of Object.entries(unsplashPhotos)) {
    try {
      console.log(`Downloading ${filename}...`);
      const buffer = await downloadUrl(url);
      const destPath = path.join(outputDir, filename);
      await processImage(buffer, destPath);
    } catch (err) {
      console.error(`Error processing ${filename}:`, err);
    }
  }
}

async function main() {
  await copyGenerated();
  await downloadRemaining();
  console.log('All 8 real pin images successfully prepared in public/images/pins/');
}

main();
