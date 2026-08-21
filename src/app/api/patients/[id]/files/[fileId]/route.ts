import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { removeUpload } from "@/lib/uploads";

// DELETE /api/patients/[id]/files/[fileId] — detach a document from a patient
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string; fileId: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, fileId } = await params;
    const patientId = parseInt(id, 10);
    const numericFileId = Number(fileId);
    if (isNaN(patientId) || Number.isNaN(numericFileId)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // Matched on both ids, not just the file's: the patient id is in the URL,
    // so a mismatched pair means the caller is wrong about something and
    // should get a 404 rather than a deletion that happens to work.
    const file = await prisma.patientFile.findFirst({
        where: { id: numericFileId, patientId },
    });
    if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Remove the row first: if the storage removal fails or is unconfigured we
    // want an orphaned object, not a row pointing at a file that is gone. The
    // helper never throws, so a storage problem cannot fail this request.
    await prisma.patientFile.delete({ where: { id: numericFileId } });
    const objectRemoved = await removeUpload(file.filePath);

    return NextResponse.json({ message: "File removed", objectRemoved });
}
