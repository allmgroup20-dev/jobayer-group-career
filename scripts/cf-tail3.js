const { spawn } = require("child_process");
const https = require("https");

// Start wrangler tail as a child process
console.log("Starting wrangler tail...");
const tail = spawn("npx", [
  "wrangler",
  "tail",
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
  const msg = data.toString();
  output += msg;
  try {
    const parsed = JSON.parse(msg);
    console.log("\n=== TAIL EVENT ===");
    if (parsed.exceptions && parsed.exceptions.length > 0) {
      console.log("EXCEPTIONS:", JSON.stringify(parsed.exceptions, null, 2));
    }
    if (parsed.logs && parsed.logs.length > 0) {
      parsed.logs.forEach((log) => console.log("LOG:", log.message));
    }
    if (parsed.event) {
      console.log("Event:", parsed.event.type, parsed.event.url, "->", parsed.event.outcome);
    }
    console.log("Full event:", JSON.stringify(parsed, null, 2));
  } catch (e) {
    console.log("RAW:", msg.trim());
  }
});

tail.stderr.on("data", (data) => {
  const msg = data.toString();
  output += msg;
  if (msg.trim() && !msg.includes("wrangler") && !msg.includes("Starting") && !msg.includes("logs")) {
    console.log("STDERR:", msg.trim());
  }
});

tail.on("error", (err) => {
  console.error("Tail error:", err.message);
});

// Wait then hit the worker multiple times
setTimeout(() => {
  console.log("\nHitting worker...");
  const urls = [
    "https://career.jobayergroup.com/api/health",
    "https://career.jobayergroup.com/",
  ];
  urls.forEach((url) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log(`${url} -> ${res.statusCode}`);
      });
    }).on("error", (e) => console.log("Error:", e.message));
  });
}, 5000);

// Stop after 20 seconds
setTimeout(() => {
  console.log("\n\n=== ALL OUTPUT ===");
  console.log(output);
  tail.kill();
  process.exit(0);
}, 25000);
