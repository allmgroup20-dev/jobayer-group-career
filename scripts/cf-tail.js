// Connect to Cloudflare Workers tail WebSocket and capture logs
const WebSocket = require("ws");
const https = require("https");

const ACCOUNT_ID = "c92314fd26d8b55eef8ac45606ceac5f";
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const SCRIPT_NAME = "jobayer-group-career";

async function main() {
  // Create a tail via API
  const createTail = () =>
    new Promise((resolve, reject) => {
      const data = JSON.stringify({
        url: "https://career.jobayergroup.com/",
        limit: 50,
        duration_minutes: 2,
      });
      const req = https.request(
        {
          hostname: "api.cloudflare.com",
          path: `/client/v4/accounts/${ACCOUNT_ID}/workers/scripts/${SCRIPT_NAME}/tails`,
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
            "Content-Length": data.length,
          },
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => {
            const result = JSON.parse(body);
            if (result.success) resolve(result.result);
            else reject(new Error(JSON.stringify(result.errors)));
          });
        }
      );
      req.write(data);
      req.end();
    });

  try {
    const tail = await createTail();
    console.log("Tail created:", tail.id);
    console.log("WebSocket URL:", tail.url);

    // Connect to WebSocket
    const ws = new WebSocket(tail.url, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
    });

    ws.on("open", () => {
      console.log("WebSocket connected, waiting for logs...");
      console.log("Hitting the worker now...");

      // Hit the worker to generate logs
      https
        .get("https://career.jobayergroup.com/api/health", (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            console.log(`Worker response: ${res.statusCode} ${data}`);
          });
        })
        .on("error", (e) => console.log("Request error:", e.message));
    });

    ws.on("message", (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        console.log("\n=== Tail Log ===");
        if (parsed.exceptions && parsed.exceptions.length > 0) {
          console.log("EXCEPTIONS:", JSON.stringify(parsed.exceptions, null, 2));
        }
        if (parsed.logs && parsed.logs.length > 0) {
          parsed.logs.forEach((log) => console.log("LOG:", log.message, log.timestamp));
        }
        if (parsed.event) {
          console.log("Event:", parsed.event.type, parsed.event.url, "->", parsed.event.outcome);
        }
        console.log("Full:", JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log("Raw message:", data.toString());
      }
    });

    ws.on("close", () => {
      console.log("WebSocket closed");
      process.exit(0);
    });

    ws.on("error", (err) => {
      console.error("WebSocket error:", err.message);
      process.exit(1);
    });

    // Wait up to 15 seconds
    setTimeout(() => {
      console.log("Timeout reached, exiting");
      ws.close();
      process.exit(0);
    }, 15000);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

main();
