// frontend/next.config.ts (or .mjs / .js)

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Or your existing config
  // Add the images configuration block here
  images: {
    remotePatterns: [
      {
        protocol: 'http', // Allow http protocol
        hostname: 'cdn.shopify.com', // Allow this specific hostname
        port: '', // Keep empty for default ports (80 for http)
        pathname: '/s/files/**', // Allow any path starting with /s/files/ on that host
      },
      // You could add more patterns here if needed for other domains
      // For example, if you had https images:
      // {
      //   protocol: 'https',
      //   hostname: 'some.other.domain.com',
      // },
    ],
  },
  // Any other configurations you might have...
};

export default nextConfig; // Or module.exports = nextConfig; if using CommonJS

