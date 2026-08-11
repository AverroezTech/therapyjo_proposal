import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/public/doctors — visible doctor profiles for the public site, in display order
export async function GET() {
    const doctors = await prisma.doctorProfile.findMany({
        where: { archived: false, hidden: false },
        select: {
            id: true,
            name: true,
            title: true,
            specialty: true,
            photo: true,
            order: true,
        },
        orderBy: { order: "asc" },
    });

    return NextResponse.json(doctors);
}
