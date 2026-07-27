const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const serverDir = path.resolve(__dirname, "..", ".open-next/server-functions/default");

const removals = [
  "node_modules/next/dist/server/capsize-font-metrics.json",
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

function minify(absolutePath, label) {
  if (!fs.existsSync(absolutePath)) {
    console.log(`${label} not found, skipping`);
    return;
  }
  const before = fs.statSync(absolutePath).size;
  try {
    const result = execSync(
      `npx esbuild "${absolutePath}" --minify --drop:console --allow-overwrite --outfile="${absolutePath}" --log-level=warning`,
      { stdio: "pipe", timeout: 120000 }
    );
    const after = fs.statSync(absolutePath).size;
    const saved = before - after;
    console.log(`${label}: ${(before / 1024).toFixed(1)} KB \u2192 ${(after / 1024).toFixed(1)} KB (saved ${(saved / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error(`${label} esbuild failed:`, err.message);
    // fallback: simple console removal
    let content = fs.readFileSync(absolutePath, "utf8");
    const beforeFallback = content.length;
    content = content.replace(/console\.(log|warn|debug)\([^)]*\);?/g, "");
    const afterFallback = content.length;
    fs.writeFileSync(absolutePath, content, "utf8");
    console.log(`${label} fallback removed ${((beforeFallback - afterFallback) / 1024).toFixed(1)} KB`);
  }
}

const handlerPath = path.join(serverDir, "handler.mjs");
minify(handlerPath, "handler.mjs");

const middlewarePath = path.resolve(__dirname, "..", ".open-next/middleware/handler.mjs");
minify(middlewarePath, "middleware/handler.mjs");

// Patch loadInstrumentationModule to tolerate errors without .code (Workers/Pages)
let content = fs.readFileSync(handlerPath, "utf8");

const patch1 = /\.code!=="ENOENT"&&\.code!=="MODULE_NOT_FOUND"&&\.code!=="ERR_MODULE_NOT_FOUND"/;
if (patch1.test(content)) {
  content = content.replace(patch1, (m) => m[0] + "code&&" + m.slice(1));
  console.log("Patched getInstrumentationModule catch");
}

const patch2 = /\.code!=="MODULE_NOT_FOUND"/;
if (patch2.test(content)) {
  content = content.replace(patch2, (m) => m[0] + "code&&" + m.slice(1));
  console.log("Patched loadInstrumentationModule catch");
}

const patch3 = /t&&\(0,\w{2}\.initializeCacheHandlers\)\(e\)\)for\(let\[m,ge\]of Object\.entries\(t\)\)/;
const patch3Match = content.match(patch3);
if (patch3Match) {
  const varName = patch3Match[0].match(/\(0,(\w{2})\./)?.[1] || "ke";
  const exactOld = patch3Match[0];
  const exactNew = `this.nextConfig.experimental&&this.nextConfig.experimental.cacheHandlers&&(0,${varName}.initializeCacheHandlers)(this.nextConfig.experimental))for(let[m,ge]of Object.entries(this.nextConfig.experimental.cacheHandlers))`;
  content = content.replace(exactOld, exactNew);
  console.log(`Patched loadCustomCacheHandlers t/e references (var=${varName})`);
}

fs.writeFileSync(handlerPath, content);
const finalSize = fs.statSync(handlerPath).size;
console.log(`handler.mjs final: ${(finalSize / 1024).toFixed(1)} KB`);

// Also strip console.log from static chunk files for extra savings
const chunksDir = path.join(serverDir, ".next/server/chunks");
if (fs.existsSync(chunksDir)) {
  const chunks = fs.readdirSync(chunksDir).filter(f => f.endsWith(".js"));
  let saved = 0;
  for (const chunk of chunks) {
    const chunkPath = path.join(chunksDir, chunk);
    const before = fs.statSync(chunkPath).size;
    let chunkContent = fs.readFileSync(chunkPath, "utf8");
    const cleaned = chunkContent.replace(/console\.(log|debug|warn)\([^)]*\);?/g, "");
    if (cleaned.length < chunkContent.length) {
      fs.writeFileSync(chunkPath, cleaned, "utf8");
      saved += before - cleaned.length;
    }
  }
  if (saved > 0) console.log(`Stripped ${(saved / 1024).toFixed(1)} KB from static chunks`);
}
