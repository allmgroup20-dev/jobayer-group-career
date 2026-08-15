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

const SITE_URL = process.env.SITE_URL || "https://youtube.earner.workers.dev";
const SITE_NAME = process.env.SITE_NAME || "Jobayer Group Join";

export const metadata: Metadata = {
  title: {
    default: "Jobayer Group — এখনই জয়েন করুন, বোনাস ও রেফারেল আয়",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "এখনই Google দিয়ে জয়েন করুন — প্রিমিয়াম রিসোর্স, সাইনআপ বোনাস, রেফারেল কমিশন ও প্রতি রেফারেলে আয়ের সুযোগ। ১০০% মোবাইল ফ্রেন্ডলি।",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Jobayer Group — এখনই জয়েন করুন",
    description: "সাইনআপ বোনাস, প্রিমিয়াম রিসোর্স ও রেফারেল আয়। Google দিয়ে এক ক্লিকে জয়েন করুন।",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "bn_BD",
  },
  twitter: {
    card: "summary",
    title: "Jobayer Group — এখনই জয়েন করুন",
    description: "সাইনআপ বোনাস, প্রিমিয়াম রিসোর্স ও রেফারেল আয়।",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F97316",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${solaimanLipi.variable}`}>
      <body className="min-h-screen bg-bg font-bengali antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
