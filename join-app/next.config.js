/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  agentRules: false,
  images: {
    unoptimized: true,
    formats: ["image/webp"],
    deviceSizes: [640, 768, 1024, 1280],
  },
};
