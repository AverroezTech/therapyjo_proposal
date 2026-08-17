"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { parseWorkingHours, formatWorkingHours, isLegacyWorkingHours } from "@/lib/workingHours";
import { publicUploadUrl } from "@/lib/storageUrl";

interface Secretary {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    workingHours: string | null;
    status: "ACTIVE" | "RESIGNED";
    pictureUrl: string | null;
    username: string;
}

interface SecretaryForm {
    name: string;
    email: string;
    phone: string;
    workingHours: string;
    username: string;
    password: string;
    confirmPassword: string;
    adminPassword: string;
}

interface EmployeeDoc {
    id: number;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    uploadedAt: string;
}

const FILTERS = ["Active", "Archived"] as const;

function statusFor(filter: (typeof FILTERS)[number]) {
    return filter === "Archived" ? "RESIGNED" : "ACTIVE";
}

export default function SecretariesPage() {
    const router = useRouter();
    const [secretaries, setSecretaries] = useState<Secretary[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Secretary | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<SecretaryForm>({
        name: "", email: "", phone: "", workingHours: "", username: "", password: "", confirmPassword: "", adminPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState("");
    const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Active");
    const [hoursFrom, setHoursFrom] = useState("");
    const [hoursTo, setHoursTo] = useState("");
    const [legacyHours, setLegacyHours] = useState("");
    const [docs, setDocs] = useState<EmployeeDoc[]>([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [uploadingName, setUploadingName] = useState("");
    const [removingId, setRemovingId] = useState<number | null>(null);
    const [docError, setDocError] = useState("");

    const fetchSecretaries = useCallback(async () => {
        const res = await fetch("/api/employees/secretaries");
        const data = await res.json();
        setSecretaries(data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchSecretaries(); }, [fetchSecretaries]);

    const loadDocs = useCallback(async (userId: string) => {
        setDocsLoading(true);
        setDocError("");
        const res = await fetch(`/api/employees/files?userId=${userId}`);
        if (!res.ok) {
            setDocs([]);
            setDocsLoading(false);
            setDocError("Could not load documents.");
            return;
        }
        setDocs(await res.json());
        setDocsLoading(false);
    }, []);

    const counts = useMemo(() => ({
        Active: secretaries.filter((sec) => sec.status === "ACTIVE").length,
        Archived: secretaries.filter((sec) => sec.status === "RESIGNED").length,
    }), [secretaries]);

    const visible = useMemo(
        () => secretaries.filter((sec) => sec.status === statusFor(filter)),
        [secretaries, filter]
    );

    const openAdd = () => {
        setEditing(null);
        setForm({ name: "", email: "", phone: "", workingHours: "", username: "", password: "", confirmPassword: "", adminPassword: "" });
        setShowPassword(false);
        setFormError("");
        setHoursFrom("");
        setHoursTo("");
        setLegacyHours("");
        setDocs([]);
        setDocError("");
        setUploadingName("");
        setShowModal(true);
    };

    const openEdit = (sec: Secretary) => {
        setEditing(sec);
        setForm({
            name: sec.name, email: sec.email || "", phone: sec.phone || "",
            workingHours: sec.workingHours || "", username: sec.username, password: "",
            confirmPassword: "", adminPassword: "",
        });
        setShowPassword(false);
        setFormError("");
        const parsed = parseWorkingHours(sec.workingHours);
        setHoursFrom(parsed?.from ?? "");
        setHoursTo(parsed?.to ?? "");
        setLegacyHours(isLegacyWorkingHours(sec.workingHours) ? (sec.workingHours ?? "") : "");
        setDocs([]);
        setDocError("");
        setUploadingName("");
        loadDocs(sec.id);
        setShowModal(true);
    };

    const handleSave = async () => {
        setFormError("");

        if (!editing || form.password) {
            if (form.password.length < 8) {
                setFormError("Password must be at least 8 characters");
                return;
            }
            if (form.password !== form.confirmPassword) {
                setFormError("Passwords do not match");
                return;
            }
        }

        if (editing && form.password && !form.adminPassword) {
            setFormError("Enter your own password to confirm this change");
            return;
        }

        setSaving(true);
        const url = editing
            ? `/api/employees/secretaries/${editing.id}`
            : "/api/employees/secretaries";
        const method = editing ? "PUT" : "POST";

        const body: Record<string, string> = {
            name: form.name, email: form.email, phone: form.phone,
            workingHours: form.workingHours,
        };
        if (!editing) {
            body.username = form.username;
            body.password = form.password;
        } else if (form.password) {
            body.password = form.password;
            body.adminPassword = form.adminPassword;
        }

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        setSaving(false);

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setFormError(data.error || "Failed to save secretary");
            return;
        }

        setShowModal(false);
        fetchSecretaries();
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editing) return;
        e.target.value = "";   // let the same file be picked again after a failure
        setDocError("");
        setUploadingName(file.name);

        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "employee-files");
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        if (!up.ok) {
            setUploadingName("");
            setDocError("Upload failed.");
            return;
        }
        const { path, contentType } = await up.json();

        // fileType comes from the response, not the picked file: /api/upload
        // re-encodes images to WebP, so file.type would be a lie. fileSize is
        // the size as picked — the endpoint does not report the stored length,
        // so it is exact for documents and approximate for a re-encoded image.
        const res = await fetch("/api/employees/files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: editing.id,
                fileName: file.name,
                filePath: path,
                fileType: contentType,
                fileSize: file.size,
            }),
        });
        setUploadingName("");
        if (!res.ok) {
            setDocError("Could not attach the document.");
            return;
        }
        loadDocs(editing.id);
    };

    const handleRemoveDoc = async (docId: number) => {
        if (!editing) return;
        setDocError("");
        setRemovingId(docId);
        // res.ok is the only success signal. The response also carries
        // objectRemoved, which is false whenever SUPABASE_SERVICE_ROLE_KEY is
        // unset — the row is still gone, so surfacing it would report a
        // failure that did not happen. Do not read it.
        const res = await fetch(`/api/employees/files/${docId}`, { method: "DELETE" });
        setRemovingId(null);
        if (!res.ok) {
            setDocError("Could not remove the document.");
            return;
        }
        loadDocs(editing.id);
    };

    const handleResign = async (id: string) => {
        if (!confirm("Resign this secretary? They move to Archived and can be re-enrolled later.")) return;
        await fetch(`/api/employees/secretaries/${id}`, { method: "DELETE" });
        fetchSecretaries();
    };

    const handleReEnrol = async (id: string) => {
        await fetch(`/api/employees/secretaries/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "ACTIVE" }),
        });
        fetchSecretaries();
    };

    if (loading) {
        return <div style={{ color: "rgba(255,255,255,0.5)", padding: "2rem" }}>Loading...</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1>Secretaries</h1>
                <button className="btn-primary" onClick={() => router.push("/admin/employees/secretaries/new")}>+ Add Secretary</button>
            </div>

            <div className="filter-row">
                {FILTERS.map((f) => (
                    <button
                        key={f}
                        className={`chip ${filter === f ? "active" : ""}`}
                        onClick={() => setFilter(f)}
                    >
                        {f} <span className="chip-count">{counts[f]}</span>
                    </button>
                ))}
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Working Hours</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map((sec) => (
                            <tr key={sec.id}>
                                <td>
                                    <span className={`status-badge ${sec.status === "ACTIVE" ? "active" : "resigned"}`}>
                                        {sec.status}
                                    </span>
                                </td>
                                <td>{sec.name}</td>
                                <td>{sec.phone || "—"}</td>
                                <td>{sec.email || "—"}</td>
                                <td>{sec.workingHours || "—"}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-sm btn-edit" onClick={() => openEdit(sec)}>Edit</button>
                                        {sec.status === "ACTIVE" ? (
                                            <button className="btn-sm btn-delete" onClick={() => handleResign(sec.id)}>Resign</button>
                                        ) : (
                                            <button className="btn-sm btn-edit" onClick={() => handleReEnrol(sec.id)}>Re-enrol</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {visible.length === 0 && (
                            <tr><td colSpan={6} style={{ textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                                {filter === "Archived" ? "No archived secretaries" : "No active secretaries"}
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h2>{editing ? "Edit Secretary" : "Add Secretary"}</h2>
                            {formError && <div className="error-msg" role="alert">{formError}</div>}

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Name *</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Working Hours</label>
                                <div className="hours-row">
                                    <input
                                        type="time"
                                        aria-label="Start time"
                                        value={hoursFrom}
                                        onChange={(e) => {
                                            setHoursFrom(e.target.value);
                                            setForm({ ...form, workingHours: formatWorkingHours(e.target.value, hoursTo) });
                                        }}
                                    />
                                    <span className="hours-sep">to</span>
                                    <input
                                        type="time"
                                        aria-label="End time"
                                        value={hoursTo}
                                        onChange={(e) => {
                                            setHoursTo(e.target.value);
                                            setForm({ ...form, workingHours: formatWorkingHours(hoursFrom, e.target.value) });
                                        }}
                                    />
                                </div>
                                {legacyHours && <span className="field-hint">Currently: {legacyHours}</span>}
                            </div>
                            {!editing && (
                                <div className="form-group">
                                    <label>Username *</label>
                                    <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                                </div>
                            )}
                            <div className="form-group">
                                <label>{editing ? "New Password (optional)" : "Password *"}</label>
                                <div className="password-wrap">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.4 0 10 7 10 7a17.6 17.6 0 0 1-2.2 3.15M6.6 6.6A17.7 17.7 0 0 0 2 11s3.6 7 10 7a9 9 0 0 0 4.4-1.1" />
                                                <path d="m2 2 20 20" />
                                                <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                                            </svg>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <span className="field-hint">At least 8 characters.</span>
                            </div>
                            <div className="form-group">
                                <label>{editing ? "Repeat New Password" : "Repeat Password *"}</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                />
                            </div>
                            {editing && form.password && (
                                <div className="form-group">
                                    <label>Your Password *</label>
                                    <input
                                        type="password"
                                        value={form.adminPassword}
                                        onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                                    />
                                    <span className="field-hint">Confirm it is you before changing someone else&apos;s password.</span>
                                </div>
                            )}
                        </div>

                        {editing && (
                            <div className="form-group doc-section">
                                <label>Documents</label>
                                {docError && <div className="error-msg" role="alert">{docError}</div>}
                                <input
                                    type="file"
                                    className="doc-input"
                                    aria-label="Upload a document"
                                    disabled={!!uploadingName}
                                    onChange={handleUpload}
                                />
                                {docsLoading ? (
                                    <span className="field-hint">Loading documents…</span>
                                ) : (
                                    <ul className="doc-list">
                                        {uploadingName && (
                                            <li className="doc-row uploading">
                                                <span className="doc-icon">⏳</span>
                                                <span className="doc-name">Uploading {uploadingName}…</span>
                                            </li>
                                        )}
                                        {docs.map((d) => (
                                            <li key={d.id} className="doc-row">
                                                <span className="doc-icon">{d.fileType.includes("image") ? "🖼" : "📄"}</span>
                                                <a
                                                    className="doc-name"
                                                    href={publicUploadUrl(d.filePath)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {d.fileName}
                                                </a>
                                                <button
                                                    type="button"
                                                    className="btn-sm btn-delete"
                                                    disabled={removingId === d.id}
                                                    onClick={() => handleRemoveDoc(d.id)}
                                                >
                                                    {removingId === d.id ? "Removing…" : "Remove"}
                                                </button>
                                            </li>
                                        ))}
                                        {docs.length === 0 && !uploadingName && (
                                            <li className="doc-empty">No documents yet</li>
                                        )}
                                    </ul>
                                )}
                                <span className="field-hint">Documents are saved immediately — they do not wait for Save.</span>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button
                                className="btn-primary"
                                onClick={handleSave}
                                disabled={saving || !form.name || (!editing && (!form.username || !form.password))}
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
        .page-header h1 { font-size: 1.5rem; font-weight: 600; }
        .filter-row { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
        .chip {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.65); padding: 0.4rem 0.9rem; border-radius: 999px;
          font-size: 0.8rem; font-weight: 600; cursor: pointer; font-family: inherit;
          display: inline-flex; align-items: center; gap: 0.4rem; transition: all 0.15s;
        }
        .chip:hover { background: rgba(255,255,255,0.08); }
        .chip.active { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.3); color: #fff; }
        .chip-count { color: rgba(255,255,255,0.4); font-weight: 500; }
        .chip.active .chip-count { color: rgba(255,255,255,0.7); }
        .btn-primary {
          background: linear-gradient(135deg, #059669, #10b981); color: #fff;
          border: none; border-radius: 10px; padding: 0.6rem 1.25rem;
          font-size: 0.9rem; font-weight: 600; cursor: pointer; font-family: inherit;
        }
        .btn-primary:hover:not(:disabled) { opacity: 0.85; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-secondary {
          background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.12); border-radius: 10px;
          padding: 0.6rem 1.25rem; font-size: 0.9rem; cursor: pointer; font-family: inherit;
        }
        .table-container {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px; overflow: hidden;
        }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th {
          text-align: left; padding: 0.9rem 1rem; font-size: 0.78rem;
          text-transform: uppercase; letter-spacing: 0.05em;
          color: rgba(255,255,255,0.4); border-bottom: 1px solid rgba(255,255,255,0.06); font-weight: 600;
        }
        .data-table td {
          padding: 0.8rem 1rem; font-size: 0.9rem;
          border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(255,255,255,0.85);
        }
        .data-table tr:hover { background: rgba(255,255,255,0.02); }
        .status-badge { padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
        .status-badge.active { background: rgba(16,185,129,0.15); color: #6ee7b7; }
        .status-badge.resigned { background: rgba(239,68,68,0.15); color: #fca5a5; }
        .btn-sm {
          padding: 0.3rem 0.7rem; border-radius: 6px; font-size: 0.8rem;
          border: none; cursor: pointer; font-weight: 500; font-family: inherit;
        }
        .btn-edit { background: rgba(96,165,250,0.15); color: #93c5fd; }
        .btn-edit:hover { background: rgba(96,165,250,0.25); }
        .action-buttons { display: flex; gap: 0.5rem; }
        .btn-delete { background: rgba(239,68,68,0.15); color: #fca5a5; }
        .btn-delete:hover { background: rgba(239,68,68,0.25); }
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; backdrop-filter: blur(4px);
        }
        .modal-card {
          background: #1e293b; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px; padding: 2rem; width: 100%; max-width: 560px;
          max-height: 90vh; overflow-y: auto;
        }
        .modal-card h2 { font-size: 1.3rem; margin-bottom: 1.5rem; font-weight: 600; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-group label { font-size: 0.8rem; color: rgba(255,255,255,0.6); font-weight: 500; }
        .form-group input {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 0.65rem 0.8rem; color: #fff; font-size: 0.9rem;
          outline: none; font-family: inherit;
        }
        .form-group input:focus { border-color: #6ee7b7; }
        .hours-row { display: flex; align-items: center; gap: 0.5rem; }
        .hours-row input { flex: 1; min-width: 0; }
        .hours-sep { font-size: 0.8rem; color: rgba(255,255,255,0.4); flex-shrink: 0; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
        .error-msg {
          background: rgba(220,38,38,0.1); border: 1px solid rgba(220,38,38,0.2);
          color: #fca5a5; padding: 0.5rem 0.75rem; border-radius: var(--radius-sm, 2px);
          font-size: 0.82rem; margin-bottom: 0.75rem;
        }
        .password-wrap { position: relative; }
        .password-wrap input { width: 100%; padding-inline-end: 2.4rem; }
        .toggle-password {
          position: absolute; inset-inline-end: 0.5rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; padding: 0.15rem; line-height: 0;
          color: rgba(255,255,255,0.45); cursor: pointer;
        }
        .toggle-password:hover { color: #fff; }
        .doc-section { margin-top: 1.25rem; }
        .doc-input { font-size: 0.82rem; color: rgba(255,255,255,0.6); }
        .doc-list {
          list-style: none; display: flex; flex-direction: column;
          gap: 0.4rem; margin: 0.5rem 0 0.5rem; padding: 0;
        }
        .doc-row {
          display: flex; align-items: center; gap: 0.6rem;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px; padding: 0.5rem 0.7rem;
        }
        .doc-icon { flex-shrink: 0; }
        .doc-name {
          flex: 1; min-width: 0; font-size: 0.82rem; color: #fff;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          text-decoration: none;
        }
        a.doc-name:hover { text-decoration: underline; }
        .doc-row.uploading .doc-name { color: rgba(255,255,255,0.5); }
        .doc-empty { font-size: 0.8rem; color: rgba(255,255,255,0.35); padding: 0.25rem 0; }
        .field-hint { font-size: 0.72rem; color: rgba(255,255,255,0.35); }
      `}</style>
        </div>
    );
}
