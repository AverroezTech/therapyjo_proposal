import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canAccessClinical } from "@/lib/permissions";
import { logPatientActivity } from "@/lib/audit";

// Valid status transitions (state machine)
const VALID_TRANSITIONS: Record<string, string[]> = {
    SCHEDULED: ["CHECKED_IN", "WAITING", "CANCELLED", "NO_SHOW"],
    WAITING: ["CHECKED_IN", "CANCELLED"],
    CHECKED_IN: ["WITH_DOCTOR", "WAITING", "CANCELLED"],
    WITH_DOCTOR: ["CHECKED_OUT"],
    CHECKED_OUT: ["WITH_DOCTOR"], // revert only — undo a premature checkout
    CANCELLED: ["SCHEDULED"], // revert only — undo a cancellation
    NO_SHOW: ["SCHEDULED"], // revert only — undo a no-show
};

// GET /api/reservations/[id]
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const reservation = await prisma.reservation.findUnique({
        where: { id: parseInt(id, 10) },
        include: {
            patient: {
                select: { id: true, name: true, phone1: true, phone2: true, archived: true },
            },
            doctor: { select: { id: true, name: true, color: true } },
            soapNote: canAccessClinical(session.user),
        },
    });

    if (!reservation) {
        return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    // Fetch previous session note for this patient
    const prevSession = await prisma.reservation.findFirst({
        where: {
            patientId: reservation.patientId,
            id: { not: reservation.id },
            sessionDate: { lt: reservation.sessionDate },
        },
        orderBy: { sessionDate: "desc" },
        select: { nextSessionNote: true, note: true, sessionDate: true },
    });

    return NextResponse.json({
        ...reservation,
        previousSessionNote: prevSession?.nextSessionNote || prevSession?.note || null,
        previousSessionDate: prevSession?.sessionDate || null,
    });
}

// PUT /api/reservations/[id] — update reservation details
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    // Doctors can update everything else about a session (injury place, note,
    // payment) but not when it happens or who it belongs to — only admin and
    // secretary reschedule or reassign.
    if (
        session.user.role === "DOCTOR" &&
        (body.sessionDate !== undefined || body.sessionTime !== undefined || body.doctorId !== undefined)
    ) {
        return NextResponse.json(
            { error: "Doctors cannot change a session's time or reassign it to another doctor" },
            { status: 403 }
        );
    }

    const data: Record<string, unknown> = {};
    if (body.doctorId !== undefined) data.doctorId = body.doctorId;
    if (body.sessionDate !== undefined) data.sessionDate = new Date(body.sessionDate);
    if (body.sessionTime !== undefined) data.sessionTime = new Date(`${body.sessionDate || "2000-01-01"}T${body.sessionTime}`);
    if (body.note !== undefined) data.note = body.note;
    if (body.showNoteOnCalendar !== undefined) data.showNoteOnCalendar = Boolean(body.showNoteOnCalendar);
    if (body.nextSessionNote !== undefined) data.nextSessionNote = body.nextSessionNote;
    if (body.paymentType !== undefined) data.paymentType = body.paymentType;
    if (body.isTwoHours !== undefined) data.isTwoHours = Boolean(body.isTwoHours);
    if (body.isNote !== undefined) data.isNote = Boolean(body.isNote);
    if (body.injuryPlace !== undefined) data.injuryPlace = body.injuryPlace;

    const reservation = await prisma.reservation.update({
        where: { id: parseInt(id, 10) },
        data,
        include: {
            patient: { select: { id: true, name: true, phone1: true } },
            doctor: { select: { id: true, name: true, color: true } },
        },
    });

    await logPatientActivity({
        patientId: reservation.patientId,
        userId: session.user.id,
        action: "SESSION_UPDATED",
        summary: `Session with ${reservation.doctor?.name ?? reservation.doctorNameSnapshot ?? "a deleted doctor"} edited`,
    });

    return NextResponse.json(reservation);
}

// PATCH /api/reservations/[id] — status transition (state machine)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { status: newStatus } = body;

    if (!newStatus) {
        return NextResponse.json({ error: "status is required" }, { status: 400 });
    }

    const reservation = await prisma.reservation.findUnique({
        where: { id: parseInt(id, 10) },
        select: { id: true, status: true, patientId: true },
    });

    if (!reservation) {
        return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    const allowedNext = VALID_TRANSITIONS[reservation.status] || [];
    if (!allowedNext.includes(newStatus)) {
        return NextResponse.json(
            { error: `Cannot transition from ${reservation.status} to ${newStatus}. Allowed: ${allowedNext.join(", ") || "none"}` },
            { status: 400 }
        );
    }

    // Set timestamps for status changes
    const timestamps: Record<string, unknown> = {};
    if (newStatus === "CHECKED_IN") timestamps.checkedInAt = new Date();
    // Guarded: reverting a checkout also lands on WITH_DOCTOR, and the session
    // really did start when it started — do not rewrite it with the undo time.
    if (newStatus === "WITH_DOCTOR" && reservation.status !== "CHECKED_OUT") {
        timestamps.withDoctorAt = new Date();
    }
    if (newStatus === "CHECKED_OUT") {
        timestamps.checkedOutAt = new Date();
        // Auto-update patient's lastVisitDate
        await prisma.patient.update({
            where: { id: reservation.patientId },
            data: { lastVisitDate: new Date() },
        });
    }

    // Undoing a checkout: drop the checkout stamp, then recompute the patient's
    // lastVisitDate from the sessions still checked out. Clearing it outright
    // would erase an earlier, legitimate visit.
    if (reservation.status === "CHECKED_OUT" && newStatus === "WITH_DOCTOR") {
        timestamps.checkedOutAt = null;
        const priorVisit = await prisma.reservation.findFirst({
            where: {
                patientId: reservation.patientId,
                status: "CHECKED_OUT",
                id: { not: reservation.id },
                checkedOutAt: { not: null },
            },
            orderBy: { checkedOutAt: "desc" },
            select: { checkedOutAt: true },
        });
        await prisma.patient.update({
            where: { id: reservation.patientId },
            data: { lastVisitDate: priorVisit?.checkedOutAt ?? null },
        });
    }

    // Returning to SCHEDULED means the session has not happened yet, so any
    // stamps left over from a check-in before the cancellation are now stale.
    if (newStatus === "SCHEDULED") {
        timestamps.checkedInAt = null;
        timestamps.withDoctorAt = null;
        timestamps.checkedOutAt = null;
    }

    const updated = await prisma.reservation.update({
        where: { id: parseInt(id, 10) },
        data: { status: newStatus, ...timestamps },
        include: {
            patient: { select: { id: true, name: true, phone1: true } },
            doctor: { select: { id: true, name: true, color: true } },
        },
    });

    await logPatientActivity({
        patientId: updated.patientId,
        userId: session.user.id,
        action: "SESSION_STATUS_CHANGED",
        summary: `${reservation.status} → ${newStatus}`,
    });

    return NextResponse.json(updated);
}

// DELETE /api/reservations/[id] — permanent removal (admin only; use PATCH status=CANCELLED otherwise)
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((session.user as { role?: string })?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const deleted = await prisma.reservation.delete({
        where: { id: parseInt(id, 10) },
        include: { doctor: { select: { name: true } } },
    });

    await logPatientActivity({
        patientId: deleted.patientId,
        userId: session.user.id,
        action: "SESSION_DELETED",
        summary: `Session with ${deleted.doctor?.name ?? deleted.doctorNameSnapshot ?? "a deleted doctor"} on ${deleted.sessionDate.toISOString().split("T")[0]}`,
    });

    return NextResponse.json({ message: "Reservation deleted" });
}
