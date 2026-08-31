import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { normalizePhone, phoneKeys } from "@/lib/phone";

// GET /api/patients — list patients with search + pagination
export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const archived = searchParams.get("archived") === "true";
    const skip = (page - 1) * limit;

    const where = {
        archived,
        ...(search
            ? {
                OR: [
                    { name: { contains: search, mode: "insensitive" as const } },
                    { phone1: { contains: search } },
                    { phone2: { contains: search } },
                ],
            }
            : {}),
    };

    const [patients, total] = await Promise.all([
        prisma.patient.findMany({
            where,
            select: {
                id: true,
                name: true,
                phone1: true,
                phone2: true,
                pictureUrl: true,
                archived: true,
                lastVisitDate: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.patient.count({ where }),
    ]);

    return NextResponse.json({
        patients,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    });
}

// POST /api/patients — create a new patient (with dupe check)
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone1, phone2, pictureUrl } = body;

    if (!name || !phone1) {
        return NextResponse.json(
            { error: "Name and phone number are required" },
            { status: 400 }
        );
    }

    // Duplicate check by normalized phone1/phone2 — raw-string equality let
    // the same person through under "0790022404" and "+962 7 9002 2404"
    // because those strings are never equal even though they're the same
    // number (TJ-037). If phone1 doesn't normalize to a usable key (too
    // short / not phone-shaped), skip the check entirely rather than
    // matching every other unusable phone in the table.
    if (normalizePhone(phone1) !== "") {
        const incomingKeys = new Set(phoneKeys({ phone1, phone2 }));
        const existingPatients = await prisma.patient.findMany({
            select: { id: true, name: true, phone1: true, phone2: true, archived: true },
        });
        const collisions = existingPatients.filter((p) =>
            phoneKeys(p).some((key) => incomingKeys.has(key))
        );

        if (collisions.length > 0) {
            const first = collisions[0];
            return NextResponse.json(
                {
                    error: `A patient with this phone number already exists: ${first.name} (${first.phone1})`,
                    duplicate: { id: first.id, name: first.name },
                    duplicates: collisions.map((c) => ({
                        id: c.id,
                        name: c.name,
                        phone1: c.phone1,
                        archived: c.archived,
                    })),
                },
                { status: 409 }
            );
        }
    }

    const patient = await prisma.patient.create({
        data: {
            name,
            phone1,
            phone2: phone2 || null,
            pictureUrl: pictureUrl || null,
        },
    });

    return NextResponse.json(
        { id: patient.id, name: patient.name, message: "Patient created successfully" },
        { status: 201 }
    );
}
