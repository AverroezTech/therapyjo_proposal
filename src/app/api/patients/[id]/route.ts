import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canAccessClinical } from "@/lib/permissions";
import { removeUpload } from "@/lib/uploads";
import { logPatientActivity } from "@/lib/audit";

// Staff roles allowed to write a patient record. All three roles that can
// reach a patient page today — anyone else (should a 4th role ever exist)
// is refused rather than implicitly allowed. (TJ-024)
const WRITE_ROLES = ["ADMIN", "DOCTOR", "SECRETARY"];

// GET /api/patients/[id] — single patient with intake + reservations
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const patientId = parseInt(id, 10);
    if (isNaN(patientId)) {
        return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    // A secretary needs this endpoint — it carries the name, phones, files and
    // session list their whole patient page is built from — so the clinical
    // branches are omitted rather than the request refused. Prisma accepts a
    // boolean here, the same idiom `username: isAdmin` already uses in the
    // employee routes. (TJ-023)
    const clinical = canAccessClinical(session.user);

    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
            intake: clinical,
            files: {
                orderBy: { uploadedAt: "desc" },
            },
            reservations: {
                include: {
                    doctor: { select: { id: true, name: true, color: true } },
                    soapNote: clinical,
                },
                orderBy: { sessionDate: "desc" },
            },
            updatedBy: { select: { id: true, name: true, role: true } },
        },
    });

    if (!patient) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(patient);
}

// PUT /api/patients/[id] — update patient info
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!WRITE_ROLES.includes(session.user.role)) {
        return NextResponse.json({ error: "Not permitted to edit patients" }, { status: 403 });
    }

    const { id } = await params;
    const patientId = parseInt(id, 10);
    if (isNaN(patientId)) {
        return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    const body = await req.json();
    const { name, phone1, phone2, pictureUrl } = body;

    // Read the previous picture before the write — prisma.update returns the
    // new row and the old URL is gone after it. Only when the picture is in
    // play, so ordinary edits cost no extra query.
    let previousPicture: string | null = null;
    if (pictureUrl !== undefined) {
        const before = await prisma.patient.findUnique({
            where: { id: patientId },
            select: { pictureUrl: true },
        });
        previousPicture = before?.pictureUrl ?? null;
    }

    const patient = await prisma.patient.update({
        where: { id: patientId },
        data: {
            ...(name !== undefined && { name }),
            ...(phone1 !== undefined && { phone1 }),
            ...(phone2 !== undefined && { phone2 }),
            ...(pictureUrl !== undefined && { pictureUrl }),
            updatedById: session.user.id,
        },
    });

    // The form re-posts the current pictureUrl on every save, so the
    // inequality check is what stops a rename from deleting a live photo.
    if (previousPicture && previousPicture !== pictureUrl) {
        await removeUpload(previousPicture);
    }

    const changedFields = [
        name !== undefined && "name",
        phone1 !== undefined && "phone1",
        phone2 !== undefined && "phone2",
        pictureUrl !== undefined && "picture",
    ].filter(Boolean);
    await logPatientActivity({
        patientId,
        userId: session.user.id,
        action: "DEMOGRAPHICS_UPDATED",
        summary: changedFields.length ? `Updated ${changedFields.join(", ")}` : undefined,
    });

    return NextResponse.json(patient);
}

// PATCH /api/patients/[id] — archive or unarchive
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!WRITE_ROLES.includes(session.user.role)) {
        return NextResponse.json({ error: "Not permitted to edit patients" }, { status: 403 });
    }

    const { id } = await params;
    const patientId = parseInt(id, 10);
    if (isNaN(patientId)) {
        return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    const body = await req.json();
    const { archived } = body;

    const patient = await prisma.patient.update({
        where: { id: patientId },
        data: { archived: Boolean(archived), updatedById: session.user.id },
    });

    await logPatientActivity({
        patientId,
        userId: session.user.id,
        action: patient.archived ? "ARCHIVED" : "RESTORED",
    });

    return NextResponse.json({
        id: patient.id,
        archived: patient.archived,
        message: patient.archived ? "Patient archived" : "Patient restored",
    });
}
