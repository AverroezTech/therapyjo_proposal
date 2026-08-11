import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const FIELD_MAP = {
    NAME: "name",
    TITLE: "title",
    SPECIALTY: "specialty",
    BIO: "bio",
    CONTACT: "contact",
    PHOTO: "photo",
} as const;

// PATCH /api/pending-changes/[id] — approve (applies to the live profile) or reject
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const change = await prisma.pendingChange.findUnique({ where: { id } });
    if (!change || change.status !== "PENDING") {
        return NextResponse.json({ error: "Change not found or already reviewed" }, { status: 404 });
    }

    const { decision } = await req.json();
    if (decision !== "approve" && decision !== "reject") {
        return NextResponse.json({ error: "decision must be 'approve' or 'reject'" }, { status: 400 });
    }

    const reviewerName = (session.user as { name?: string }).name || "Admin";

    if (decision === "approve") {
        const key = FIELD_MAP[change.field];
        await prisma.$transaction([
            prisma.doctorProfile.update({
                where: { id: change.doctorId },
                data: { [key]: change.newValue },
            }),
            prisma.pendingChange.update({
                where: { id },
                data: { status: "APPROVED", reviewedBy: reviewerName, reviewedAt: new Date() },
            }),
        ]);
    } else {
        await prisma.pendingChange.update({
            where: { id },
            data: { status: "REJECTED", reviewedBy: reviewerName, reviewedAt: new Date() },
        });
    }

    return NextResponse.json({ ok: true });
}
