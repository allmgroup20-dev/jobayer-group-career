const fs = require("fs");
const path = require("path");

const turbopackJs = path.resolve(
  __dirname,
  "..",
  "node_modules/@opennextjs/cloudflare/dist/cli/build/patches/plugins/turbopack.js"
);
const backup = turbopackJs + ".bak";

if (!fs.existsSync(backup)) {
  fs.copyFileSync(turbopackJs, backup);
}

let content = fs.readFileSync(turbopackJs, "utf8");

const patches = [
  {
    old: "patchCode: async ({ code, tracedFiles, filePath }) => {",
    new: `patchCode: async ({ code, tracedFiles, filePath }) => {
                tracedFiles = tracedFiles.map(f => f.replace(/\\\\/g, "/"));
                filePath = filePath.replace(/\\\\/g, "/");`,
  },
  {
    old: "function discoverExternalModuleMappings(filePath) {",
    new: `function discoverExternalModuleMappings(filePath) {
    filePath = filePath.replace(/\\\\/g, "/");`,
  },
  {
    old: 'const chunkFiles = tracedFiles.filter((f) => f.includes(".next/server/chunks/"));',
    new: 'const chunkFiles = tracedFiles.filter((f) => f.replace(/\\\\/g, "/").includes(".next/server/chunks/"));',
  },
  {
    old: 'if (file.includes(".next/server/chunks/")) {',
    new: 'if (file.replace(/\\\\/g, "/").includes(".next/server/chunks/")) {',
  },
  {
    old: 'chunk.replace(/.*\\/\\.next\\//, "")',
    new: 'chunk.replace(/\\\\/g, "/").replace(/.*\\/\\.next\\//, "")',
  },
  {
    old: '.map((absPath) => ({ absPath, relPath: absPath.replace(/.*\\/\\.next\\//, "") }))',
    new: '.map((absPath) => ({ absPath, relPath: absPath.replace(/\\\\/g, "/").replace(/.*\\/\\.next\\//, "") }))',
  },
  {
    old: 'const dotNextDir = filePath.replace(/\\/server\\/chunks\\/.*$/, "");',
    new: 'const dotNextDir = filePath.replace(/\\/server\\/chunks\\/.*$/, "").replace(/\\\\/g, "/");',
  },
];

for (const { old, new: replacement } of patches) {
  content = content.replace(old, replacement);
}

fs.writeFileSync(turbopackJs, content, "utf8");
console.log("\u2705 Patched turbopack.js for Windows path compatibility");
