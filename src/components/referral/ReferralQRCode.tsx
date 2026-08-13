"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

interface ReferralQRCodeProps {
  workerId: string;
  redirectPath?: string;
  size?: number;
  lang?: "bn" | "en";
}

export default function ReferralQRCode({
  workerId,
  redirectPath = "/register",
  size = 160,
  lang = "bn",
}: ReferralQRCodeProps) {
  const [url, setUrl] = useState("");
  const [downloadBusy, setDownloadBusy] = useState(false);

  useEffect(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    setUrl(`${base}${redirectPath}?ref=${encodeURIComponent(workerId)}`);
  }, [workerId, redirectPath]);

  const downloadPng = () => {
    const svg = document.getElementById("referral-qr-svg");
    if (!svg) return;
    setDownloadBusy(true);
    const canvas = document.createElement("canvas");
    const pad = 16;
    canvas.width = size + pad * 2;
    canvas.height = size + pad * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setDownloadBusy(false);
      return;
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, pad, pad, size, size);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `referral-qr-${workerId}.png`;
      a.click();
      setDownloadBusy(false);
    };
    img.onerror = () => setDownloadBusy(false);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-white p-3 rounded-xl border border-border shadow-sm">
        {url ? (
          <QRCode id="referral-qr-svg" value={url} size={size} />
        ) : (
          <div style={{ width: size, height: size }} className="animate-pulse bg-gray-100 rounded" />
        )}
      </div>
      {url && (
        <p className="text-[10px] text-text-secondary text-center">
          {lang === "bn" ? "📱 স্ক্যান করে যোগ দিন" : "📱 Scan to join"}
        </p>
      )}
      <button
        onClick={downloadPng}
        disabled={downloadBusy || !url}
        className="text-xs font-semibold text-action hover:underline disabled:opacity-50"
      >
        {downloadBusy ? "..." : lang === "bn" ? "⬇️ QR ডাউনলোড" : "⬇️ Download QR"}
      </button>
    </div>
  );
}
