import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// The anon key cannot delete from storage. Deletion needs the service-role
// key, which must never be NEXT_PUBLIC_ — it is a full read/write credential
// for the project. This module is server-only, so it cannot reach a bundle.
// When the key is absent the client is null and callers degrade to a no-op
// rather than failing, so a host that has not configured it still works.
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : null;
