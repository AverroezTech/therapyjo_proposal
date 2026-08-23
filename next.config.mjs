// Clinic operates in Jordan — pin the Node process timezone so date-only
// strings (reservation dates, "today" boundaries) resolve to Asia/Amman
// instead of whatever timezone the deploy host defaults to (e.g. UTC on Vercel).
//
// This line only takes effect where this module is actually evaluated:
// `next dev`, and the build-time process that prerenders static pages. It
// does NOT reach Vercel's deployed serverless runtime — Vercel serializes
// the resolved config to JSON rather than re-running this file, so this
// assignment never executes there. src/instrumentation.ts sets the same
// process.env.TZ, but for that runtime instead, via Next's register() hook
// which Next calls once per server instance at bootstrap. The two are
// complementary, not redundant — do not delete either one thinking it
// duplicates the other.
process.env.TZ = "Asia/Amman";

// Absolute origin of the legacy ASP.NET clinic system (e.g. "https://www.therapyjo.com").
// Unset in preview deployments — /clinic then 404s, which is correct there.
const LEGACY_ORIGIN = process.env.LEGACY_ORIGIN;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Load-bearing: the legacy app's markup is relative to "/clinic/", so the
  // trailing slash must survive the proxy. Next's default behavior would
  // redirect "/clinic/" -> "/clinic", fighting the redirect below and
  // producing a loop.
  skipTrailingSlashRedirect: true,
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
  // NOTE: the "/clinic" -> "/clinic/" redirect is deliberately NOT implemented
  // here as a next.config redirects() entry. Next.js compiles every redirects()
  // source with an optional trailing slash baked in (see
  // next/dist/lib/redirect-status.js#modifyRouteRegex, which unconditionally
  // appends "(?:\/)?$" to the regex) — documented behavior: "redirects always
  // match irrespective of trailing slash." A rule with source "/clinic" would
  // therefore also match "/clinic/" itself and redirect it to "/clinic/",
  // i.e. to itself — a self-redirect loop. skipTrailingSlashRedirect above
  // only disables Next's own automatic slash-normalizing redirect; it does
  // not change this. The exact-match redirect is implemented in
  // src/middleware.ts instead, where a plain string comparison has no such
  // leniency.
  async rewrites() {
    // No legacy origin configured (e.g. preview deployments) — /clinic and
    // /.well-known/acme-challenge fall through to the app's normal routing
    // and 404 honestly rather than proxying anywhere.
    if (!LEGACY_ORIGIN) {
      return [];
    }
    return {
      // beforeFiles: these must win over the filesystem and dynamic routes,
      // so a page or route added later under /clinic or /.well-known can
      // never accidentally shadow the proxy.
      beforeFiles: [
        {
          source: "/clinic/:path*",
          destination: `${LEGACY_ORIGIN}/:path*`,
        },
        // UNDER EVALUATION: lets the legacy host keep renewing a TLS
        // certificate for a hostname that now resolves to Vercel, by
        // proxying ACME HTTP-01 challenge requests back to it. May need to
        // be removed if it interferes with Vercel's own certificate
        // issuance for the same hostname.
        {
          source: "/.well-known/acme-challenge/:token*",
          destination: `${LEGACY_ORIGIN}/.well-known/acme-challenge/:token*`,
        },
      ],
    };
  },
};

export default nextConfig;
