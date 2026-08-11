import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

// POST /api/blog/[id]/translate — spawn a linked draft in the other language
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const original = await prisma.blogPost.findUnique({ where: { id } });
    if (!original) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (original.linkedId) {
        return NextResponse.json(
            { error: "This post already has a linked translation", linkedId: original.linkedId },
            { status: 409 }
        );
    }

    const otherLang = original.lang === "EN" ? "AR" : "EN";

    const root = slugify(`${original.title}-${otherLang}`);
    let slug = root;
    let n = 2;
    while (await prisma.blogPost.findUnique({ where: { slug } })) {
        slug = `${root}-${n++}`;
    }

    const translation = await prisma.blogPost.create({
        data: {
            title: "",
            lang: otherLang,
            category: original.category,
            body: "",
            coverImage: original.coverImage,
            slug,
            status: "DRAFT",
            linkedId: original.id,
        },
    });

    await prisma.blogPost.update({
        where: { id: original.id },
        data: { linkedId: translation.id },
    });

    return NextResponse.json(translation, { status: 201 });
}
