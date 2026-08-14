import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";

const FIELD_MAP = {
    NAME: "name",
    TITLE: "title",
    SPECIALTY: "specialty",
    BIO: "bio",
    CONTACT: "contact",
    PHOTO: "photo",
} as const;

type ChangeFieldKey = keyof typeof FIELD_MAP;

// GET /api/pending-changes — pending approvals queue (admin)
export async function GET() {
    const session = await auth();
    if (!session || !canManageContent(session.user)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const changes = await prisma.pendingChange.findMany({
        where: { status: "PENDING" },
        include: { doctor: { select: { name: true } } },
        orderBy: { submittedAt: "asc" },
    });

    return NextResponse.json(changes);
}

// POST /api/pending-changes — a doctor submits edits to their own public profile
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== "DOCTOR") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const profile = await prisma.doctorProfile.findUnique({ where: { userId } });
    if (!profile) {
        return NextResponse.json({ error: "No public profile linked to this account" }, { status: 404 });
    }

    const body = await req.json();
    const changes = body.changes as Record<string, string>;
    if (!changes || typeof changes !== "object" || Object.keys(changes).length === 0) {
        return NextResponse.json({ error: "No changes submitted" }, { status: 400 });
    }

    const entries = Object.entries(changes).filter(
        (entry): entry is [ChangeFieldKey, string] => entry[0] in FIELD_MAP
    );
    if (entries.length === 0) {
        return NextResponse.json({ error: "No valid fields submitted" }, { status: 400 });
    }

    const created = await prisma.$transaction(
        entries.map(([field, newValue]) => {
            const key = FIELD_MAP[field];
            const oldValue = (profile[key] as string | null) || "";
            return prisma.pendingChange.create({
                data: {
                    doctorId: profile.id,
                    field,
                    oldValue,
                    newValue,
                    submittedBy: profile.name,
                },
            });
        })
    );

    return NextResponse.json(created, { status: 201 });
}
