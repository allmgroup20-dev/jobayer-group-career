const fs = require("fs");
const path = require("path");

const src = path.resolve(
  __dirname,
  "..",
  ".open-next/server-functions/default/.next/server"
);
const dst = path.resolve(
  __dirname,
  "..",
  ".open-next/server-functions/default/server"
);

if (fs.existsSync(src)) {
  fs.cpSync(src, dst, { recursive: true, force: true });
  console.log("Copied .next/server/ to server/");
} else {
  console.log("Source not found: " + src);
}
