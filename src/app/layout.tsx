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

export const metadata: Metadata = {
  title: {
    default: "Jobayer Group Career - Build Your Career With Us",
    template: "%s | Jobayer Group Career",
  },
  description: "এককালীন রিসোর্স আনলক — ৯৭০+ প্রিমিয়াম রিসোর্স মাত্র ৳৯৯ থেকে। ক্যারিয়ার, ফ্রিল্যান্সিং ও স্কিল ডেভেলপমেন্ট বাংলা প্ল্যাটফর্ম।",
  manifest: "/manifest.json",
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.SITE_URL || "https://career.jobayergroup.com"),
  alternates: { canonical: "/" },
  keywords: ["ক্যারিয়ার", "ফ্রিল্যান্সিং", "বাংলা কোর্স", "রিসোর্স", "jobayer group career", "career bangladesh"],
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Jobayer Group Career",
    description: "৯৭০+ প্রিমিয়াম রিসোর্স মাত্র ৳৯৯ থেকে — এককালীন, কোনো সাবস্ক্রিপশন নেই।",
    url: "https://career.jobayergroup.com",
    siteName: "Jobayer Group Career",
    type: "website",
    locale: "bn_BD",
    images: [{ url: "/favicon.svg", width: 512, height: 512, alt: "Jobayer Group Career" }],
  },
  twitter: {
    card: "summary",
    title: "Jobayer Group Career",
    description: "৯৭০+ প্রিমিয়াম রিসোর্স মাত্র ৳৯৯ থেকে।",
    images: ["/favicon.svg"],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "JG Career",
  },
};

const CONTENT_DESCRIPTION =
  "Jobayer Group Career একটি বাংলা ক্যারিয়ার ও ফ্রিল্যান্সিং প্ল্যাটফর্ম — ৯৭০+ প্রিমিয়াম রিসোর্স, স্কিল ডেভেলপমেন্ট ও রেফারেল-কমিশন আয়ের সুযোগ।";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0F1E36",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const baseUrl = process.env.SITE_URL || "https://career.jobayergroup.com";
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    name: "Jobayer Group Career",
    alternateName: "JG Career",
    description: CONTENT_DESCRIPTION,
    url: baseUrl,
    inLanguage: "bn-BD",
  };
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Jobayer Group Career",
    url: baseUrl,
    logo: `${baseUrl}/favicon.svg`,
  };
  return (
    <html lang="bn" className={`${solaimanLipi.variable}`}>
      <head>
        <link rel="preload" href="/favicon.svg" as="image" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([websiteSchema, orgSchema]) }}
        />
      </head>
      <body className="min-h-screen bg-bg font-bengali antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
