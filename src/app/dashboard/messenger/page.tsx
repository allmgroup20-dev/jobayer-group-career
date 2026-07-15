"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function MessengerSettingsPage() {
  const [token, setToken] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [config, setConfig] = useState<{
    hasPageToken?: boolean; hasVerifyToken?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/messenger/setup")
      .then((r) => r.json())
      .then((data: any) => {
        setConfig(data);
        if (data.hasPageToken) setStatus("MESSENGER_PAGE_TOKEN env var is set");
      })
      .catch(() => setStatus("Failed to check config"))
      .finally(() => setLoading(false));
  }, []);

  const handleSetup = async () => {
    setStatus("Setting up webhook...");
    const res = await fetch("/api/messenger/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageToken: token || undefined,
        verifyToken: verifyToken || undefined,
      }),
    });
    const data: any = await res.json();
    if (data.success) {
      setStatus("Webhook set up successfully!");
    } else {
      setStatus(`Error: ${data.error}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Facebook Messenger Settings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Page Token</h2>
        <p className="text-sm text-gray-500 mb-3">
          Get a Page Access Token from{" "}
          <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="text-blue-500 underline">
            Facebook Developers
          </a>{" "}
          → Your App → Messenger → Settings.
        </p>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Page Access Token (EAAP...)"
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 mb-4"
        />
        <h2 className="text-lg font-semibold mb-4">Verify Token</h2>
        <p className="text-sm text-gray-500 mb-3">
          A secret string of your choice — used to verify the webhook with Facebook.
        </p>
        <input
          type="text"
          value={verifyToken || process.env.NEXT_PUBLIC_MESSENGER_VERIFY_TOKEN || ""}
          onChange={(e) => setVerifyToken(e.target.value)}
          placeholder="my_custom_verify_token"
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 mb-4"
        />
        <Button onClick={handleSetup}>Set Up Webhook</Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Configuration Status</h2>
        {loading ? (
          <p className="text-gray-500">Checking...</p>
        ) : (
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Page Token:</span>{" "}
              {config?.hasPageToken ? "✅ Set" : "❌ Not set"}
            </p>
            <p>
              <span className="font-medium">Verify Token:</span>{" "}
              {config?.hasVerifyToken ? "✅ Set" : "❌ Not set"}
            </p>
            {status && <p className="mt-2">{status}</p>}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">How to Set Up</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <li>
            Go to{" "}
            <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="text-blue-500 underline">
              Facebook Developers
            </a>{" "}
            → Create App → Business
          </li>
          <li>Add Messenger product → Generate Page Access Token</li>
          <li>Set up Webhook: Callback URL = your domain + <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1">/api/messenger/webhook</code></li>
          <li>Verify Token = the secret string you chose</li>
          <li>Subscribe to <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1">messages</code> and <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1">messaging_postbacks</code></li>
          <li>Send a message to your Page — the AI Brain will reply!</li>
        </ol>
      </div>
    </div>
  );
}
