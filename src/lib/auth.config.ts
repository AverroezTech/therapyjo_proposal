import type { NextAuthConfig } from "next-auth";

// Auth config that does NOT import Prisma — safe for Edge runtime / middleware
export const authConfig: NextAuthConfig = {
    providers: [], // providers are added in auth.ts (server-only)
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as { role: string }).role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as { role: string }).role = token.role as string;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const pathname = nextUrl.pathname;

            // Public routes — accessible to everyone
            const publicRoutes = ["/", "/api/auth", "/blog", "/api/public"];
            const isPublic = publicRoutes.some(
                (route) => pathname === route || pathname.startsWith(route + "/")
            );

            // If user IS logged in and tries to hit /login → redirect to dashboard
            // This prevents the back-button-after-login problem
            if (pathname === "/login" && isLoggedIn) {
                const role = (auth?.user as { role?: string })?.role;
                const dashboardUrl =
                    role === "ADMIN" ? "/admin" :
                        role === "SECRETARY" ? "/secretary" :
                            role === "DOCTOR" ? "/doctor" : "/";
                return Response.redirect(new URL(dashboardUrl, nextUrl));
            }

            // Login page is public for unauthenticated users
            if (pathname === "/login") return true;

            if (isPublic) return true;

            // Not logged in — redirect to login
            if (!isLoggedIn) {
                const loginUrl = new URL("/login", nextUrl);
                loginUrl.searchParams.set("callbackUrl", pathname);
                return Response.redirect(loginUrl);
            }

            // Role-based protection
            const role = (auth?.user as { role?: string })?.role;

            if (pathname.startsWith("/admin") && role !== "ADMIN") {
                return Response.redirect(new URL("/unauthorized", nextUrl));
            }
            if (pathname.startsWith("/secretary") && role !== "SECRETARY" && role !== "ADMIN") {
                return Response.redirect(new URL("/unauthorized", nextUrl));
            }
            if (pathname.startsWith("/doctor") && role !== "DOCTOR" && role !== "ADMIN") {
                return Response.redirect(new URL("/unauthorized", nextUrl));
            }

            return true;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 8 * 60 * 60,       // 8 hours — clinic workday
        updateAge: 60 * 60,         // refresh token every 1 hour
    },
};
