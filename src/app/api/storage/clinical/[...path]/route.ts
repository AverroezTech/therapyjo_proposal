import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/storage/clinical/<path> — the only way to reach an object in the
// private "clinical-files" bucket. Requires a signed-in session (any staff
// role); which specific patient/employee record a caller may link to is
// already decided by the API that handed them the path, matching how the
// rest of the app gates clinical data. Redirects to a short-lived signed
// URL rather than streaming, so this stays a thin proxy. (TJ-024)
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!supabaseAdmin) {
        return NextResponse.json(
            { error: "Storage not configured (SUPABASE_SERVICE_ROLE_KEY unset)" },
            { status: 503 }
        );
    }

    const { path } = await params;
    const objectPath = path.join("/");

    const { data, error } = await supabaseAdmin.storage
        .from("clinical-files")
        .createSignedUrl(objectPath, 60);

    if (error || !data) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.redirect(data.signedUrl);
}
