const fs = require("fs");
const path = require("path");

const openNextDir = path.resolve(__dirname, "..", ".open-next");
const assetsDir = path.join(openNextDir, "assets");
const workerJs = path.join(openNextDir, "worker.js");
const pagesWorkerJs = path.join(openNextDir, "_worker.js");

if (fs.existsSync(workerJs) && !fs.existsSync(pagesWorkerJs)) {
  let content = fs.readFileSync(workerJs, "utf8");
  content = content.replace(/^export\s+\{[^}]*?\}\s+from\s+["'].*?["'];?$/gm, (m) => {
    if (/DOQ|DOSh|Bucket|durable/i.test(m)) return "// " + m;
    return m;
  });
  fs.writeFileSync(pagesWorkerJs, content);
  console.log("Created _worker.js");
}

if (fs.existsSync(assetsDir)) {
  const entries = fs.readdirSync(assetsDir);
  let count = 0;
  for (const entry of entries) {
    const src = path.join(assetsDir, entry);
    const dst = path.join(openNextDir, entry);
    if (!fs.existsSync(dst)) {
      fs.cpSync(src, dst, { recursive: true, force: true });
      count++;
    }
  }
  console.log(`Moved ${count} asset entries to output root`);
}

console.log("Pages setup complete");
