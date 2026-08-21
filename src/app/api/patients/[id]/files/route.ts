import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logPatientActivity } from "@/lib/audit";

const WRITE_ROLES = ["ADMIN", "DOCTOR", "SECRETARY"];

// POST /api/patients/[id]/files — attach a document to a patient.
// The file itself is uploaded separately via POST /api/upload (folder:
// "patient-files"); this endpoint only records the metadata against the
// returned path. There is no GET counterpart on purpose: the patient page
// already receives `files` from GET /api/patients/[id].
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!WRITE_ROLES.includes(session.user.role)) {
        return NextResponse.json({ error: "Not permitted to upload patient files" }, { status: 403 });
    }

    const { id } = await params;
    const patientId = parseInt(id, 10);
    if (isNaN(patientId)) {
        return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    const body = await req.json();
    const { fileName, filePath, fileType, fileSize } = body;

    if (!fileName || !filePath || !fileType || !fileSize) {
        return NextResponse.json(
            { error: "fileName, filePath, fileType and fileSize are required" },
            { status: 400 }
        );
    }

    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const file = await prisma.patientFile.create({
        data: { patientId, fileName, filePath, fileType, fileSize, uploadedById: session.user.id },
    });

    await prisma.patient.update({ where: { id: patientId }, data: { updatedById: session.user.id } });
    await logPatientActivity({
        patientId,
        userId: session.user.id,
        action: "FILE_ADDED",
        summary: fileName,
    });

    return NextResponse.json(file, { status: 201 });
}
