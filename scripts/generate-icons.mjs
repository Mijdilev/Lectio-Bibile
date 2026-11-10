import fs from 'fs';
import zlib from 'zlib';

// Minimal PNG generator using Node's built-in zlib
function createPNG(width, height, drawFn) {
  // RGBA buffer: 4 bytes per pixel + 1 filter byte per row
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  // IDAT chunk
  const idat = compressed;

  // IEND chunk
  const iend = Buffer.alloc(0);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);

    const crcPayload = Buffer.concat([typeBuf, data]);
    const crc = crc32(crcPayload);
    crcBuf.writeInt32BE(crc, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', iend),
  ]);
}

// Standard CRC32 implementation
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return ~c;
}

const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

// Minimalist Lectio Icon Design: Pure Black AMOLED background with a refined white serif 'L' and subtle gold bookmark line
function drawLectioIcon(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;

  // Background: Deep pure black #0a0a0a
  let r = 10, g = 10, b = 10, a = 255;

  // Rounded outer squircle mask
  const cx = nx - 0.5;
  const cy = ny - 0.5;
  const dist = Math.hypot(cx, cy);

  // Serif 'L' stem (vertical column)
  const inStem = nx >= 0.32 && nx <= 0.44 && ny >= 0.24 && ny <= 0.74;
  // Serif 'L' top bracket
  const inTopSerif = nx >= 0.28 && nx <= 0.48 && ny >= 0.22 && ny <= 0.26;
  // Serif 'L' foot (horizontal bar)
  const inFoot = nx >= 0.32 && nx <= 0.70 && ny >= 0.68 && ny <= 0.76;
  // Serif 'L' right serif tip
  const inRightSerif = nx >= 0.66 && nx <= 0.72 && ny >= 0.63 && ny <= 0.76;

  // Thin warm gold bookmark ribbon on the right
  const inRibbon = nx >= 0.75 && nx <= 0.77 && ny >= 0.24 && ny <= 0.58;

  if (inStem || inTopSerif || inFoot || inRightSerif) {
    r = 255;
    g = 255;
    b = 255;
  } else if (inRibbon) {
    r = 245;
    g = 158;
    b = 11; // Amber Gold
  }

  return [r, g, b, a];
}

const png192 = createPNG(192, 192, drawLectioIcon);
fs.writeFileSync('public/icon-192.png', png192);

const png512 = createPNG(512, 512, drawLectioIcon);
fs.writeFileSync('public/icon-512.png', png512);
fs.writeFileSync('public/icon-maskable.png', png512);
fs.writeFileSync('public/apple-touch-icon.png', png192);

console.log('Icons generated successfully in /public');
