// Genera placeholders PWA: fondo #09090b con pastilla lima #ccff00 (acento de marca).
// Uso: node scripts/gen-pwa-icons.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'assets');
mkdirSync(outDir, { recursive: true });

const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

// BG #09090b, acento #ccff00
const BG = [0x09, 0x09, 0x0b];
const ACC = [0xcc, 0xff, 0x00];

function makePng(size) {
  const stride = size * 3 + 1;
  const raw = Buffer.alloc(stride * size);
  // Pastilla central: 56% del lado, esquinas redondeadas aprox.
  const box = Math.floor(size * 0.56);
  const off = Math.floor((size - box) / 2);
  const radius = Math.floor(box * 0.22);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0; // filtro None
    for (let x = 0; x < size; x++) {
      let p = BG;
      const lx = x - off, ly = y - off;
      if (lx >= 0 && lx < box && ly >= 0 && ly < box) {
        const cx = Math.min(lx, box - 1 - lx);
        const cy = Math.min(ly, box - 1 - ly);
        const dx = radius - cx, dy = radius - cy;
        if (cx >= radius || cy >= radius || dx * dx + dy * dy <= radius * radius) p = ACC;
      }
      const o = y * stride + 1 + x * 3;
      raw[o] = p[0]; raw[o + 1] = p[1]; raw[o + 2] = p[2];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit truecolor
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  return png;
}

for (const size of [192, 512]) {
  const file = join(outDir, `icon-${size}.png`);
  writeFileSync(file, makePng(size));
  console.log(`OK ${file}`);
}
