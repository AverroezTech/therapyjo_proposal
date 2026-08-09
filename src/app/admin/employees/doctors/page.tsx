"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Doctor {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    workingHours: string | null;
    status: "ACTIVE" | "RESIGNED";
    color: string | null;
    pictureUrl: string | null;
    username: string;
}

interface DoctorForm {
    name: string;
    email: string;
    phone: string;
    workingHours: string;
    username: string;
    password: string;
    color: string;
}

const COLORS = [
    "#6ee7b7", "#93c5fd", "#fbbf24", "#f87171",
    "#a78bfa", "#fb923c", "#34d399", "#60a5fa",
    "#f472b6", "#38bdf8", "#facc15", "#c084fc",
];

export default function DoctorsPage() {
    const router = useRouter();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<DoctorForm>({
        name: "", email: "", phone: "", workingHours: "",
        username: "", password: "", color: COLORS[0],
    });

    const fetchDoctors = useCallback(async () => {
        const res = await fetch("/api/employees/doctors");
        const data = await res.json();
        setDoctors(data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

    const openAdd = () => {
        setEditingDoctor(null);
        setForm({ name: "", email: "", phone: "", workingHours: "", username: "", password: "", color: COLORS[0] });
        setShowModal(true);
    };

    const openEdit = (doc: Doctor) => {
        setEditingDoctor(doc);
        setForm({
            name: doc.name, email: doc.email || "", phone: doc.phone || "",
            workingHours: doc.workingHours || "", username: doc.username,
            password: "", color: doc.color || COLORS[0],
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        const url = editingDoctor
            ? `/api/employees/doctors/${editingDoctor.id}`
            : "/api/employees/doctors";
        const method = editingDoctor ? "PUT" : "POST";

        const body: Record<string, string> = {
            name: form.name, email: form.email, phone: form.phone,
            workingHours: form.workingHours, color: form.color,
        };
        if (!editingDoctor) {
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
        fetchDoctors();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Mark this doctor as resigned? This is a soft delete.")) return;
        await fetch(`/api/employees/doctors/${id}`, { method: "DELETE" });
        fetchDoctors();
    };

    if (loading) {
        return <div style={{ color: "rgba(255,255,255,0.5)", padding: "2rem" }}>Loading...</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1>Doctors</h1>
                <button className="btn-primary" onClick={() => router.push("/admin/employees/doctors/new")}>+ Add Doctor</button>
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
                            <th>Color</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctors.map((doc) => (
                            <tr key={doc.id}>
                                <td>
                                    <span className={`status-badge ${doc.status === "ACTIVE" ? "active" : "resigned"}`}>
                                        {doc.status}
                                    </span>
                                </td>
                                <td>{doc.name}</td>
                                <td>{doc.phone || "—"}</td>
                                <td>{doc.email || "—"}</td>
                                <td>{doc.workingHours || "—"}</td>
                                <td>
                                    <div
                                        style={{
                                            width: 24, height: 24, borderRadius: 6,
                                            background: doc.color || "#666",
                                        }}
                                    />
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-sm btn-edit" onClick={() => openEdit(doc)}>Edit</button>
                                        <button className="btn-sm btn-delete" onClick={() => handleDelete(doc.id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {doctors.length === 0 && (
                            <tr><td colSpan={7} style={{ textAlign: "center", color: "rgba(255,255,255,0.4)" }}>No doctors found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingDoctor ? "Edit Doctor" : "Add Doctor"}</h2>

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
                                <input value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} placeholder="e.g. 9:00 AM - 3:00 PM" />
                            </div>
                            {!editingDoctor && (
                                <div className="form-group">
                                    <label>Username *</label>
                                    <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                                </div>
                            )}
                            <div className="form-group">
                                <label>{editingDoctor ? "New Password (optional)" : "Password *"}</label>
                                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Calendar Color</label>
                            <div className="color-picker">
                                {COLORS.map((c) => (
                                    <button
                                        key={c}
                                        className={`color-swatch ${form.color === c ? "selected" : ""}`}
                                        style={{ background: c }}
                                        onClick={() => setForm({ ...form, color: c })}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button
                                className="btn-primary"
                                onClick={handleSave}
                                disabled={saving || !form.name || (!editingDoctor && (!form.username || !form.password))}
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        .page-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .page-header h1 { font-size: 1.5rem; font-weight: 600; }
        .btn-primary {
          background: linear-gradient(135deg, #059669, #10b981); color: #fff;
          border: none; border-radius: 10px; padding: 0.6rem 1.25rem;
          font-size: 0.9rem; font-weight: 600; cursor: pointer;
          transition: opacity 0.2s; font-family: inherit;
        }
        .btn-primary:hover:not(:disabled) { opacity: 0.85; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-secondary {
          background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.12); border-radius: 10px;
          padding: 0.6rem 1.25rem; font-size: 0.9rem; cursor: pointer;
          font-family: inherit;
        }
        .table-container {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px; overflow: hidden;
        }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th {
          text-align: left; padding: 0.9rem 1rem; font-size: 0.78rem;
          text-transform: uppercase; letter-spacing: 0.05em;
          color: rgba(255,255,255,0.4); border-bottom: 1px solid rgba(255,255,255,0.06);
          font-weight: 600;
        }
        .data-table td {
          padding: 0.8rem 1rem; font-size: 0.9rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.85);
        }
        .data-table tr:hover { background: rgba(255,255,255,0.02); }
        .status-badge {
          padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
        }
        .status-badge.active { background: rgba(16,185,129,0.15); color: #6ee7b7; }
        .status-badge.resigned { background: rgba(239,68,68,0.15); color: #fca5a5; }
        .action-buttons { display: flex; gap: 0.5rem; }
        .btn-sm {
          padding: 0.3rem 0.7rem; border-radius: 6px; font-size: 0.8rem;
          border: none; cursor: pointer; font-weight: 500; font-family: inherit;
        }
        .btn-edit { background: rgba(96,165,250,0.15); color: #93c5fd; }
        .btn-edit:hover { background: rgba(96,165,250,0.25); }
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
          border-radius: 8px; padding: 0.65rem 0.8rem; color: #fff;
          font-size: 0.9rem; outline: none; font-family: inherit;
        }
        .form-group input:focus { border-color: #6ee7b7; }
        .color-picker { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.25rem; }
        .color-swatch {
          width: 32px; height: 32px; border-radius: 8px; border: 2px solid transparent;
          cursor: pointer; transition: transform 0.15s;
        }
        .color-swatch.selected { border-color: #fff; transform: scale(1.15); }
        .color-swatch:hover { transform: scale(1.1); }
        .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
      `}</style>
        </div>
    );
}
