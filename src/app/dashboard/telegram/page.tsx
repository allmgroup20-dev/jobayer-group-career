"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useSWRFetch } from "@/lib/use-swr-fetch";

export default function TelegramSettingsPage() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const { data, loading, refresh } = useSWRFetch<{ webhook?: { url?: string; pendingCount?: number; error?: string }; hasEnvToken?: boolean }>(
    "/api/telegram/setup",
    { ttlMs: 180_000 }
  );

  const webhookInfo = data?.webhook ?? null;
  if (data?.hasEnvToken && !status) setStatus("TELEGRAM_BOT_TOKEN env var is set");

  const handleSetup = async () => {
    setStatus("Setting up webhook...");
    const res = await fetch("/api/telegram/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token || undefined }),
    });
    const d: any = await res.json();
    if (d.success) {
      setStatus("Webhook set up successfully!");
      refresh();
    } else {
      setStatus(`Error: ${d.error}`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Telegram Bot Settings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Bot Token</h2>
        <p className="text-sm text-gray-500 mb-3">
          Get a token from{" "}
          <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-blue-500 underline">
            @BotFather
          </a>{" "}
          on Telegram.
        </p>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter bot token"
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 mb-4"
        />
        <Button onClick={handleSetup}>Set Up Webhook</Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Webhook Status</h2>
        {loading ? (
          <p className="text-gray-500">Checking...</p>
        ) : (
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Status:</span>{" "}
              {status || (webhookInfo?.url ? "Active" : "Not set up")}
            </p>
            {webhookInfo?.url && (
              <>
                <p><span className="font-medium">URL:</span> {webhookInfo.url}</p>
                <p><span className="font-medium">Pending Updates:</span> {webhookInfo.pendingCount ?? "?"}</p>
              </>
            )}
            {webhookInfo?.error && (
              <p className="text-red-500">{webhookInfo.error}</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">How to Use</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <li>Create a bot on Telegram via <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-blue-500 underline">@BotFather</a></li>
          <li>Copy the bot token and paste it above</li>
          <li>Click "Set Up Webhook" to connect the bot</li>
          <li>Send a message to your bot on Telegram — it will be processed by the AI Brain!</li>
        </ol>
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm">
          <p className="font-medium mb-1">Phone identifier format:</p>
          <code className="text-xs">tg_&lt;chat_id&gt;</code>
          <p className="mt-1 text-gray-500">Telegram users are stored with prefix &quot;tg_&quot; in the system.</p>
        </div>
      </div>
    </div>
  );
}
