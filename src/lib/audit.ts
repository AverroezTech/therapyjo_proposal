import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Records one line of "who did what" against a patient's record. Never
 * throws — a failure to log must not fail the write it is describing, the
 * same rule src/lib/uploads.ts follows for storage cleanup. (TJ-024)
 */
export async function logPatientActivity(opts: {
    patientId: number;
    userId: string | null;
    action: string;
    summary?: string;
}): Promise<void> {
    try {
        await prisma.patientAuditLog.create({
            data: {
                patientId: opts.patientId,
                userId: opts.userId,
                action: opts.action,
                summary: opts.summary,
            },
        });
    } catch (err) {
        console.error(`[audit] failed to log ${opts.action} for patient ${opts.patientId}:`, err);
    }
}
