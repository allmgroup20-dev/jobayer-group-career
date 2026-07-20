const fs = require("fs");
const path = require("path");

const workerJs = path.resolve(__dirname, "..", ".open-next/worker.js");

if (!fs.existsSync(workerJs)) {
  console.log("worker.js not found, skipping cache header fix");
  process.exit(0);
}

let content = fs.readFileSync(workerJs, "utf-8");

const target = "return handler(reqOrResp, env, ctx, request.signal);";
const replacement = `const resp = await handler(reqOrResp, env, ctx, request.signal);
            if (resp && resp.headers) {
              const ct = resp.headers.get('content-type') || '';
              // Cache HTML at CDN edge for 1 hour (revalidate)
              if (ct.startsWith('text/html') && !resp.url?.includes('/api/') && !resp.url?.includes('/dashboard') && !resp.url?.includes('/company/')) {
                const newHeaders = new Headers(resp.headers);
                if (!newHeaders.has('Cache-Control')) {
                  newHeaders.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
                }
                return new Response(resp.body, {
                  status: resp.status,
                  statusText: resp.statusText,
                  headers: newHeaders,
                });
              }
              // API responses — no cache
              if (resp.url?.includes('/api/')) {
                const newHeaders = new Headers(resp.headers);
                newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
                return new Response(resp.body, {
                  status: resp.status,
                  statusText: resp.statusText,
                  headers: newHeaders,
                });
              }
            }
            return resp;`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(workerJs, content, "utf-8");
  console.log("✅ Patched worker.js — Smart caching enabled (HTML: 1h CDN, API: no cache)");
} else {
  console.log("⚠️  Could not find target pattern in worker.js");
}
