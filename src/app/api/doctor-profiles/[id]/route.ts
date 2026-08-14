import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";

async function requireContentManager() {
    const session = await auth();
    if (!session || !canManageContent(session.user)) {
        return null;
    }
    return session;
}

// PUT /api/doctor-profiles/[id] — update name/title/specialty/bio/contact/photo/order/hidden
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await requireContentManager();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.doctorProfile.findUnique({ where: { id } });
    if (!existing) {
        return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, title, specialty, bio, contact, photo, hidden, order, userId, archived } = body;

    if (userId) {
        const clash = await prisma.doctorProfile.findUnique({ where: { userId } });
        if (clash && clash.id !== id) {
            return NextResponse.json({ error: "That account is already linked to another profile" }, { status: 409 });
        }
    }

    const profile = await prisma.doctorProfile.update({
        where: { id },
        data: {
            name: name ?? existing.name,
            title: title ?? existing.title,
            specialty: specialty ?? existing.specialty,
            bio: bio !== undefined ? bio : existing.bio,
            contact: contact !== undefined ? contact : existing.contact,
            photo: photo !== undefined ? photo : existing.photo,
            hidden: hidden !== undefined ? hidden : existing.hidden,
            order: order !== undefined ? order : existing.order,
            userId: userId !== undefined ? (userId || null) : existing.userId,
            archived: archived !== undefined ? Boolean(archived) : existing.archived,
        },
    });

    return NextResponse.json(profile);
}

// DELETE /api/doctor-profiles/[id] — archive (soft delete) or restore
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await requireContentManager();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.doctorProfile.findUnique({ where: { id } });
    if (!existing) {
        return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const profile = await prisma.doctorProfile.update({
        where: { id },
        data: { archived: true },
    });

    return NextResponse.json(profile);
}
