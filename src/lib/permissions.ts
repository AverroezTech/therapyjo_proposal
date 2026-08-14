import type { Session } from "next-auth";

/**
 * May this user manage public content — Blog posts, public Doctor profiles,
 * and the Approvals queue?
 *
 * The rule lives here rather than inline at each handler so it can be granted
 * without a code change at every call site. Today it derives from the role;
 * a per-user override is TJ-005b.
 */
export function canManageContent(
    user: Session["user"] | undefined | null
): boolean {
    return user?.role === "ADMIN";
}
