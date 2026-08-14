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

// GET /api/doctor-profiles — list doctor profiles (admin). ?archived=true lists archived ones.
export async function GET(req: NextRequest) {
    const session = await requireContentManager();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const archived = req.nextUrl.searchParams.get("archived") === "true";

    const profiles = await prisma.doctorProfile.findMany({
        where: { archived },
        orderBy: archived ? { updatedAt: "desc" } : { order: "asc" },
    });

    return NextResponse.json(profiles);
}

// POST /api/doctor-profiles — create a new doctor profile
export async function POST(req: NextRequest) {
    const session = await requireContentManager();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, title, specialty, bio, contact, photo, userId } = body;

    if (!name?.trim() || !title?.trim()) {
        return NextResponse.json(
            { error: "Name and title are required" },
            { status: 400 }
        );
    }

    const maxOrder = await prisma.doctorProfile.aggregate({
        _max: { order: true },
        where: { archived: false },
    });

    const profile = await prisma.doctorProfile.create({
        data: {
            name,
            title,
            specialty: specialty || "",
            bio: bio || null,
            contact: contact || null,
            photo: photo || null,
            userId: userId || null,
            order: (maxOrder._max.order ?? 0) + 1,
        },
    });

    return NextResponse.json(profile, { status: 201 });
}
