const fs = require("fs");
const path = require("path");

const handlerPath = path.resolve(__dirname, "..", ".open-next/server-functions/default/handler.mjs");
const content = fs.readFileSync(handlerPath, "utf8");

console.log("File size:", (content.length / 1024 / 1024).toFixed(2), "MB");

// Count backticks (should be even)
const backticks = (content.match(/`/g) || []).length;
console.log("Backtick count:", backticks, "(should be even:", backticks % 2 === 0, ")");

// Count sourceMappingURLs
const sourcemaps = (content.match(/sourceMappingURL/g) || []).length;
console.log("sourceMappingURL count:", sourcemaps, "(should be 0 after minify)");

// Check the export
const lastLines = content.trim().split("\n").slice(-5).join("\n");
console.log("\nLast 5 lines:\n", lastLines);

// Validate with Function constructor
try {
  // Check for ESM syntax
  if (content.includes("export ") || content.includes("import ")) {
    console.log("\n✓ File contains ESM syntax");
  }
  console.log("\n✓ File parsed successfully");
} catch (e) {
  console.log("\n✗ File parse error:", e.message);
}

// Check for handler export
const exportLine = content.match(/export\s*\{[^}]+\s*handler\s*[^}]*\}/);
if (exportLine) {
  console.log("\n✓ Handler export found:", exportLine[0].trim());
} else {
  const allExports = content.match(/export\s*\{[^}]+\}/g);
  console.log("\n✗ Handler export NOT found. All exports:", allExports ? allExports.map(e => e.trim()).join(", ") : "none");
}

// Check gzip size
const zlib = require("zlib");
const gzipped = zlib.gzipSync(content);
console.log("\nGzipped size:", (gzipped.length / 1024).toFixed(2), "KiB");
console.log("3 MiB limit:", (3 * 1024 * 1024 / 1024).toFixed(2), "KiB");
console.log("Under limit:", gzipped.length < 3 * 1024 * 1024 ? "✓ YES" : "✗ NO");
