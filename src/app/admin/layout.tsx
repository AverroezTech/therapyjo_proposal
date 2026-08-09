"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

type DropdownItem = { href: string; label: string; icon: string };

const employeeItems: DropdownItem[] = [
    { href: "/admin/employees/doctors", label: "Doctors", icon: "🩺" },
    { href: "/admin/employees/secretaries", label: "Secretaries", icon: "📋" },
];

const patientItems: DropdownItem[] = [
    { href: "/admin/patients", label: "View Patients", icon: "👥" },
    { href: "/admin/patients/archived", label: "Archived", icon: "🗄️" },
    { href: "/admin/patients/duplicates", label: "Duplicates", icon: "🔍" },
];

const noteItems: DropdownItem[] = [
    { href: "/admin/notes", label: "View Notes", icon: "📝" },
];

function NavDropdown({
    label,
    items,
    isActive,
}: {
    label: string;
    items: DropdownItem[];
    isActive: boolean;
}) {
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pathname = usePathname();

    const handleEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setOpen(true);
    };
    const handleLeave = () => {
        setOpen(false);
    };

    useEffect(() => () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    return (
        <div
            className="nav-dropdown"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            <button className={`nav-link ${isActive ? "active" : ""}`}>
                {label}
                <svg
                    className={`chevron ${open ? "open" : ""}`}
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M2 3.5L5 6.5L8 3.5" />
                </svg>
            </button>

            <div className={`dropdown-panel ${open ? "visible" : ""}`}>
                <div className="dropdown-inner">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`dropdown-item ${pathname === item.href ? "current" : ""}`}
                            onClick={() => setOpen(false)}
                        >
                            <span className="dropdown-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const router = useRouter();

    // When page becomes visible again (back/forward nav from bfcache),
    // re-check the session. If signed out, redirect to login.
    useEffect(() => {
        const onVisible = async () => {
            if (document.visibilityState !== "visible") return;
            const res = await fetch("/api/auth/session");
            const data = await res.json();
            if (!data?.user) {
                router.replace("/login");
            }
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
    }, [router]);

    // Also guard on initial render / status change
    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
        }
    }, [status, router]);

    return (
        <div className="admin-layout">
            <nav className="admin-nav">
                <div className="nav-brand">
                    <Link href="/admin">Therapy Jo</Link>
                </div>

                <div className="nav-links">
                    <Link
                        href="/admin"
                        className={`nav-link ${pathname === "/admin" ? "active" : ""}`}
                    >
                        Dashboard
                    </Link>

                    <NavDropdown
                        label="Employees"
                        items={employeeItems}
                        isActive={pathname.startsWith("/admin/employees")}
                    />
                    <NavDropdown
                        label="Patients"
                        items={patientItems}
                        isActive={pathname.startsWith("/admin/patients")}
                    />
                    <NavDropdown
                        label="Notes"
                        items={noteItems}
                        isActive={pathname.startsWith("/admin/notes")}
                    />
                </div>

                <div className="nav-user">
                    <div className="user-avatar">
                        {(session?.user?.name?.[0] || "A").toUpperCase()}
                    </div>
                    <span className="user-name">{session?.user?.name || "Admin"}</span>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="logout-btn"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </nav>

            <main className="admin-content">{children}</main>

            <style jsx>{`
                .admin-layout {
                    min-height: 100vh;
                    background: var(--bg-dark, #1a2e35);
                    color: #fff;
                }

                /* ── Navbar ── */
                .admin-nav {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    padding: 0 2rem;
                    height: 56px;
                    background: rgba(26, 46, 53, 0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                .nav-brand a {
                    font-family: var(--font-outfit, 'Outfit', sans-serif);
                    color: var(--primary, #4CAF93);
                    font-size: 1.1rem;
                    font-weight: 700;
                    text-decoration: none;
                    letter-spacing: -0.02em;
                }
                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 0.1rem;
                    flex: 1;
                }

                /* ── Nav Link ── */
                :global(.nav-link) {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    color: #fff;
                    text-decoration: none;
                    padding: 0.4rem 0.85rem;
                    border-radius: var(--radius-sm, 2px);
                    font-size: 0.83rem;
                    font-weight: 500;
                    transition: all 0.2s;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-family: inherit;
                    position: relative;
                }
                :global(.nav-link:hover) {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.06);
                }
                :global(.nav-link.active) {
                    color: var(--primary, #4CAF93);
                }

                /* ── Chevron ── */
                :global(.chevron) {
                    transition: transform 0.25s ease;
                    opacity: 0.5;
                }
                :global(.chevron.open) {
                    transform: rotate(180deg);
                    opacity: 0.8;
                }

                /* ── Dropdown ── */
                :global(.nav-dropdown) {
                    position: relative;
                }
                :global(.dropdown-panel) {
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    padding-top: 4px;
                    transform: translateX(-50%) translateY(4px);
                    opacity: 0;
                    visibility: hidden;
                    pointer-events: none;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    z-index: 300;
                }
                :global(.dropdown-panel.visible) {
                    opacity: 1;
                    visibility: visible;
                    pointer-events: all;
                    transform: translateX(-50%) translateY(0);
                }
                :global(.dropdown-inner) {
                    background: rgba(36, 59, 68, 0.95);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: var(--radius-md, 4px);
                    padding: 0.35rem;
                    min-width: 180px;
                    box-shadow:
                        0 16px 48px rgba(0, 0, 0, 0.4),
                        0 0 0 1px rgba(76, 175, 147, 0.05);
                }

                /* ── Dropdown Item ── */
                :global(.dropdown-item) {
                    display: flex;
                    align-items: center;
                    gap: 0.55rem;
                    color: #fff;
                    text-decoration: none;
                    padding: 0.5rem 0.75rem;
                    border-radius: var(--radius-sm, 2px);
                    font-size: 0.82rem;
                    transition: all 0.15s;
                }
                :global(.dropdown-item:hover) {
                    color: #fff;
                    background: rgba(76, 175, 147, 0.1);
                }
                :global(.dropdown-item.current) {
                    color: var(--primary, #4CAF93);
                    background: rgba(76, 175, 147, 0.08);
                }
                :global(.dropdown-icon) {
                    font-size: 0.9rem;
                    width: 20px;
                    text-align: center;
                    flex-shrink: 0;
                }

                /* ── User ── */
                .nav-user {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }
                .user-avatar {
                    width: 28px;
                    height: 28px;
                    background: rgba(76, 175, 147, 0.15);
                    border: 1px solid rgba(76, 175, 147, 0.25);
                    border-radius: var(--radius-sm, 2px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--primary, #4CAF93);
                }
                .user-name {
                    color: rgba(255, 255, 255, 0.45);
                    font-size: 0.82rem;
                }
                .logout-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    background: rgba(220, 38, 38, 0.08);
                    border: 1px solid rgba(220, 38, 38, 0.15);
                    color: rgba(252, 165, 165, 0.8);
                    padding: 0.32rem 0.75rem;
                    border-radius: var(--radius-sm, 2px);
                    font-size: 0.76rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: inherit;
                }
                .logout-btn:hover {
                    background: rgba(220, 38, 38, 0.18);
                    border-color: rgba(220, 38, 38, 0.3);
                    color: #fca5a5;
                }
                .admin-content {
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }
            `}</style>
        </div>
    );
}
