import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageContent } from "@/lib/permissions";
import { removeUpload } from "@/lib/uploads";

async function requireContentManager() {
    const session = await auth();
    if (!session || !canManageContent(session.user)) {
        return null;
    }
    return session;
}

// GET /api/blog/[id] — fetch a single post
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await requireContentManager();
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
    const session = await requireContentManager();
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

// DELETE /api/blog/[id] — permanent removal. There is no soft delete here:
// ARCHIVED already is the soft delete, and this is the step past it.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await requireContentManager();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Archive first, then delete. The list only offers this on an archived row,
    // but the endpoint must hold on its own — nothing else here refuses, since
    // no foreign key points at a BlogPost.
    if (post.status !== "ARCHIVED") {
        return NextResponse.json(
            { error: "Archive this post before deleting it permanently." },
            { status: 409 }
        );
    }

    // A translated pair points both ways (translate/route.ts writes linkedId on
    // both rows), so the surviving half still references this one. Null it here
    // rather than relying on the foreign key's SET NULL: that action is Prisma's
    // default for an optional relation and is not written down in schema.prisma,
    // so a reader would have no way to know this feature depends on it.
    await prisma.$transaction([
        prisma.blogPost.updateMany({ where: { linkedId: id }, data: { linkedId: null } }),
        prisma.blogPost.delete({ where: { id } }),
    ]);

    // Only once the row is gone, and only if the object is no longer referenced.
    // translate/route.ts copies coverImage into the translation, so a pair shares
    // one object — removing it unconditionally would erase the picture the
    // surviving half still shows. removeUpload never throws; its return value is
    // deliberately not surfaced, because it is false whenever
    // SUPABASE_SERVICE_ROLE_KEY is unset and would report a failure that did not
    // happen.
    if (post.coverImage) {
        const stillUsed = await prisma.blogPost.count({
            where: { coverImage: post.coverImage },
        });
        if (stillUsed === 0) {
            await removeUpload(post.coverImage);
        }
    }

    return NextResponse.json({ message: "Post deleted permanently" });
}
