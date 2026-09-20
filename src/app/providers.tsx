"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import SessionExpiryNotice from "./SessionExpiryNotice";

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            {children}
            <SessionExpiryNotice />
        </SessionProvider>
    );
}
