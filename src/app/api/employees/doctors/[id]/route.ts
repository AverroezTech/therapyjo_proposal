import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET /api/employees/doctors/[id]
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

    const doctor = await prisma.user.findFirst({
        where: { id, role: "DOCTOR" },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            workingHours: true,
            status: true,
            color: true,
            pictureUrl: true,
            username: isAdmin,
            createdAt: true,
        },
    });

    if (!doctor) {
        return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json(doctor);
}

// PUT /api/employees/doctors/[id] — update doctor
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
    const { name, email, phone, workingHours, password, color, pictureUrl, status } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (workingHours !== undefined) updateData.workingHours = workingHours;
    if (color !== undefined) updateData.color = color;
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

    const doctor = await prisma.user.update({
        where: { id },
        data: updateData,
    });

    return NextResponse.json({ id: doctor.id, name: doctor.name, message: "Doctor updated" });
}

// DELETE /api/employees/doctors/[id] — soft delete (set status to RESIGNED)
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

    return NextResponse.json({ message: "Doctor marked as resigned" });
}
