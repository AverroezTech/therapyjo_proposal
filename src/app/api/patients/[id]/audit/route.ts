import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/patients/[id]/audit — full edit history for a patient.
// Admin-only by design: doctors and secretaries only see the "last updated
// by" summary on the patient page itself. (TJ-024)
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Not permitted to view patient history" }, { status: 403 });
    }

    const { id } = await params;
    const patientId = parseInt(id, 10);
    if (isNaN(patientId)) {
        return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    const entries = await prisma.patientAuditLog.findMany({
        where: { patientId },
        include: { user: { select: { name: true, role: true } } },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(entries);
}
