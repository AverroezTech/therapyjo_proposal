import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { removeUpload } from "@/lib/uploads";
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
    const { name, email, phone, workingHours, password, pictureUrl, status, adminPassword } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (workingHours !== undefined) updateData.workingHours = workingHours;
    // prisma.update returns the new row, not the old one, so the previous
    // picture has to be read before the write or it is unrecoverable. Read it
    // only when the picture is actually in play, so that renames and phone
    // edits cost no extra query.
    let previousPicture: string | null = null;
    if (pictureUrl !== undefined) {
        const before = await prisma.user.findUnique({
            where: { id },
            select: { pictureUrl: true },
        });
        previousPicture = before?.pictureUrl ?? null;
        updateData.pictureUrl = pictureUrl;
    }
    if (status !== undefined) updateData.status = status;
    if (password) {
        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        // Re-authenticate the acting admin before overwriting someone else's
        // credential. The id comes from the session, never from the body, and
        // auth.ts re-reads the account on every session read — so this cannot
        // be pointed at another user by tampering with the request.
        if (!adminPassword) {
            return NextResponse.json(
                { error: "Enter your own password to confirm this change" },
                { status: 400 }
            );
        }
        const actingAdminId = (session.user as { id?: string }).id;
        const actingAdmin = actingAdminId
            ? await prisma.user.findUnique({
                where: { id: actingAdminId },
                select: { passwordHash: true },
            })
            : null;
        if (!actingAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const adminPasswordOk = await bcrypt.compare(adminPassword, actingAdmin.passwordHash);
        if (!adminPasswordOk) {
            return NextResponse.json(
                { error: "Your password is incorrect" },
                { status: 403 }
            );
        }

        updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    const secretary = await prisma.user.update({
        where: { id },
        data: updateData,
    });

    // Only after the row is safely updated, and only when the value genuinely
    // changed. These forms re-post the current pictureUrl on every save, so
    // without the inequality check an ordinary rename would delete the photo
    // the row still points at. removeUpload never throws: a storage failure
    // leaks an object and logs, it does not fail this request.
    if (previousPicture && previousPicture !== pictureUrl) {
        await removeUpload(previousPicture);
    }

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
