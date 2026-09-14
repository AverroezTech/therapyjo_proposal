import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logPatientActivity } from "@/lib/audit";

// Clinic opening hours. A session may start at 07:00 at the earliest and must
// end by 19:00 — so the latest one-hour start is 18:00, and the latest
// two-hour start is 17:00. Validated as plain numbers before any Date is
// constructed: sessionTime arrives as "HH:MM" and the server runs
// TZ=Asia/Amman while the browser does not, so parsing first would make this
// check disagree with itself for any staff member outside Amman. (TJ-042a)
const CLINIC_OPEN_HOUR = 7;
const CLINIC_CLOSE_HOUR = 19;

// GET /api/reservations?date=YYYY-MM-DD&doctorId=xxx
export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const doctorId = searchParams.get("doctorId");
    const patientId = searchParams.get("patientId");
    // For DatePicker: get counts for a full month
    const monthStr = searchParams.get("month"); // YYYY-MM format

    // Month counts mode: returns { "2026-02-01": 3, "2026-02-02": 1, ... }
    if (monthStr) {
        const [year, month] = monthStr.split("-").map(Number);
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

        const reservations = await prisma.reservation.findMany({
            where: {
                sessionDate: { gte: startOfMonth, lte: endOfMonth },
                ...(doctorId && { doctorId }),
            },
            select: { sessionDate: true },
        });

        const counts: Record<string, number> = {};
        for (const r of reservations) {
            const key = r.sessionDate.toISOString().split("T")[0];
            counts[key] = (counts[key] || 0) + 1;
        }

        return NextResponse.json({ counts });
    }

    // Patient-only mode: all sessions for a patient (no date filter)
    if (!dateStr && patientId) {
        const reservations = await prisma.reservation.findMany({
            where: { patientId: parseInt(patientId, 10) },
            include: {
                patient: { select: { id: true, name: true, phone1: true, phone2: true } },
                doctor: { select: { id: true, name: true, color: true } },
            },
            orderBy: { sessionDate: "desc" },
        });
        return NextResponse.json(reservations);
    }

    // Day view mode
    if (!dateStr) {
        return NextResponse.json({ error: "date, month, or patientId parameter required" }, { status: 400 });
    }

    const date = new Date(dateStr + "T00:00:00");
    const nextDay = new Date(dateStr + "T23:59:59.999");

    const where = {
        sessionDate: { gte: date, lte: nextDay },
        ...(doctorId && doctorId !== "all" && { doctorId }),
        ...(patientId && { patientId: parseInt(patientId, 10) }),
    };

    const reservations = await prisma.reservation.findMany({
        where,
        include: {
            patient: { select: { id: true, name: true, phone1: true, phone2: true } },
            doctor: { select: { id: true, name: true, color: true } },
        },
        orderBy: { sessionTime: "asc" },
    });

    return NextResponse.json(reservations);
}

// POST /api/reservations — create reservation (existing patient only)
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string })?.role;
    if (role === "DOCTOR") {
        return NextResponse.json({ error: "Doctors cannot create reservations" }, { status: 403 });
    }

    const body = await req.json();
    const {
        patientId,
        doctorId,
        sessionDate,
        sessionTime,
        note,
        showNoteOnCalendar,
        nextSessionNote,
        paymentType,
        isTwoHours,
    } = body;

    if (!patientId || !doctorId || !sessionDate || !sessionTime) {
        return NextResponse.json(
            { error: "patientId, doctorId, sessionDate, and sessionTime are required" },
            { status: 400 }
        );
    }

    const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(String(sessionTime));
    if (!timeMatch) {
        return NextResponse.json({ error: "sessionTime must be in HH:MM format" }, { status: 400 });
    }
    const startMinutes = Number(timeMatch[1]) * 60 + Number(timeMatch[2]);
    const endMinutes = startMinutes + (isTwoHours ? 120 : 60);
    if (startMinutes < CLINIC_OPEN_HOUR * 60 || endMinutes > CLINIC_CLOSE_HOUR * 60) {
        return NextResponse.json(
            {
                error: `The clinic is open ${CLINIC_OPEN_HOUR}:00–${CLINIC_CLOSE_HOUR}:00. A ${isTwoHours ? "two-hour" : "one-hour"} session must start between ${CLINIC_OPEN_HOUR}:00 and ${String(CLINIC_CLOSE_HOUR - (isTwoHours ? 2 : 1)).padStart(2, "0")}:00.`,
            },
            { status: 400 }
        );
    }

    // Verify patient exists
    const patient = await prisma.patient.findUnique({ where: { id: parseInt(patientId, 10) } });
    if (!patient) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const reservation = await prisma.reservation.create({
        data: {
            patientId: parseInt(patientId, 10),
            doctorId,
            sessionDate: new Date(sessionDate),
            sessionTime: new Date(`${sessionDate}T${sessionTime}`),
            note: note || null,
            showNoteOnCalendar: Boolean(showNoteOnCalendar),
            nextSessionNote: nextSessionNote || null,
            paymentType: paymentType || null,
            isTwoHours: Boolean(isTwoHours),
        },
        include: {
            patient: { select: { id: true, name: true, phone1: true } },
            doctor: { select: { id: true, name: true, color: true } },
        },
    });

    await logPatientActivity({
        patientId: reservation.patientId,
        userId: session.user.id,
        action: "SESSION_CREATED",
        summary: `Booked with ${reservation.doctor?.name ?? "a doctor"} on ${sessionDate}`,
    });

    return NextResponse.json(reservation, { status: 201 });
}
