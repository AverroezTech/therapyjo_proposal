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
  async redirects() {
    // Escape 1 of the legacy-subpath catalogue (Production_Cutover.md, Hazard 5).
    //
    // The legacy Web Forms app does not know it is mounted under /clinic/, so
    // Response.Redirect emits ROOT-relative Location headers. Verified
    // 2026-08-23: a successful login at /clinic/ replies
    //   302 Location: /Admin/Index.aspx
    // which the browser resolves against the Vercel host, not IIS. The staff
    // member lands in THIS app, is bounced to /login by the auth middleware,
    // and never reaches the clinic system at all. Bounce those page
    // navigations back under the prefix so the address bar stays honest.
    //
    // Why redirects() and not a rewrite: Next's routing order is
    //   headers -> redirects -> MIDDLEWARE -> beforeFiles rewrites -> filesystem
    // so a rule here runs BEFORE the NextAuth middleware gets a chance to
    // intercept the path. A beforeFiles rewrite would lose that race — see the
    // .axd note in rewrites() below, which has to be paired with a middleware
    // matcher exclusion for exactly that reason.
    //
    // The (?!clinic/) lookahead is not optional: without it the rule matches
    // its own destination and every legacy page enters an infinite redirect.
    if (!LEGACY_ORIGIN) {
      return [];
    }
    return [
      {
        source: "/:file((?!clinic/).*\\.aspx)",
        destination: "/clinic/:file",
        // 307, not 308 — preserves method and body, so an escaped Web Forms
        // POSTBACK survives the bounce instead of being downgraded to GET.
        permanent: false,
      },
    ];
  },
  async rewrites() {
    // No legacy origin configured (e.g. preview deployments) — /clinic falls
    // through to the app's normal routing and 404s honestly rather than
    // proxying anywhere.
    if (!LEGACY_ORIGIN) {
      return [];
    }
    return {
      // beforeFiles: this must win over the filesystem and dynamic routes, so
      // a page or route added later under /clinic can never accidentally
      // shadow the proxy.
      beforeFiles: [
        {
          // Escape 3 of the catalogue, measured in production 2026-08-28:
          //   https://therapyjo.com/clinic/admin/  ->  301  Location: https://online.therapyjo.com/admin/
          // ":path*" is a path-to-regexp repeated-segment param — it SPLITS
          // the remainder into "/"-separated segments and rejoins them when
          // building the destination, which drops a trailing empty segment.
          // "/clinic/admin/" therefore reached the origin as "/admin", not
          // "/admin/", and IIS's directory-canonicalisation redirect fired —
          // the ONLY redirect the legacy app emits as an ABSOLUTE URL (every
          // other legacy redirect is root-relative; see Escape 1 above).
          // Confirmed directly against the origin: "/admin/" replies
          // "302 Location: /Login.aspx" (relative, harmless); "/admin"
          // replies "301 Location: https://online.therapyjo.com/admin/",
          // which escapes the /clinic/ wrapper entirely.
          //
          // ":path(.*)" is a named param with a literal regex capture, not a
          // repeated segment — it takes the remainder as one raw string,
          // trailing slash included, and substitutes it verbatim. A bare
          // "/clinic/" still resolves correctly: the capture is "", so the
          // destination is "${LEGACY_ORIGIN}/" (one slash, from the literal
          // "/" before ":path"), not "${LEGACY_ORIGIN}//".
          source: "/clinic/:path(.*)",
          destination: `${LEGACY_ORIGIN}/:path`,
        },
        // Escape 2 of the catalogue. ASP.NET emits its script/resource handler
        // URLs root-relative and unconditionally: the authenticated admin page
        // carries 21 references to /WebResource.axd and /ScriptResource.axd.
        // Unproxied they 404 in this app, which kills the legacy page's
        // JavaScript and therefore every postback on it. Rewritten (not
        // redirected) so there is no extra round trip on 21 assets.
        //
        // LOAD-BEARING PAIRING: beforeFiles rewrites run AFTER middleware, so
        // this rule is dead code unless src/middleware.ts also excludes .axd
        // from its matcher — otherwise NextAuth answers first with a redirect
        // to /login. That exclusion is why the /clinic rule above works too.
        // Do not remove one without the other.
        {
          source: "/:file((?!clinic/).*\\.axd)",
          destination: `${LEGACY_ORIGIN}/:file`,
        },
        // There was also a rewrite here sending /.well-known/acme-challenge/*
        // to the legacy origin, so that host could keep renewing a TLS
        // certificate for a name that now resolves to Vercel. It was removed
        // on 2026-08-23 because it cannot work: Vercel serves that path
        // itself, at the platform layer, ahead of application routing. A
        // request for it returns Vercel's own token store —
        //   X-Vercel-Acme-Ips: 216.198.79.3,64.29.17.3,...
        //   {"error":{"message":"Token not found","code":"not_found",...}}
        // — never reaching this config. Do not re-add it; see
        // Production_Cutover.md, Hazard 9.
      ],
    };
  },
};

export default nextConfig;
