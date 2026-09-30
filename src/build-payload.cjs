const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(__dirname, 'core-game.js'));
const base64 = zlib.gzipSync(source, { level: 9 }).toString('base64');
const chunkSize = Math.ceil(base64.length / 4 / 4) * 4;
for (let i = 0; i < 4; i++) {
  const chunk = base64.slice(i * chunkSize, (i + 1) * chunkSize);
  fs.writeFileSync(path.join(root, 'payload', `game-gz-${i + 1}.txt`), chunk);
}
const rebuilt = zlib.gunzipSync(Buffer.from(base64, 'base64'));
if (!rebuilt.equals(source)) throw new Error('Payload differs from source');
console.log(`Built ${base64.length} base64 bytes from src/core-game.js`);
