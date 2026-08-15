import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/employees/files?userId=<id> — list an employee's documents
export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
        return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const files = await prisma.employeeFile.findMany({
        where: { userId },
        select: {
            id: true,
            fileName: true,
            filePath: true,
            fileType: true,
            fileSize: true,
            uploadedAt: true,
        },
        orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json(files);
}

// POST /api/employees/files — attach a document to an employee
// The file itself is uploaded separately via POST /api/upload (folder:
// "employee-files"); this endpoint only records the metadata against the
// returned path.
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, fileName, filePath, fileType, fileSize } = body;

    if (!userId || !fileName || !filePath || !fileType || !fileSize) {
        return NextResponse.json(
            { error: "userId, fileName, filePath, fileType and fileSize are required" },
            { status: 400 }
        );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const file = await prisma.employeeFile.create({
        data: { userId, fileName, filePath, fileType, fileSize },
    });

    return NextResponse.json(file, { status: 201 });
}
