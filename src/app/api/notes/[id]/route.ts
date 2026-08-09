import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/notes/[id]
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const note = await prisma.note.findUnique({
        where: { id: parseInt(id, 10) },
        include: { doctor: { select: { id: true, name: true } } },
    });

    if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });
    return NextResponse.json(note);
}

// PUT /api/notes/[id] — update a note
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.noteDate !== undefined) data.noteDate = new Date(body.noteDate);
    if (body.doctorId !== undefined) data.doctorId = body.doctorId;
    if (body.doctorCheckNote !== undefined) data.doctorCheckNote = Boolean(body.doctorCheckNote);
    if (body.details !== undefined) data.details = body.details;

    const note = await prisma.note.update({
        where: { id: parseInt(id, 10) },
        data,
        include: { doctor: { select: { id: true, name: true } } },
    });

    return NextResponse.json(note);
}

// DELETE /api/notes/[id] — admin/secretary only (doctors have read/check-only access)
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string })?.role;
    if (role === "DOCTOR") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.note.delete({ where: { id: parseInt(id, 10) } });
    return NextResponse.json({ message: "Note deleted" });
}
