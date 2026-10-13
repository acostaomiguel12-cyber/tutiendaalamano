// Regenera los iconos PWA desde public/favicon.png (logo de marca 1080x1080).
// Compone el logo centrado sobre fondo #09090b con margen, en 192 y 512.
// Uso: node scripts/build-icons-from-logo.mjs
import { inflateSync, deflateSync } from 'node:zlib';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
mkdirSync(join(root, 'public', 'assets'), { recursive: true });

// ---- PNG decode (8-bit, color types 2/6) ----
function parseChunks(buf) {
  const chunks = [];
  let o = 8;
  while (o < buf.length) {
    const len = buf.readUInt32BE(o);
    const type = buf.toString('ascii', o + 4, o + 8);
    chunks.push({ type, data: buf.subarray(o + 8, o + 8 + len) });
    o += 12 + len;
  }
  return chunks;
}

function decodePng(buf) {
  const chunks = parseChunks(buf);
  const ihdr = chunks.find((c) => c.type === 'IHDR').data;
  const w = ihdr.readUInt32BE(0);
  const h = ihdr.readUInt32BE(4);
  const bitDepth = ihdr[8];
  const colorType = ihdr[9];
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(`PNG no soportado (bitDepth=${bitDepth}, colorType=${colorType})`);
  }
  const ch = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(chunks.filter((c) => c.type === 'IDAT').map((c) => c.data)));
  const stride = w * ch;
  const px = Buffer.alloc(w * h * ch);
  let p = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[p++];
    const row = px.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? px.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? row[x - ch] : 0;
      const b = prev[x];
      const c = x >= ch ? prev[x - ch] : 0;
      const v = raw[p++];
      if (filter === 0) row[x] = v;
      else if (filter === 1) row[x] = (v + a) & 255;
      else if (filter === 2) row[x] = (v + b) & 255;
      else if (filter === 3) row[x] = (v + ((a + b) >> 1)) & 255;
      else if (filter === 4) {
        const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
        const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        row[x] = (v + pr) & 255;
      }
    }
  }
  return { w, h, ch, px };
}

// ---- PNG encode (8-bit truecolor) ----
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c;
}
const crc32 = (buf) => {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePng(w, h, rgb) {
  const stride = w * 3 + 1;
  const raw = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    raw[y * stride] = 0;
    rgb.copy(raw, y * stride + 1, y * w * 3, (y + 1) * w * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- Render: logo escalado bilineal sobre fondo blanco con 12% de margen ----
const BG = [0xff, 0xff, 0xff];
const src = decodePng(readFileSync(join(root, 'public', 'favicon.png')));

function sample(u, v) {
  const x = Math.min(src.w - 1, Math.max(0, u));
  const y = Math.min(src.h - 1, Math.max(0, v));
  const o = (Math.round(y) * src.w + Math.round(x)) * src.ch;
  const a = src.ch === 4 ? src.px[o + 3] / 255 : 1;
  return [src.px[o] / 255, src.px[o + 1] / 255, src.px[o + 2] / 255, a];
}

function render(size) {
  const margin = Math.floor(size * 0.05);
  const box = size - margin * 2;
  const out = Buffer.alloc(size * size * 3);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = BG[0] / 255, g = BG[1] / 255, b = BG[2] / 255;
      if (x >= margin && x < margin + box && y >= margin && y < margin + box) {
        const sx = ((x - margin + 0.5) / box) * src.w - 0.5;
        const sy = ((y - margin + 0.5) / box) * src.h - 0.5;
        // Bilineal
        const x0 = Math.floor(sx), y0 = Math.floor(sy);
        const fx = sx - x0, fy = sy - y0;
        const c00 = sample(x0, y0), c10 = sample(x0 + 1, y0);
        const c01 = sample(x0, y0 + 1), c11 = sample(x0 + 1, y0 + 1);
        let lr = 0, lg = 0, lb = 0, la = 0;
        for (const [w, c] of [[(1 - fx) * (1 - fy), c00], [fx * (1 - fy), c10], [(1 - fx) * fy, c01], [fx * fy, c11]]) {
          lr += w * c[0]; lg += w * c[1]; lb += w * c[2]; la += w * c[3];
        }
        // Alpha directo sobre el fondo (se preservan los colores del logo).
        r = r * (1 - la) + lr * la;
        g = g * (1 - la) + lg * la;
        b = b * (1 - la) + lb * la;
      }
      const o = (y * size + x) * 3;
      out[o] = Math.round(r * 255); out[o + 1] = Math.round(g * 255); out[o + 2] = Math.round(b * 255);
    }
  }
  return encodePng(size, size, out);
}

for (const size of [192, 512]) {
  const file = join(root, 'public', 'assets', `icon-${size}.png`);
  writeFileSync(file, render(size));
  console.log(`OK ${file}`);
}
