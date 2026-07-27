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

function minify(path, label) {
  if (!fs.existsSync(path)) {
    console.log(`${label} not found, skipping`);
    return;
  }
  const before = fs.statSync(path).size;
  try {
    execSync(
      `npx esbuild "${path}" --minify --drop:console --allow-overwrite --outfile="${path}" --log-level=warning`,
      { stdio: "pipe", timeout: 60000 }
    );
    const after = fs.statSync(path).size;
    const saved = before - after;
    console.log(`${label}: ${(before / 1024).toFixed(1)} KB → ${(after / 1024).toFixed(1)} KB (saved ${(saved / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error(`${label} minify failed (non-fatal):`, err.message);
  }
}

const handlerPath = path.join(serverDir, "handler.mjs");
minify(handlerPath, "handler.mjs");

const middlewarePath = path.resolve(__dirname, "..", ".open-next/middleware/handler.mjs");
minify(middlewarePath, "middleware/handler.mjs");

// Patch loadInstrumentationModule to tolerate errors without .code (Workers)
let content = fs.readFileSync(handlerPath, "utf8");

const patch1 = /\.code!=="ENOENT"&&\.code!=="MODULE_NOT_FOUND"&&\.code!=="ERR_MODULE_NOT_FOUND"/;
const patched1 = '.code&&.code!=="ENOENT"&&.code!=="MODULE_NOT_FOUND"&&.code!=="ERR_MODULE_NOT_FOUND"';
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
} else {
  console.warn("loadCustomCacheHandlers t/e pattern not found");
}

fs.writeFileSync(handlerPath, content);
console.log(`handler.mjs patched: ${(fs.statSync(handlerPath).size / 1024).toFixed(1)} KB`);
