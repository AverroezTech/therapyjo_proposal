import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/patients/duplicates?phone=xxx — find duplicate patients by phone
export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
        // Return all groups of duplicate phone1 numbers
        const patients = await prisma.patient.findMany({
            where: { archived: false },
            select: {
                id: true,
                name: true,
                phone1: true,
                phone2: true,
                createdAt: true,
            },
            orderBy: { phone1: "asc" },
        });

        // Group by phone1, filter groups with > 1 entry
        const groups: Record<string, typeof patients> = {};
        for (const p of patients) {
            if (!groups[p.phone1]) groups[p.phone1] = [];
            groups[p.phone1].push(p);
        }

        const duplicates = Object.entries(groups)
            .filter(([, group]) => group.length > 1)
            .map(([phone1, group]) => ({ phone1, patients: group }));

        return NextResponse.json({ duplicates, total: duplicates.length });
    }

    // Search for a specific phone number
    const matches = await prisma.patient.findMany({
        where: {
            OR: [
                { phone1: { contains: phone } },
                { phone2: { contains: phone } },
            ],
        },
        select: {
            id: true,
            name: true,
            phone1: true,
            phone2: true,
            archived: true,
            createdAt: true,
        },
    });

    return NextResponse.json({ matches, total: matches.length });
}
