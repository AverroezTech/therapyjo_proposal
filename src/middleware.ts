import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

// Edge-safe middleware — uses authConfig which does NOT import Prisma
const { auth } = NextAuth(authConfig);

// Wraps the NextAuth middleware so we can add one exact-match redirect
// ahead of the legacy-clinic proxy: "/clinic" (no trailing slash) -> "/clinic/".
// This can't live in next.config.mjs's redirects() — Next.js compiles every
// redirects() source with an optional trailing slash baked in (see
// next/dist/lib/redirect-status.js#modifyRouteRegex, which unconditionally
// appends "(?:\/)?$"), so a rule with source "/clinic" also matches "/clinic/"
// itself and would redirect it to "/clinic/" — a self-redirect loop. A plain
// string comparison here has no such leniency. "/clinic" is a publicRoute in
// auth.config.ts, so unauthenticated requests reach this callback rather than
// being sent to /login.
export default auth((req) => {
    if (req.nextUrl.pathname === "/clinic") {
        return NextResponse.redirect(new URL("/clinic/", req.nextUrl));
    }
});

export const config = {
    matcher: [
        /*
         * Match all request paths EXCEPT:
         *  - _next/static (Next.js static files)
         *  - _next/image  (Next.js image optimization)
         *  - favicon.ico  (browser favicon)
         *  - Static assets served from public/ (images, videos, icons, etc.)
         *  - clinic/ (proxied to the legacy ASP.NET system — anchored to the
         *    segment with a required trailing slash, so /clinicians is NOT
         *    exempted. Bare "/clinic" (no slash) is deliberately NOT excluded
         *    here — it still needs to reach the handler above for the
         *    exact-match redirect to "/clinic/".)
         *  - .well-known/ (ACME certificate validation, proxied to legacy)
         *
         * These exclusions matter: without them, NextAuth middleware would
         * intercept these paths and redirect unauthenticated requests to
         * /login, breaking the legacy proxy and ACME validation.
         */
        "/((?!_next/static|_next/image|favicon\\.ico|clinic/|\\.well-known/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|mp3|woff|woff2|ttf|eot|css|js)$).*)",
    ],
};
