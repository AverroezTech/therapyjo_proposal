import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { removeUpload } from "@/lib/uploads";
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
    const { name, email, phone, workingHours, password, color, pictureUrl, status, adminPassword, canManageContent } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (workingHours !== undefined) updateData.workingHours = workingHours;
    if (color !== undefined) {
        // Exclude the doctor being edited, or saving any other field would
        // reject the colour they already hold.
        if (color) {
            const clash = await prisma.user.findFirst({
                where: { role: "DOCTOR", status: "ACTIVE", color, id: { not: id } },
                select: { name: true },
            });
            if (clash) {
                return NextResponse.json(
                    { error: `That colour is already used by ${clash.name}` },
                    { status: 409 }
                );
            }
        }
        updateData.color = color;
    }
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
    // Only ADMIN reaches this handler at all — the guard at the top of PUT is
    // the gate, and the column is inert for an ADMIN anyway (permissions.ts
    // short-circuits on role), so no one can revoke their own access here.
    // Coerced rather than passed through: a JSON body could carry a string.
    if (canManageContent !== undefined) {
        updateData.canManageContent = canManageContent === true;
    }
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

    const doctor = await prisma.user.update({
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

    return NextResponse.json({ id: doctor.id, name: doctor.name, message: "Doctor updated" });
}

// DELETE /api/employees/doctors/[id]
//   default        → soft delete (set status to RESIGNED)
//   ?hard=true     → permanent removal, refused if the doctor is referenced
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const hard = req.nextUrl.searchParams.get("hard") === "true";

    if (!hard) {
        // Soft delete — set status to RESIGNED instead of permanent deletion
        await prisma.user.update({
            where: { id },
            data: { status: "RESIGNED" },
        });

        return NextResponse.json({ message: "Doctor marked as resigned" });
    }

    // Hard delete. Reservations and notes are RESTRICT at the database level and
    // are clinical records besides — they are never reassigned and never cascade
    // away with the doctor. DoctorProfile.userId is SET NULL, which would leave a
    // live public profile silently unlinked, so that is refused too rather than
    // left to the default.
    const doctor = await prisma.user.findFirst({
        where: { id, role: "DOCTOR" },
        select: {
            name: true,
            _count: { select: { reservations: true, notes: true } },
            doctorProfile: { select: { id: true } },
        },
    });

    if (!doctor) {
        return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const blockers: string[] = [];
    if (doctor._count.reservations > 0) {
        blockers.push(`${doctor._count.reservations} reservation(s)`);
    }
    if (doctor._count.notes > 0) {
        blockers.push(`${doctor._count.notes} note(s)`);
    }
    if (doctor.doctorProfile) {
        blockers.push("a linked public profile");
    }

    if (blockers.length > 0) {
        return NextResponse.json(
            {
                error: `Cannot delete ${doctor.name}: they have ${blockers.join(" and ")}. Resign them instead.`,
            },
            { status: 409 }
        );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "Doctor deleted permanently" });
}
