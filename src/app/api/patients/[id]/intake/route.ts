import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/patients/[id]/intake — get clinical intake
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

    const intake = await prisma.clinicalIntake.findUnique({
        where: { patientId },
    });

    return NextResponse.json(intake || {});
}

// PUT /api/patients/[id]/intake — create or update clinical intake
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin and doctors can edit clinical intake
    const role = (session.user as { role?: string })?.role;
    if (role === "SECRETARY") {
        return NextResponse.json({ error: "Secretaries cannot edit clinical intake" }, { status: 403 });
    }

    const { id } = await params;
    const patientId = parseInt(id, 10);
    if (isNaN(patientId)) {
        return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    const body = await req.json();
    const data = {
        injuryPlace: body.injuryPlace ?? null,
        enrollDate: body.enrollDate ? new Date(body.enrollDate) : null,
        medicalHistory: body.medicalHistory ?? null,
        assessment: body.assessment ?? null,
        aggravators: body.aggravators ?? null,
        relievers: body.relievers ?? null,
        diagnosis: body.diagnosis ?? null,
        treatmentPlan: body.treatmentPlan ?? null,
        recommendedSessions: body.recommendedSessions ? parseInt(body.recommendedSessions, 10) : null,
        clinicExercises: body.clinicExercises ?? null,
        homeExercises: body.homeExercises ?? null,
        nextSessionTreatment: body.nextSessionTreatment ?? null,
    };

    const intake = await prisma.clinicalIntake.upsert({
        where: { patientId },
        update: data,
        create: { patientId, ...data },
    });

    return NextResponse.json(intake);
}
