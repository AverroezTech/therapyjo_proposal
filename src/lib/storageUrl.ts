/**
 * Public URL for an object in the uploads bucket.
 *
 * This is the inverse of storagePathFrom() in src/lib/uploads.ts, which lives
 * behind "server-only" and so cannot be imported by a client component. The
 * marker string is duplicated here deliberately: sharing it would mean either
 * dropping that guard or adding a third module for one constant.
 */
export function publicUploadUrl(path: string): string {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${path}`;
}
