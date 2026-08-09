import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/reservations/[id]/duplicate — clone reservation to a new date
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { sessionDate, sessionTime } = body;

    if (!sessionDate) {
        return NextResponse.json({ error: "sessionDate is required" }, { status: 400 });
    }

    const original = await prisma.reservation.findUnique({
        where: { id: parseInt(id, 10) },
    });

    if (!original) {
        return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    const duplicated = await prisma.reservation.create({
        data: {
            patientId: original.patientId,
            doctorId: original.doctorId,
            sessionDate: new Date(sessionDate),
            sessionTime: sessionTime
                ? new Date(`${sessionDate}T${sessionTime}`)
                : original.sessionTime,
            paymentType: original.paymentType,
            isTwoHours: original.isTwoHours,
            injuryPlace: original.injuryPlace,
            note: original.note,
            showNoteOnCalendar: original.showNoteOnCalendar,
            // Reset status and timestamps
            status: "SCHEDULED",
        },
        include: {
            patient: { select: { id: true, name: true, phone1: true } },
            doctor: { select: { id: true, name: true, color: true } },
        },
    });

    return NextResponse.json(duplicated, { status: 201 });
}
