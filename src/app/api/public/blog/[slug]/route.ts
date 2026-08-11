import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/public/blog/[slug] — a single published post
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    await prisma.blogPost.updateMany({
        where: { status: "SCHEDULED", publishAt: { lte: new Date() } },
        data: { status: "PUBLISHED", publishedAt: new Date() },
    });

    const post = await prisma.blogPost.findUnique({
        where: { slug },
        select: {
            id: true,
            slug: true,
            title: true,
            category: true,
            body: true,
            coverImage: true,
            status: true,
            publishedAt: true,
            lang: true,
        },
    });

    if (!post || post.status !== "PUBLISHED") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(post);
}
