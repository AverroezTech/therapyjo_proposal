import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET /api/employees/secretaries/[id]
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const isAdmin = (session.user as { role?: string })?.role === "ADMIN";

    const { id } = await params;

    const secretary = await prisma.user.findFirst({
        where: { id, role: "SECRETARY" },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            workingHours: true,
            status: true,
            pictureUrl: true,
            username: isAdmin,
            createdAt: true,
        },
    });

    if (!secretary) {
        return NextResponse.json({ error: "Secretary not found" }, { status: 404 });
    }

    return NextResponse.json(secretary);
}

// PUT /api/employees/secretaries/[id]
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, email, phone, workingHours, password, pictureUrl, status } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (workingHours !== undefined) updateData.workingHours = workingHours;
    if (pictureUrl !== undefined) updateData.pictureUrl = pictureUrl;
    if (status !== undefined) updateData.status = status;
    if (password) {
        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }
        updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    const secretary = await prisma.user.update({
        where: { id },
        data: updateData,
    });

    return NextResponse.json({ id: secretary.id, name: secretary.name, message: "Secretary updated" });
}

// DELETE /api/employees/secretaries/[id] — soft delete (set status to RESIGNED)
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Soft delete — set status to RESIGNED instead of permanent deletion
    await prisma.user.update({
        where: { id },
        data: { status: "RESIGNED" },
    });

    return NextResponse.json({ message: "Secretary marked as resigned" });
}
