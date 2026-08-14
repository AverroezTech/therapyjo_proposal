import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";
import { slugify } from "@/lib/slugify";

async function requireContentManager() {
    const session = await auth();
    if (!session || !canManageContent(session.user)) {
        return null;
    }
    return session;
}

async function uniqueSlug(base: string) {
    const root = slugify(base);
    let slug = root;
    let n = 2;
    while (await prisma.blogPost.findUnique({ where: { slug } })) {
        slug = `${root}-${n++}`;
    }
    return slug;
}

// GET /api/blog — list all posts (admin)
export async function GET() {
    const session = await requireContentManager();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await prisma.blogPost.findMany({
        include: { linked: { select: { id: true, lang: true } } },
        orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(posts);
}

// POST /api/blog — create a new post
export async function POST(req: NextRequest) {
    const session = await requireContentManager();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, lang, category, body: content, coverImage, status, publishAt } = body;

    if (!title?.trim() || !lang || !category) {
        return NextResponse.json(
            { error: "Title, language, and category are required" },
            { status: 400 }
        );
    }
    if (status === "SCHEDULED" && !publishAt) {
        return NextResponse.json(
            { error: "Scheduled posts require a publish date" },
            { status: 400 }
        );
    }

    const slug = await uniqueSlug(title);
    const resolvedStatus = status || "DRAFT";

    const post = await prisma.blogPost.create({
        data: {
            title,
            lang,
            category,
            body: content || "",
            coverImage: coverImage || null,
            slug,
            status: resolvedStatus,
            publishAt: resolvedStatus === "SCHEDULED" ? new Date(publishAt) : null,
            publishedAt: resolvedStatus === "PUBLISHED" ? new Date() : null,
        },
    });

    return NextResponse.json(post, { status: 201 });
}
