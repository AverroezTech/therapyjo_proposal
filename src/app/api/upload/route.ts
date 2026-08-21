import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import sharp from "sharp";

// Patient documents and employee ID documents hold real PHI/personal data and
// go to the private "clinical-files" bucket via the service-role client.
// Everything else (avatars, blog covers, doctor profile photos) is meant to
// be publicly viewable and keeps using the public "uploads" bucket. (TJ-024)
const CLINICAL_FOLDERS = ["patient-files", "employee-files"];

// POST /api/upload — upload an image, convert to WebP, store in Supabase Storage
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const requestedFolder = (formData.get("folder") as string) || "general";
    const ALLOWED_FOLDERS = ["general", "doctors", "secretaries", "patients", "patient-files", "employee-files", "blog", "doctor-profiles"];
    const folder = ALLOWED_FOLDERS.includes(requestedFolder) ? requestedFolder : "general";

    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const isImage = file.type.startsWith("image/");

    let uploadBuffer: Buffer;
    let fileName: string;
    let contentType: string;

    if (isImage) {
        // Convert images to WebP
        uploadBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
        fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
        contentType = "image/webp";
    } else {
        // Keep non-image files as-is (PDFs, etc.)
        uploadBuffer = buffer;
        const ext = file.name.split(".").pop() || "bin";
        fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        contentType = file.type || "application/octet-stream";
    }

    const isClinical = CLINICAL_FOLDERS.includes(folder);

    if (isClinical) {
        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: "Storage not configured for clinical documents (SUPABASE_SERVICE_ROLE_KEY unset)" },
                { status: 503 }
            );
        }
        const { error } = await supabaseAdmin.storage
            .from("clinical-files")
            .upload(fileName, uploadBuffer, { contentType, upsert: false });

        if (error) {
            console.error("Supabase upload error:", error);
            return NextResponse.json(
                { error: "Upload failed: " + error.message },
                { status: 500 }
            );
        }

        // No public URL for a private bucket — the caller reaches the file
        // through the session-checked /api/storage/clinical/[...path] route.
        return NextResponse.json({ path: fileName, contentType });
    }

    const { error } = await supabase.storage
        .from("uploads")
        .upload(fileName, uploadBuffer, {
            contentType,
            upsert: false,
        });

    if (error) {
        console.error("Supabase upload error:", error);
        return NextResponse.json(
            { error: "Upload failed: " + error.message },
            { status: 500 }
        );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(fileName);

    return NextResponse.json({
        url: urlData.publicUrl,
        path: fileName,
        contentType,
    });
}
