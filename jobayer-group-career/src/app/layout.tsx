import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "Jobayer Group Career - Build Your Career With Us",
  description: "A premium MLM and e-commerce platform for career growth. Join the most rewarding affiliate marketing platform.",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Jobayer Group Career",
    description: "Build Your Career With Us",
    type: "website",
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
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-bg">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
