/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    unoptimized: false,
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 768, 1024, 1280],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-DNS-Prefetch-Control", value: "on" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
    {
      source: "/_next/static/:path*",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
  ],
};
