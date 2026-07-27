const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const dir = path.resolve(__dirname, "..", ".open-next");

if (!fs.existsSync(dir)) {
  console.log(".open-next not found");
  process.exit(0);
}

const targets = [
  "worker.js",
  "_worker.js",
  "cloudflare/images.js",
  "cloudflare/init.js",
  "cloudflare/skew-protection.js",
  "middleware/handler.mjs",
  "server-functions/default/handler.mjs",
];

console.log("\n=== Bundle sizes ===");
let totalGzip = 0;

for (const rel of targets) {
  const abs = path.join(dir, rel);
  if (fs.existsSync(abs)) {
    const raw = fs.readFileSync(abs);
    const gz = zlib.gzipSync(raw, { level: 9 });
    console.log(
      `${rel}: ${(raw.length / 1024).toFixed(1)} KB raw, ${(gz.length / 1024).toFixed(1)} KB gzip`
    );
    totalGzip += gz.length;
  } else {
    console.log(`${rel}: MISSING`);
  }
}

console.log(`\nTotal gzip: ${(totalGzip / 1024).toFixed(1)} KB`);
console.log(`3 MiB limit: ${(3 * 1024).toFixed(1)} KB`);
console.log(`Delta: ${(totalGzip / 1024 - 3 * 1024).toFixed(1)} KB ${totalGzip > 3 * 1024 * 1024 ? "OVER" : "under"}`);
