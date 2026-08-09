import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#1a2e35",
                color: "#fff",
                fontFamily: "var(--font-outfit, 'Outfit', system-ui, sans-serif)",
            }}
        >
            <div style={{ textAlign: "center", maxWidth: "420px", padding: "2rem" }}>
                <div
                    style={{
                        fontSize: "4rem",
                        fontWeight: 800,
                        color: "#4CAF93",
                        lineHeight: 1,
                        marginBottom: "0.75rem",
                    }}
                >
                    403
                </div>
                <h1
                    style={{
                        fontSize: "1.4rem",
                        fontWeight: 600,
                        marginBottom: "0.5rem",
                    }}
                >
                    Access Denied
                </h1>
                <p
                    style={{
                        fontSize: "0.95rem",
                        color: "rgba(255,255,255,0.5)",
                        marginBottom: "2rem",
                        lineHeight: 1.6,
                    }}
                >
                    You don&apos;t have permission to access this page.
                    Contact your administrator if you believe this is an error.
                </p>
                <Link
                    href="/login"
                    style={{
                        display: "inline-block",
                        padding: "0.7rem 2rem",
                        background: "#4CAF93",
                        color: "#fff",
                        borderRadius: "4px",
                        textDecoration: "none",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        transition: "all 0.2s",
                    }}
                >
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
