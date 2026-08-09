// Clinic operates in Jordan — pin the Node process timezone so date-only
// strings (reservation dates, "today" boundaries) resolve to Asia/Amman
// instead of whatever timezone the deploy host defaults to (e.g. UTC on Vercel).
process.env.TZ = "Asia/Amman";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // Prevent bfcache on protected routes so back/forward always re-checks auth
        source: "/(admin|secretary|doctor)(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
};

export default nextConfig;
