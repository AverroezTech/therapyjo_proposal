import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * The ids of every account whose username equals `input`, ignoring case.
 *
 * Raw SQL on purpose. Prisma's `mode: "insensitive"` compiles to a bare
 * `ILIKE $1` with nothing escaped (measured on Prisma 7.4.1), so a `%` or
 * `_` typed at the login box acts as a wildcard — `%` alone matches every
 * account — and a username containing `\` can never match itself.
 * `lower() = lower()` is plain equality with none of that. The template tag
 * binds `input` as a parameter; it is never spliced into the SQL. (TJ-060)
 */
export async function findUserIdsByUsername(input: string): Promise<string[]> {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "User" WHERE lower(username) = lower(${input})
    `;
    return rows.map((r) => r.id);
}
