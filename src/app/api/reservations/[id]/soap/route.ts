import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/reservations/[id]/soap — get SOAP note for a reservation
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const soap = await prisma.sOAPNote.findUnique({
        where: { reservationId: parseInt(id, 10) },
    });

    return NextResponse.json(soap || {});
}

// PUT /api/reservations/[id]/soap — create or update SOAP note
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const reservationId = parseInt(id, 10);
    const body = await req.json();

    const data = {
        subjective: body.subjective ?? null,
        objective: body.objective ?? null,
        assessment: body.assessment ?? null,
        plan: body.plan ?? null,
        injuryPlace: body.injuryPlace ?? null,
    };

    const soap = await prisma.sOAPNote.upsert({
        where: { reservationId },
        update: data,
        create: { reservationId, ...data },
    });

    return NextResponse.json(soap);
}
