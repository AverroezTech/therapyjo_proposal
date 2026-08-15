import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// DELETE /api/employees/files/[fileId] — detach a document from an employee
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ fileId: string }> }
) {
    const session = await auth();
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await params;
    const id = Number(fileId);
    if (Number.isNaN(id)) {
        return NextResponse.json({ error: "Invalid file id" }, { status: 400 });
    }

    const file = await prisma.employeeFile.findUnique({ where: { id } });
    if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Removes the database row only. The object stays in Supabase Storage:
    // src/lib/supabase.ts holds the anon key, which cannot delete, and no code
    // path in this application has ever removed an uploaded object. This is a
    // known leak, tracked in tasks.md, not an oversight in this handler.
    await prisma.employeeFile.delete({ where: { id } });

    return NextResponse.json({ message: "File removed" });
}
