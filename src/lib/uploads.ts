import "server-only";
import { supabaseAdmin } from "@/lib/supabase";

const BUCKET = "uploads";
const PUBLIC_MARKER = `/storage/v1/object/public/${BUCKET}/`;

/**
 * Callers store uploads inconsistently: the *File models keep the storage
 * path, while pictureUrl / photo / coverImage keep the full public URL.
 * Accept either and return the path, or null if it is neither.
 */
export function storagePathFrom(value: string | null | undefined): string | null {
    if (!value) return null;
    const i = value.indexOf(PUBLIC_MARKER);
    if (i !== -1) return value.slice(i + PUBLIC_MARKER.length) || null;
    if (value.startsWith("http://") || value.startsWith("https://")) return null;
    return value;
}

/**
 * Best-effort removal of a stored object. Never throws: a failure here must
 * not turn a successful row deletion into a 500, and a host without the
 * service-role key configured must keep working.
 */
export async function removeUpload(value: string | null | undefined): Promise<boolean> {
    const path = storagePathFrom(value);
    if (!path) return false;

    if (!supabaseAdmin) {
        console.warn(`[uploads] SUPABASE_SERVICE_ROLE_KEY unset — leaving ${path} in storage`);
        return false;
    }

    const { error } = await supabaseAdmin.storage.from(BUCKET).remove([path]);
    if (error) {
        console.error(`[uploads] failed to remove ${path}: ${error.message}`);
        return false;
    }
    return true;
}
