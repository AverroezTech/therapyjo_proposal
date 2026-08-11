import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/doctor-profiles/me — the logged-in doctor's own public profile, if linked
export async function GET() {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== "DOCTOR") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const profile = await prisma.doctorProfile.findUnique({
        where: { userId },
        include: {
            pendingChanges: {
                where: { status: "PENDING" },
                orderBy: { submittedAt: "desc" },
            },
        },
    });

    if (!profile) {
        return NextResponse.json({ error: "No public profile linked to this account" }, { status: 404 });
    }

    return NextResponse.json(profile);
}
