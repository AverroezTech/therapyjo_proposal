"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

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
}

export default function SecretariesPage() {
    const router = useRouter();
    const [secretaries, setSecretaries] = useState<Secretary[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Secretary | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<SecretaryForm>({
        name: "", email: "", phone: "", workingHours: "", username: "", password: "",
    });

    const fetchSecretaries = useCallback(async () => {
        const res = await fetch("/api/employees/secretaries");
        const data = await res.json();
        setSecretaries(data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchSecretaries(); }, [fetchSecretaries]);

    const openAdd = () => {
        setEditing(null);
        setForm({ name: "", email: "", phone: "", workingHours: "", username: "", password: "" });
        setShowModal(true);
    };

    const openEdit = (sec: Secretary) => {
        setEditing(sec);
        setForm({
            name: sec.name, email: sec.email || "", phone: sec.phone || "",
            workingHours: sec.workingHours || "", username: sec.username, password: "",
        });
        setShowModal(true);
    };

    const handleSave = async () => {
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
        }

        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        setSaving(false);
        setShowModal(false);
        fetchSecretaries();
    };

    const handleResign = async (id: string) => {
        if (!confirm("Mark this secretary as resigned? This is a soft delete.")) return;
        await fetch(`/api/employees/secretaries/${id}`, { method: "DELETE" });
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
                        {secretaries.map((sec) => (
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
                                        {sec.status === "ACTIVE" && (
                                            <button className="btn-sm btn-delete" onClick={() => handleResign(sec.id)}>Resign</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {secretaries.length === 0 && (
                            <tr><td colSpan={6} style={{ textAlign: "center", color: "rgba(255,255,255,0.4)" }}>No secretaries found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h2>{editing ? "Edit Secretary" : "Add Secretary"}</h2>

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
                                <input value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} placeholder="e.g. 9:00 AM - 5:00 PM" />
                            </div>
                            {!editing && (
                                <div className="form-group">
                                    <label>Username *</label>
                                    <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                                </div>
                            )}
                            <div className="form-group">
                                <label>{editing ? "New Password (optional)" : "Password *"}</label>
                                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                            </div>
                        </div>

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
        .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
      `}</style>
        </div>
    );
}
