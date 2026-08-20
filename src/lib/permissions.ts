import type { Session } from "next-auth";

/**
 * May this user manage public content — Blog posts, public Doctor profiles,
 * and the Approvals queue?
 *
 * The rule lives here rather than inline at each handler so it can be granted
 * without a code change at every call site. ADMIN always holds it; anyone else
 * holds it only if their User.canManageContent column is set (TJ-005b1).
 */
export function canManageContent(
    user: Session["user"] | undefined | null
): boolean {
    if (!user) return false;
    return user.role === "ADMIN" || user.canManageContent === true;
}
