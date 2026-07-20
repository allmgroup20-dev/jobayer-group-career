import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./client-layout";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
  variable: "--font-bengali",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Jobayer Group Career - Build Your Career With Us",
  description: "A premium JG Career and e-commerce platform for career growth. Join the most rewarding partnership platform.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Jobayer Group Career",
    description: "Build Your Career With Us",
    type: "website",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "JG Career",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1E3A5A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${hindSiliguri.variable} ${inter.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://career.jobayergroup.com" />
        <link rel="preload" href="/favicon.svg" as="image" />
      </head>
      <body className="min-h-screen bg-bg font-sans antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
