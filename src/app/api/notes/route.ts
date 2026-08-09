import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/notes — list all notes
export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    const where: Record<string, unknown> = {};
    if (doctorId && doctorId !== "all") where.doctorId = doctorId;
    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { details: { contains: search, mode: "insensitive" } },
        ];
    }

    const [notes, total] = await Promise.all([
        prisma.note.findMany({
            where,
            include: {
                doctor: { select: { id: true, name: true, color: true } },
            },
            orderBy: { noteDate: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.note.count({ where }),
    ]);

    return NextResponse.json({
        notes,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    });
}

// POST /api/notes — create a note
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, noteDate, doctorId, doctorCheckNote, details } = body;

    if (!name || !noteDate || !doctorId) {
        return NextResponse.json(
            { error: "name, noteDate, and doctorId are required" },
            { status: 400 }
        );
    }

    const note = await prisma.note.create({
        data: {
            name,
            noteDate: new Date(noteDate),
            doctorId,
            doctorCheckNote: Boolean(doctorCheckNote),
            details: details || null,
        },
        include: {
            doctor: { select: { id: true, name: true, color: true } },
        },
    });

    return NextResponse.json(note, { status: 201 });
}
