// Pins the Node process timezone to the clinic's timezone (Jordan) at
// runtime, on every serverless instance, before any request is handled.
//
// Why this exists: next.config.mjs also sets `process.env.TZ = "Asia/Amman"`
// at module scope, but that module is evaluated at BUILD time. Vercel does
// not re-run it in the serverless runtime — it serializes the resolved
// config to JSON and ships that, so the side effect of assigning
// process.env.TZ never reaches the running server. Without this file, every
// deployed instance falls back to the host's default timezone (UTC on
// Vercel), and any `new Date(...)` / `toISOString()` call site that relies
// on the ambient timezone silently shifts by three hours — enough to file a
// late-night appointment (00:00–03:00 Asia/Amman) under the previous
// calendar day.
//
// Why not an environment variable instead: Vercel rejects `TZ` as a
// reserved variable name (it's owned by the underlying AWS Lambda runtime),
// so a project-level TZ env var is not an option there.
//
// This is a STOPGAP, not the real fix. Setting process.env.TZ changes an
// ambient, process-wide default that every date computation in the app
// implicitly depends on — it's easy to get right today and silently wrong
// again the moment a call site is written without it in mind (e.g. code
// that runs in a context where this file hasn't executed, or a future
// runtime that ignores TZ entirely). The durable fix is to stop depending
// on the ambient timezone at all: compute date-only boundaries ("today",
// "this appointment's calendar day") with an explicit `timeZone: "Asia/Amman"`
// option (Intl.DateTimeFormat, date-fns-tz, etc.) at each call site instead
// of inheriting whatever process.env.TZ happens to be.
//
// Next.js calls register() once per server instance, at bootstrap, before
// any request is handled — see
// https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
export async function register() {
    // The Edge runtime has no mutable process.env and cannot set a process
    // timezone at all — guard so this only runs under Node.
    if (process.env.NEXT_RUNTIME === "nodejs") {
        process.env.TZ = "Asia/Amman";
    }
}
