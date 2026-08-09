"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                username,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid username or password");
                setLoading(false);
                return;
            }

            // Use callbackUrl if present, otherwise determine by role
            const callbackUrl = searchParams.get("callbackUrl");
            if (callbackUrl && !callbackUrl.includes("/login")) {
                router.replace(callbackUrl);
                router.refresh();
                return;
            }

            // Fetch session to determine redirect
            const res = await fetch("/api/auth/session");
            const session = await res.json();
            const role = session?.user?.role;

            switch (role) {
                case "ADMIN":
                    router.replace("/admin");
                    break;
                case "SECRETARY":
                    router.replace("/secretary");
                    break;
                case "DOCTOR":
                    router.replace("/doctor");
                    break;
                default:
                    router.replace("/");
            }
            router.refresh();
        } catch {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Background video — same as landing hero */}
            <div className="login-bg">
                <video autoPlay muted loop playsInline className="login-bg-video">
                    <source src="/hero.mp4" type="video/mp4" />
                </video>
                <div className="login-bg-overlay" />
            </div>

            <div className="login-card">
                <div className="login-header">
                    <Image
                        src="/logo.jpg"
                        alt="Therapy Jo"
                        width={72}
                        height={72}
                        className="login-logo"
                        priority
                    />
                    <h1>Therapy Jo</h1>
                    <p>Clinic Management System</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="login-error">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                            autoFocus
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="login-spinner" />
                                Signing in…
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>
            </div>

            <style jsx>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                }

                /* ── Background ── */
                .login-bg {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                }
                .login-bg-video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .login-bg-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        to bottom,
                        rgba(26, 46, 53, 0.7) 0%,
                        rgba(26, 46, 53, 0.55) 40%,
                        rgba(26, 46, 53, 0.8) 100%
                    );
                }

                /* ── Card ── */
                .login-card {
                    position: relative;
                    z-index: 1;
                    background: rgba(26, 46, 53, 0.45);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: var(--radius-xl, 6px);
                    padding: 2.5rem 2.5rem 2rem;
                    width: 100%;
                    max-width: 400px;
                    margin: 1rem;
                    box-shadow:
                        0 8px 40px rgba(0, 0, 0, 0.35),
                        0 0 0 1px rgba(76, 175, 147, 0.08);
                }

                /* ── Header ── */
                .login-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .login-header h1 {
                    font-family: var(--font-outfit, 'Outfit', sans-serif);
                    color: #fff;
                    font-size: 1.6rem;
                    font-weight: 700;
                    margin: 0.75rem 0 0.25rem;
                    letter-spacing: -0.02em;
                }
                .login-header p {
                    color: rgba(255, 255, 255, 0.45);
                    font-size: 0.85rem;
                    margin: 0;
                    letter-spacing: 0.04em;
                }

                /* ── Logo ── */
                :global(.login-logo) {
                    border-radius: var(--radius-md, 4px) !important;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
                    margin: 0 auto;
                }

                /* ── Form ── */
                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.1rem;
                }
                .login-error {
                    background: rgba(220, 38, 38, 0.12);
                    border: 1px solid rgba(220, 38, 38, 0.25);
                    color: #fca5a5;
                    padding: 0.65rem 1rem;
                    border-radius: var(--radius-sm, 2px);
                    font-size: 0.82rem;
                    text-align: center;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }
                .form-group label {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.8rem;
                    font-weight: 500;
                    letter-spacing: 0.02em;
                }
                .form-group input {
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: var(--radius-sm, 2px);
                    padding: 0.75rem 0.9rem;
                    color: #fff;
                    font-size: 0.92rem;
                    font-family: inherit;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .form-group input:focus {
                    border-color: var(--primary, #4CAF93);
                    box-shadow: 0 0 0 2px rgba(76, 175, 147, 0.18);
                }
                .form-group input::placeholder {
                    color: rgba(255, 255, 255, 0.2);
                }

                /* ── Button ── */
                .login-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    background: var(--primary, #4CAF93);
                    color: #fff;
                    border: none;
                    border-radius: var(--radius-full, 4px);
                    padding: 0.8rem;
                    font-size: 0.95rem;
                    font-weight: 600;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    margin-top: 0.4rem;
                }
                .login-btn:hover:not(:disabled) {
                    background: var(--primary-dark, #3a8f77);
                    transform: translateY(-1px);
                    box-shadow: 0 0 24px rgba(76, 175, 147, 0.25);
                }
                .login-btn:disabled {
                    opacity: 0.55;
                    cursor: not-allowed;
                }

                /* ── Spinner ── */
                .login-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* ── Mobile ── */
                @media (max-width: 480px) {
                    .login-card {
                        padding: 2rem 1.5rem 1.5rem;
                        margin: 0.75rem;
                    }
                    .login-header h1 {
                        font-size: 1.35rem;
                    }
                }
            `}</style>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div style={{ background: "#1a2e35", minHeight: "100vh" }} />}>
            <LoginForm />
        </Suspense>
    );
}
