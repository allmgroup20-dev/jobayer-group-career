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

function minify(absPath, label) {
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
minify(handlerPath, "handler.mjs");

const middlewarePath = path.resolve(__dirname, "..", ".open-next/middleware/handler.mjs");
minify(middlewarePath, "middleware/handler.mjs");

if (fs.existsSync(handlerPath)) {
  // Patch loadInstrumentationModule to tolerate errors without .code (Workers)
  let content = fs.readFileSync(handlerPath, "utf8");

  // catch in getInstrumentationModule (require shim in Workers produces code=undefined)
  const patch1 = /\.code!=="ENOENT"&&\.code!=="MODULE_NOT_FOUND"&&\.code!=="ERR_MODULE_NOT_FOUND"/;
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

  // Fix loadCustomCacheHandlers override: t/e variables are not defined (minification issue).
  // esbuild minifier renames all short identifiers unpredictably across builds, so match
  // every 2-letter var position with a regex and preserve whatever names were generated.
  const patch3 =
    /([A-Za-z_$]{1,2})&&\(0,([A-Za-z_$]{1,2})\.initializeCacheHandlers\)\(([A-Za-z_$]{1,2})\)\)for\(let\[([A-Za-z_$]{1,2}),([A-Za-z_$]{1,2})\]of Object\.entries\(([A-Za-z_$]{1,2})\)\)/g;
  let patch3Count = 0;
  content = content.replace(patch3, (m, cond, mod, arg, k1, k2, entriesVar) => {
    patch3Count++;
    return `this.nextConfig.experimental&&this.nextConfig.experimental.cacheHandlers&&(0,${mod}.initializeCacheHandlers)(this.nextConfig.experimental))for(let[${k1},${k2}]of Object.entries(this.nextConfig.experimental.cacheHandlers))`;
  });
  if (patch3Count > 0) {
    console.log(`Patched loadCustomCacheHandlers t/e references (${patch3Count} call-site(s))`);
  } else {
    console.warn("loadCustomCacheHandlers t/e pattern not found");
  }

  fs.writeFileSync(handlerPath, content);
  console.log(`handler.mjs patched: ${(fs.statSync(handlerPath).size / 1024).toFixed(1)} KB`);
} else {
  console.log("handler.mjs not found, skipping patch");
}
