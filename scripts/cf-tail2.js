const { spawn, execSync } = require("child_process");
const https = require("https");

const ACCOUNT_ID = "c92314fd26d8b55eef8ac45606ceac5f";

// Delete existing tail first
try {
  const result = execSync(
    `curl -s -X DELETE "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/scripts/jobayer-group-career/tails" \
      -H "Authorization: Bearer ${process.env.CLOUDFLARE_API_TOKEN}"`,
    { timeout: 10000 }
  );
  console.log("Deleted existing tails:", result.toString());
} catch (e) {
  // Ignore errors
}

// Start wrangler tail as a child process
console.log("Starting wrangler tail...");
const tail = spawn("npx", [
  "wrangler",
  "tail",
  "--name",
  "jobayer-group-career",
  "--format",
  "json",
], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env },
  shell: true,
});

let output = "";

tail.stdout.on("data", (data) => {
  output += data.toString();
  console.log("TAIL:", data.toString());
});

tail.stderr.on("data", (data) => {
  const msg = data.toString();
  output += msg;
  // Only print non-trivial messages
  if (msg.trim() && !msg.includes("wrangler") && !msg.includes("Starting")) {
    console.log("STDERR:", msg);
  }
});

tail.on("error", (err) => {
  console.error("Tail error:", err.message);
});

// Wait a bit then hit the worker
setTimeout(() => {
  console.log("\nHitting worker...");
  https
    .get("https://career.jobayergroup.com/api/health", (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log(`Worker response: ${res.statusCode} - ${data.substring(0, 200)}`);
      });
    })
    .on("error", (e) => console.log("Request error:", e.message));
}, 5000);

// Stop after 15 seconds
setTimeout(() => {
  console.log("\n\n=== Final output ===");
  console.log(output);
  tail.kill();
  process.exit(0);
}, 20000);
