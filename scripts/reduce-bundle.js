const fs = require("fs");
const path = require("path");

const serverDir = path.resolve(__dirname, "..", ".open-next/server-functions/default");

const removals = [
  // Google Fonts metrics — unused (only use next/font/local)
  "node_modules/next/dist/server/capsize-font-metrics.json",
  // esbuild metadata — not needed at runtime
  "handler.mjs.meta.json",
];

for (const rel of removals) {
  const target = path.join(serverDir, rel);
  if (fs.existsSync(target)) {
    const size = fs.statSync(target).size;
    fs.rmSync(target);
    console.log(`Removed ${rel} (${(size / 1024).toFixed(1)} KB)`);
  } else {
    console.log(`${rel} not found, skipping`);
  }
}

// Strip large .map files recursively (source maps are not needed at runtime)
function stripSourceMaps(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      stripSourceMaps(fullPath);
    } else if (entry.name.endsWith(".map")) {
      const size = fs.statSync(fullPath).size;
      fs.rmSync(fullPath);
      if (size > 0) console.log(`Removed source map ${path.relative(serverDir, fullPath)} (${(size / 1024).toFixed(1)} KB)`);
    }
  }
}
stripSourceMaps(path.join(serverDir, ".next"));
stripSourceMaps(path.join(serverDir, "node_modules"));
