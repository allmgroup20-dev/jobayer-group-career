const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

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

function minifyAndPatch(absPath, label) {
  if (!fs.existsSync(absPath)) {
    console.log(`${label} not found, skipping`);
    return;
  }
  const before = fs.statSync(absPath).size;
  console.log(`\n${label} before extra minify: ${(before / 1024).toFixed(1)} KB`);

  try {
    execSync(
      `npx esbuild "${absPath}" --minify --drop:console --drop:debugger --allow-overwrite --outfile="${absPath}" --log-level=warning`,
      { stdio: "pipe", timeout: 120000 }
    );
    const after = fs.statSync(absPath).size;
    const saved = before - after;
    console.log(`${label} after extra minify: ${(after / 1024).toFixed(1)} KB (saved ${(saved / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error(`${label} esbuild failed:`, err.message);
  }
}

const handlerPath = path.join(serverDir, "handler.mjs");
minifyAndPatch(handlerPath, "handler.mjs");

const middlewarePath = path.resolve(__dirname, "..", ".open-next/middleware/handler.mjs");
minifyAndPatch(middlewarePath, "middleware/handler.mjs");

  // Patch loadInstrumentationModule to tolerate errors without .code (Workers)
  let content = fs.readFileSync(handlerPath, "utf8");

  // catch in getInstrumentationModule (require shim in Workers produces code=undefined)
  const patch1 = /\.code!=="ENOENT"&&\.code!=="MODULE_NOT_FOUND"&&\.code!=="ERR_MODULE_NOT_FOUND"/;
  const patched1 = '.code&&.code!=="ENOENT"&&.code!=="MODULE_NOT_FOUND"&&.code!=="ERR_MODULE_NOT_FOUND"';
  // Already fixed in newer Next.js — skip if pattern not found
  if (patch1.test(content)) {
    content = content.replace(patch1, (m) => m[0] + "code&&" + m.slice(1));
    console.log("Patched getInstrumentationModule catch");
  }

  // catch in loadInstrumentationModule (re-throws as "An error occurred while loading the instrumentation hook")
  const patch2 = /\.code!=="MODULE_NOT_FOUND"/;
  // Already fixed in newer Next.js — skip if pattern not found
  if (patch2.test(content)) {
    content = content.replace(patch2, (m) => m[0] + "code&&" + m.slice(1));
    console.log("Patched loadInstrumentationModule catch");
  }

  // Fix loadCustomCacheHandlers override: t/e variables are not defined (minification issue)
  // Use regex to match any 2-letter var name (esbuild minifier varies them across builds)
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

} else {
  console.log("handler.mjs not found, skipping extra minify");
}
