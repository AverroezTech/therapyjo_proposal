import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
            intake: true,
            files: {
                orderBy: { uploadedAt: "desc" },
            },
            reservations: {
                include: {
                    doctor: { select: { id: true, name: true, color: true } },
                    soapNote: true,
                },
                orderBy: { sessionDate: "desc" },
            },
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

    const { id } = await params;
    const patientId = parseInt(id, 10);
    if (isNaN(patientId)) {
        return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    const body = await req.json();
    const { name, phone1, phone2, pictureUrl } = body;

    const patient = await prisma.patient.update({
        where: { id: patientId },
        data: {
            ...(name !== undefined && { name }),
            ...(phone1 !== undefined && { phone1 }),
            ...(phone2 !== undefined && { phone2 }),
            ...(pictureUrl !== undefined && { pictureUrl }),
        },
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

    const { id } = await params;
    const patientId = parseInt(id, 10);
    if (isNaN(patientId)) {
        return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    const body = await req.json();
    const { archived } = body;

    const patient = await prisma.patient.update({
        where: { id: patientId },
        data: { archived: Boolean(archived) },
    });

    return NextResponse.json({
        id: patient.id,
        archived: patient.archived,
        message: patient.archived ? "Patient archived" : "Patient restored",
    });
}
