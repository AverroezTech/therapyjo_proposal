import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET /api/employees/doctors — list all doctors
export async function GET() {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const isAdmin = (session.user as { role?: string })?.role === "ADMIN";

    const doctors = await prisma.user.findMany({
        where: { role: "DOCTOR" },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            workingHours: true,
            status: true,
            color: true,
            pictureUrl: true,
            username: isAdmin,
            createdAt: true,
        },
        orderBy: { name: "asc" },
    });

    return NextResponse.json(doctors);
}

// POST /api/employees/doctors — create a new doctor
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone, workingHours, username, password, color, pictureUrl } = body;

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

    // Check if username is taken
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
        return NextResponse.json(
            { error: "Username already taken" },
            { status: 409 }
        );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const doctor = await prisma.user.create({
        data: {
            name,
            email,
            phone,
            workingHours,
            username,
            passwordHash,
            role: "DOCTOR",
            color,
            pictureUrl,
        },
    });

    return NextResponse.json(
        { id: doctor.id, name: doctor.name, message: "Doctor created successfully" },
        { status: 201 }
    );
}
