import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';

// Minimal PNG generator using uncompressed/deflated raw RGBA scans
function createPNG(width, height, getPixelRGBA) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw data with filter type 0 for each line
  const rawData = Buffer.alloc((width * 4 + 1) * height);
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRGBA(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Precomputed CRC table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Icon rendering: Modern luxury contact book icon
function renderContactIcon(x, y, w, h, isMaskable = false) {
  const nx = x / w;
  const ny = y / h;
  const cx = 0.5;
  const cy = 0.5;
  const dx = nx - cx;
  const dy = ny - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background: Deep luxury gradient from slate-900 (#0f172a) to indigo-950 (#1e1b4b)
  let r = Math.round(15 + nx * 15 + ny * 20);
  let g = Math.round(23 + nx * 10 + ny * 25);
  let b = Math.round(42 + nx * 50 + ny * 60);
  let a = 255;

  // Safe area scale for maskable vs standard
  const scale = isMaskable ? 0.72 : 0.85;
  const px = (nx - 0.5) / scale + 0.5;
  const py = (ny - 0.5) / scale + 0.5;

  // Rounded icon badge card
  if (px >= 0.15 && px <= 0.85 && py >= 0.15 && py <= 0.85) {
    const cardDx = Math.max(0, Math.abs(px - 0.5) - 0.25);
    const cardDy = Math.max(0, Math.abs(py - 0.5) - 0.25);
    const cornerDist = Math.sqrt(cardDx * cardDx + cardDy * cardDy);

    if (cornerDist < 0.1) {
      // Inside contact badge: vibrant sapphire / indigo gradient
      const bgGrad = (px + py) * 0.5;
      r = Math.round(37 * (1 - bgGrad) + 59 * bgGrad);
      g = Math.round(99 * (1 - bgGrad) + 130 * bgGrad);
      b = Math.round(235 * (1 - bgGrad) + 246 * bgGrad);

      // Contact Head (circle)
      const headDx = px - 0.5;
      const headDy = py - 0.40;
      const headDist = Math.sqrt(headDx * headDx + headDy * headDy);
      if (headDist < 0.12) {
        // White avatar head
        r = 255; g = 255; b = 255;
      }

      // Contact Shoulders (arc)
      const bodyDx = px - 0.5;
      const bodyDy = py - 0.68;
      const bodyDist = Math.sqrt(bodyDx * bodyDx * 1.2 + bodyDy * bodyDy * 1.8);
      if (bodyDist < 0.22 && py > 0.48) {
        // White avatar shoulders
        r = 255; g = 255; b = 255;
      }

      // Small emerald online badge in corner of card
      const badgeDx = px - 0.73;
      const badgeDy = py - 0.32;
      const badgeDist = Math.sqrt(badgeDx * badgeDx + badgeDy * badgeDy);
      if (badgeDist < 0.07) {
        // Emerald green
        r = 16; g = 185; b = 129;
      } else if (badgeDist < 0.085) {
        // Border of badge
        r = 30; g = 41; b = 59;
      }
    }
  }

  return [r, g, b, a];
}

// Generate icons
const outDir = path.resolve('./public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 192x192
const icon192 = createPNG(192, 192, (x, y, w, h) => renderContactIcon(x, y, w, h, false));
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), icon192);

// 512x512
const icon512 = createPNG(512, 512, (x, y, w, h) => renderContactIcon(x, y, w, h, false));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), icon512);

// 512x512 Maskable
const icon512Mask = createPNG(512, 512, (x, y, w, h) => renderContactIcon(x, y, w, h, true));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), icon512Mask);

// Apple touch icon 180x180
const icon180 = createPNG(180, 180, (x, y, w, h) => renderContactIcon(x, y, w, h, false));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), icon180);
fs.writeFileSync(path.join(outDir, 'favicon.ico'), icon192);

console.log('Successfully generated all PWA icons in /public');
