import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Edge-safe middleware — uses authConfig which does NOT import Prisma
export default NextAuth(authConfig).auth;

export const config = {
    matcher: [
        /*
         * Match all request paths EXCEPT:
         *  - _next/static (Next.js static files)
         *  - _next/image  (Next.js image optimization)
         *  - favicon.ico  (browser favicon)
         *  - Static assets served from public/ (images, videos, icons, etc.)
         */
        "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|mp3|woff|woff2|ttf|eot|css|js)$).*)",
    ],
};
