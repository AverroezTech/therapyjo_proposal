import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function excerpt(body: string, len = 160) {
    const clean = body.replace(/\s+/g, " ").trim();
    return clean.length > len ? clean.slice(0, len).trimEnd() + "…" : clean;
}

// GET /api/public/blog?lang=EN — published posts in the given language
export async function GET(req: NextRequest) {
    const lang = req.nextUrl.searchParams.get("lang") === "AR" ? "AR" : "EN";

    // Promote any scheduled posts whose publish time has passed
    await prisma.blogPost.updateMany({
        where: { status: "SCHEDULED", publishAt: { lte: new Date() } },
        data: { status: "PUBLISHED", publishedAt: new Date() },
    });

    const posts = await prisma.blogPost.findMany({
        where: { status: "PUBLISHED", lang },
        select: {
            id: true,
            slug: true,
            title: true,
            category: true,
            body: true,
            coverImage: true,
            publishedAt: true,
        },
        orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json(
        posts.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            category: p.category,
            excerpt: excerpt(p.body),
            coverImage: p.coverImage,
            publishedAt: p.publishedAt,
        }))
    );
}
