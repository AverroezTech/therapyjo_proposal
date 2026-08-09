import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET /api/employees/secretaries — list all secretaries
export async function GET() {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const isAdmin = (session.user as { role?: string })?.role === "ADMIN";

    const secretaries = await prisma.user.findMany({
        where: { role: "SECRETARY" },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            workingHours: true,
            status: true,
            pictureUrl: true,
            username: isAdmin,
            createdAt: true,
        },
        orderBy: { name: "asc" },
    });

    return NextResponse.json(secretaries);
}

// POST /api/employees/secretaries — create a new secretary
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone, workingHours, username, password, pictureUrl } = body;

    if (!name || !username || !password) {
        return NextResponse.json(
            { error: "Name, username, and password are required" },
            { status: 400 }
        );
    }
    if (password.length < 8) {
        return NextResponse.json(
            { error: "Password must be at least 8 characters" },
            { status: 400 }
        );
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
        return NextResponse.json(
            { error: "Username already taken" },
            { status: 409 }
        );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const secretary = await prisma.user.create({
        data: {
            name,
            email,
            phone,
            workingHours,
            username,
            passwordHash,
            role: "SECRETARY",
            pictureUrl,
        },
    });

    return NextResponse.json(
        { id: secretary.id, name: secretary.name, message: "Secretary created successfully" },
        { status: 201 }
    );
}
