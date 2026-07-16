const fs = require("fs");
const path = require("path");

const workerJs = path.resolve(__dirname, "..", ".open-next/worker.js");

if (!fs.existsSync(workerJs)) {
  console.log("worker.js not found, skipping cache header fix");
  process.exit(0);
}

let content = fs.readFileSync(workerJs, "utf-8");

const patch = `
// Patched to prevent HTML caching at edge
`;

// Wrap the handler response to strip s-maxage for HTML
const target = "return handler(reqOrResp, env, ctx, request.signal);";
const replacement = `const resp = await handler(reqOrResp, env, ctx, request.signal);
            if (resp && resp.headers && resp.headers.get('content-type')?.startsWith('text/html')) {
              const newHeaders = new Headers(resp.headers);
              newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
              return new Response(resp.body, {
                status: resp.status,
                statusText: resp.statusText,
                headers: newHeaders,
              });
            }
            return resp;`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(workerJs, content, "utf-8");
  console.log("✅ Patched worker.js Cache-Control for HTML responses");
} else {
  console.log("⚠️  Could not find target pattern in worker.js");
}

// Remove s-maxage from asset responses via wrangler config
console.log("Cache header fix complete");
