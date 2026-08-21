/**
 * Public URL for an object in the uploads bucket.
 *
 * This is the inverse of storagePathFrom() in src/lib/uploads.ts, which lives
 * behind "server-only" and so cannot be imported by a client component. The
 * marker string is duplicated here deliberately: sharing it would mean either
 * dropping that guard or adding a third module for one constant.
 */
export function publicUploadUrl(path: string): string {
    // The configured URL may or may not carry a trailing slash — this project's
    // .env has one — so normalise rather than assuming either shape.
    const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
    return `${base}/storage/v1/object/public/uploads/${path}`;
}

/**
 * URL for a patient or employee document — objects that hold PHI/personal
 * data and live in the private "clinical-files" bucket, never the public
 * one. Routes through the session-checked API proxy rather than building a
 * Supabase URL directly, since the bucket has no public access at all. (TJ-024)
 */
export function clinicalFileUrl(path: string): string {
    return `/api/storage/clinical/${path}`;
}
