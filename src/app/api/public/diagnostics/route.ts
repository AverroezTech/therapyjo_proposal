import { NextResponse } from "next/server";

// TEMPORARY — added for production cutover verification of the
// src/instrumentation.ts timezone fix (Vercel rejects TZ as an env var, so
// process.env.TZ must be set at runtime instead of at build time). Remove
// this route once cutover is confirmed.
//
// Reports only timezone facts — no env vars, versions, database access, or
// request details — so it is safe to leave public under /api/public.
//
// Must stay dynamic: without force-dynamic, Next would prerender this at
// build time and it would report the BUILD machine's timezone forever,
// which looks like a pass while proving nothing about the deployed runtime.
export const dynamic = "force-dynamic";

export async function GET() {
    return NextResponse.json({
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        now: new Date().toString(),
        offsetMinutes: new Date().getTimezoneOffset(),
        // Boundary case: 23:30 UTC is already the next calendar day in
        // Asia/Amman (UTC+3) — makes a wrong timezone visible at a glance.
        sample: new Date("2026-08-23T23:30:00Z").toString(),
    });
}
