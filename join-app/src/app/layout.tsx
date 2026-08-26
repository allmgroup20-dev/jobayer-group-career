import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientLayout from "./client-layout";

const solaimanLipi = localFont({
  src: [
    { path: "./fonts/SolaimanLipi-Regular.woff", weight: "400", style: "normal" },
    { path: "./fonts/SolaimanLipi-Bold.woff", weight: "700", style: "normal" },
  ],
  display: "swap",
  preload: true,
  variable: "--font-bengali",
});

const cinzel = localFont({
  src: [{ path: "./fonts/certs/Cinzel-Variable.woff2", weight: "600 700", style: "normal" }],
  display: "swap",
  variable: "--font-cinzel",
});

const greatVibes = localFont({
  src: [{ path: "./fonts/certs/GreatVibes-Regular.woff2", weight: "400", style: "normal" }],
  display: "swap",
  variable: "--font-great-vibes",
});

const SITE_URL = process.env.SITE_URL || "https://youtube.earner.workers.dev";
const SITE_NAME = process.env.SITE_NAME || "YouTube Earner Worker";

export const metadata: Metadata = {
  title: {
    default: "ইউটিউব আর্নার — দক্ষতা শিখুন, রেওয়ার্ড আনলক করুন",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "ইউটিউব আর্নার — এখনই Google দিয়ে জয়েন করুন। ফ্রি ডেমো ক্লাস, ৯৭০+ প্রিমিয়াম রিসোর্স, সার্টিফিকেট ও বোনাস রিসোর্স। আমরা YouTube-এর অফিসিয়াল নিয়ম শেখাই — গ্যারান্টেড ইনকাম নয়, বাস্তব দক্ষতা। ১০০% মোবাইল ফ্রেন্ডলি।",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "ইউটিউব আর্নার — দক্ষতা শিখুন, রেওয়ার্ড আনলক করুন",
    description: "ফ্রি ডেমো ক্লাস, ৯৭০+ প্রিমিয়াম রিসোর্স, সার্টিফিকেট ও বোনাস রিসোর্স। Google দিয়ে এক ক্লিকে জয়েন করুন।",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "bn_BD",
  },
  twitter: {
    card: "summary",
    title: "ইউটিউব আর্নার — দক্ষতা শিখুন, রেওয়ার্ড আনলক করুন",
    description: "ফ্রি ডেমো ক্লাস, ৯৭০+ প্রিমিয়াম রিসোর্স, সার্টিফিকেট ও বোনাস রিসোর্স।",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f0f0f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${solaimanLipi.variable} ${cinzel.variable} ${greatVibes.variable}`}>
      <body className="min-h-screen bg-bg font-bengali antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
