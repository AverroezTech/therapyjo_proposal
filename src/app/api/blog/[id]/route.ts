import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
        return null;
    }
    return session;
}

// GET /api/blog/[id] — fetch a single post
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.blogPost.findUnique({
        where: { id },
        include: { linked: { select: { id: true, lang: true, status: true } } },
    });
    if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(post);
}

// PUT /api/blog/[id] — update a post (content, status transitions)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await requireAdmin();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, category, body: content, coverImage, status, publishAt } = body;

    if (status === "SCHEDULED" && !publishAt) {
        return NextResponse.json(
            { error: "Scheduled posts require a publish date" },
            { status: 400 }
        );
    }

    const nextStatus = status || existing.status;

    const post = await prisma.blogPost.update({
        where: { id },
        data: {
            title: title ?? existing.title,
            category: category ?? existing.category,
            body: content ?? existing.body,
            coverImage: coverImage !== undefined ? coverImage : existing.coverImage,
            status: nextStatus,
            publishAt: nextStatus === "SCHEDULED" ? new Date(publishAt) : null,
            publishedAt:
                nextStatus === "PUBLISHED"
                    ? existing.publishedAt ?? new Date()
                    : existing.publishedAt,
        },
    });

    return NextResponse.json(post);
}
