import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";

// POST /api/doctor-profiles/reorder — persist new drag order
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || !canManageContent(session.user)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "ids array is required" }, { status: 400 });
    }

    await prisma.$transaction(
        ids.map((id: string, index: number) =>
            prisma.doctorProfile.update({
                where: { id },
                data: { order: index + 1 },
            })
        )
    );

    return NextResponse.json({ ok: true });
}
