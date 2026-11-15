import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, pixelGenerator) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // color type 6 (RGBA)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    // CRC32
    const crc = crc32(buf.subarray(4, 8 + len));
    buf.writeInt32BE(crc, 8 + len);
    return buf;
  }

  // Raw image data with filter byte 0 at start of each scanline
  const rawScanlineLen = 1 + width * 4;
  const rawData = Buffer.alloc(height * rawScanlineLen);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rawScanlineLen;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = pixelGenerator(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a !== undefined ? a : 255;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 calculation table
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ -1;
}

const samplesDir = path.resolve('public', 'samples');
if (!fs.existsSync(samplesDir)) {
  fs.mkdirSync(samplesDir, { recursive: true });
}

// Generate Sample 1: Beautiful Sunset Mountain Landscape
const W1 = 800;
const H1 = 600;

function landscapeClean(x, y, w, h) {
  const normY = y / h;
  const normX = x / w;

  // Sky gradient from orange to violet
  let r = Math.floor(255 - normY * 110);
  let g = Math.floor(140 + Math.sin(normX * 3) * 20 - normY * 80);
  let b = Math.floor(80 + normY * 120);

  // Sun
  const sunX = 400;
  const sunY = 280;
  const sunDist = Math.hypot(x - sunX, y - sunY);
  if (sunDist < 70) {
    const sunFactor = 1 - sunDist / 70;
    r = Math.min(255, r + Math.floor(120 * sunFactor));
    g = Math.min(255, g + Math.floor(100 * sunFactor));
    b = Math.min(255, b + Math.floor(50 * sunFactor));
  }

  // Mountain 1 (background)
  const m1Height = 260 + Math.sin(normX * 4) * 60 + Math.cos(normX * 9) * 40;
  if (y > m1Height) {
    r = Math.floor(80 + (y - m1Height) * 0.15);
    g = Math.floor(45 + (y - m1Height) * 0.1);
    b = Math.floor(85 + (y - m1Height) * 0.2);
  }

  // Mountain 2 (foreground)
  const m2Height = 360 + Math.sin(normX * 6 + 1) * 70 + Math.cos(normX * 12) * 30;
  if (y > m2Height) {
    r = Math.floor(35 + (y - m2Height) * 0.1);
    g = Math.floor(30 + (y - m2Height) * 0.08);
    b = Math.floor(55 + (y - m2Height) * 0.1);
  }

  // Lake reflection / foreground
  if (y > 450) {
    const lakeFactor = (y - 450) / 150;
    r = Math.floor(40 + lakeFactor * 60);
    g = Math.floor(50 + lakeFactor * 70);
    b = Math.floor(90 + lakeFactor * 80);
    // wave shimmer
    if ((y + Math.floor(Math.sin(x * 0.1) * 3)) % 8 < 2) {
      r = Math.min(255, r + 40);
      g = Math.min(255, g + 30);
      b = Math.min(255, b + 20);
    }
  }

  return [Math.max(0, Math.min(255, r)), Math.max(0, Math.min(255, g)), Math.max(0, Math.min(255, b)), 255];
}

function landscapeWithWatermark(x, y, w, h) {
  let [r, g, b] = landscapeClean(x, y, w, h);

  // Watermark 1: Rectangular semi-opaque banner across bottom right
  // X: 520 to 760, Y: 510 to 570
  if (x >= 520 && x <= 760 && y >= 510 && y <= 565) {
    // Semi-transparent dark background badge
    r = Math.floor(r * 0.35 + 20);
    g = Math.floor(g * 0.35 + 20);
    b = Math.floor(b * 0.35 + 30);

    // Diagonal striped watermark pattern
    if ((x + y) % 18 < 4) {
      r = Math.min(255, r + 70);
      g = Math.min(255, g + 70);
      b = Math.min(255, b + 80);
    }

    // Border
    if (x === 520 || x === 760 || y === 510 || y === 565) {
      r = 220; g = 220; b = 230;
    }
  }

  // Watermark 2: Centered large diagonal translucent text band
  // Diagonal band from (250, 200) to (550, 360)
  const lineDist = Math.abs((y - 0.5 * x) - 75);
  if (lineDist < 32 && x > 200 && x < 600) {
    const textPattern = ((x * 3 + y * 2) % 30 < 14);
    if (textPattern) {
      r = Math.min(255, Math.floor(r * 0.6 + 180 * 0.4));
      g = Math.min(255, Math.floor(g * 0.6 + 180 * 0.4));
      b = Math.min(255, Math.floor(b * 0.6 + 210 * 0.4));
    }
  }

  return [r, g, b, 255];
}

// Generate Sample 2: Minimalist Studio Product Render
const W2 = 800;
const H2 = 600;

function productClean(x, y, w, h) {
  const normY = y / h;
  const normX = x / w;

  // Soft studio lighting gradient
  let base = 235 - Math.hypot(normX - 0.5, normY - 0.4) * 60;
  let r = Math.floor(base);
  let g = Math.floor(base);
  let b = Math.floor(base + 8);

  // Pedestal cylinder
  const pedDist = Math.hypot((x - 400) / 1.8, (y - 440));
  if (pedDist < 120) {
    r = 250; g = 250; b = 252;
  } else if (y > 440 && Math.abs(x - 400) < 210 && y < 550) {
    const shadow = (1 - Math.abs(x - 400) / 210) * 45;
    r = Math.max(0, r - shadow);
    g = Math.max(0, g - shadow);
    b = Math.max(0, b - shadow);
  }

  // Floating sphere / gadget in center
  const sphDist = Math.hypot(x - 400, y - 290);
  if (sphDist < 90) {
    const nx = (x - 400) / 90;
    const ny = (y - 290) / 90;
    const light = Math.max(0, -nx * 0.5 - ny * 0.7 + 0.5);
    r = Math.floor(79 + light * 140);
    g = Math.floor(70 + light * 130);
    b = Math.floor(229 + light * 26);
  }

  return [r, g, b, 255];
}

function productWithWatermark(x, y, w, h) {
  let [r, g, b] = productClean(x, y, w, h);

  // Corner Stock Photo Stamp: X: 40 to 220, Y: 40 to 110
  if (x >= 40 && x <= 220 && y >= 40 && y <= 110) {
    r = Math.floor(r * 0.4 + 180 * 0.6);
    g = Math.floor(g * 0.4 + 40 * 0.6);
    b = Math.floor(b * 0.4 + 40 * 0.6);

    // Cross hatching
    if ((x + y) % 12 === 0) {
      r = 255; g = 255; b = 255;
    }
  }

  // Center watermark across the gadget
  if (x >= 320 && x <= 480 && y >= 270 && y <= 315) {
    if ((x * 2 + y) % 8 < 3) {
      r = Math.min(255, r + 90);
      g = Math.min(255, g + 90);
      b = Math.min(255, b + 90);
    }
  }

  return [r, g, b, 255];
}

// Write files
fs.writeFileSync(path.join(samplesDir, 'photo-watermark-1.png'), createPNG(W1, H1, landscapeWithWatermark));
fs.writeFileSync(path.join(samplesDir, 'photo-watermark-1-clean.png'), createPNG(W1, H1, landscapeClean));
fs.writeFileSync(path.join(samplesDir, 'photo-watermark-2.png'), createPNG(W2, H2, productWithWatermark));
fs.writeFileSync(path.join(samplesDir, 'photo-watermark-2-clean.png'), createPNG(W2, H2, productClean));

console.log('Successfully generated sample demonstration images in public/samples!');
