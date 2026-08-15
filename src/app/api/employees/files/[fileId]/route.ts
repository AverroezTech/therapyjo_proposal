import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { removeUpload } from "@/lib/uploads";

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

    // Remove the row first: if the storage removal fails or is unconfigured we
    // want an orphaned object, not a row pointing at a file that is gone. The
    // helper never throws, so a storage problem cannot fail this request.
    await prisma.employeeFile.delete({ where: { id } });
    const objectRemoved = await removeUpload(file.filePath);

    return NextResponse.json({ message: "File removed", objectRemoved });
}
