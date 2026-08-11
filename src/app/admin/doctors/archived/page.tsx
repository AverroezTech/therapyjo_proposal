"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface DoctorProfile {
    id: string;
    name: string;
    title: string;
    specialty: string;
    updatedAt: string;
}

export default function ArchivedDoctorsPage() {
    const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchArchived = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/doctor-profiles?archived=true");
        const data = await res.json();
        setDoctors(Array.isArray(data) ? data : []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchArchived(); }, [fetchArchived]);

    const handleRestore = async (id: string) => {
        if (!confirm("Restore this doctor to the public site?")) return;
        await fetch(`/api/doctor-profiles/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ archived: false }),
        });
        fetchArchived();
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

    return (
        <div>
            <div className="page-header">
                <h1>Archived Doctors <span className="count">({doctors.length})</span></h1>
                <Link href="/admin/doctors" className="btn-back">← Active Doctors</Link>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Title</th>
                            <th>Specialty</th>
                            <th>Archived</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="empty-cell">Loading…</td></tr>
                        ) : doctors.length === 0 ? (
                            <tr><td colSpan={5} className="empty-cell">No archived doctors</td></tr>
                        ) : doctors.map((d) => (
                            <tr key={d.id}>
                                <td>{d.name}</td>
                                <td>{d.title}</td>
                                <td>{d.specialty || "—"}</td>
                                <td>{formatDate(d.updatedAt)}</td>
                                <td>
                                    <button className="btn-restore" onClick={() => handleRestore(d.id)}>Restore</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
                .page-header h1 { font-size: 1.5rem; font-weight: 600; }
                .count { color: rgba(255,255,255,0.35); font-weight: 400; font-size: 1.1rem; }
                .btn-back { color: rgba(255,255,255,0.5); text-decoration: none; font-size: 0.85rem; transition: color 0.15s; }
                .btn-back:hover { color: #fff; }
                .table-container {
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 10px; overflow: hidden;
                }
                .data-table { width: 100%; border-collapse: collapse; }
                .data-table th {
                    text-align: left; padding: 0.85rem 1rem; font-size: 0.76rem;
                    text-transform: uppercase; letter-spacing: 0.05em;
                    color: rgba(255,255,255,0.4); border-bottom: 1px solid rgba(255,255,255,0.06);
                    font-weight: 600;
                }
                .data-table td {
                    padding: 0.75rem 1rem; font-size: 0.88rem;
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                    color: rgba(255,255,255,0.8);
                }
                .data-table tr:hover { background: rgba(255,255,255,0.02); }
                .empty-cell { text-align: center; color: rgba(255,255,255,0.35); padding: 2rem !important; }
                .btn-restore {
                    background: rgba(16,185,129,0.15); color: #6ee7b7; border: none;
                    padding: 0.3rem 0.75rem; border-radius: 6px; font-size: 0.8rem;
                    cursor: pointer; font-weight: 500; font-family: inherit;
                }
                .btn-restore:hover { background: rgba(16,185,129,0.25); }
            `}</style>
        </div>
    );
}
