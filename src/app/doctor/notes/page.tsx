"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface Note {
    id: number;
    name: string;
    noteDate: string;
    doctorCheckNote: boolean;
    details: string | null;
    doctor: { id: string; name: string };
}

export default function DoctorNotesPage() {
    const { data: session } = useSession();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const doctorId = (session?.user as { id?: string })?.id;

    const fetchNotes = useCallback(async () => {
        if (!doctorId) return;
        setLoading(true);
        const params = new URLSearchParams({ page: String(page), limit: "20", doctorId });
        const res = await fetch(`/api/notes?${params}`);
        const data = await res.json();
        setNotes(data.notes || []);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
    }, [page, doctorId]);

    useEffect(() => { fetchNotes(); }, [fetchNotes]);

    const toggleCheck = async (note: Note) => {
        await fetch(`/api/notes/${note.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ doctorCheckNote: !note.doctorCheckNote }),
        });
        fetchNotes();
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

    return (
        <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>My Notes</h1>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr><th>Date</th><th>Name</th><th>Checked</th><th>Details</th></tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", padding: "2rem" }}>Loading…</td></tr>
                        ) : notes.length === 0 ? (
                            <tr><td colSpan={4} style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", padding: "2rem" }}>No notes</td></tr>
                        ) : notes.map((n) => (
                            <tr key={n.id}>
                                <td>{formatDate(n.noteDate)}</td>
                                <td style={{ fontWeight: 600 }}>{n.name}</td>
                                <td>
                                    <button className="check-btn" onClick={() => toggleCheck(n)}>
                                        {n.doctorCheckNote ? "✅" : "☐"}
                                    </button>
                                </td>
                                <td className="note-details">{n.details || "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
                    <span>Page {page} of {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next →</button>
                </div>
            )}

            <style jsx>{`
                .table-container { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: var(--radius-md, 4px); overflow: hidden; }
                .data-table { width: 100%; border-collapse: collapse; }
                .data-table th { text-align: left; padding: 0.85rem 1rem; font-size: 0.76rem; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.4); border-bottom: 1px solid rgba(255,255,255,0.06); font-weight: 600; }
                .data-table td { padding: 0.75rem 1rem; font-size: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(255,255,255,0.8); }
                .data-table tr:hover { background: rgba(255,255,255,0.02); }
                .note-details { max-width: 350px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: rgba(255,255,255,0.5); }
                .check-btn { background: none; border: none; cursor: pointer; font-size: 1rem; padding: 0.2rem; }
                .pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1.25rem; color: rgba(255,255,255,0.5); font-size: 0.85rem; }
                .pagination button { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.4rem 0.9rem; border-radius: var(--radius-sm, 2px); cursor: pointer; font-size: 0.82rem; font-family: inherit; }
                .pagination button:disabled { opacity: 0.3; cursor: not-allowed; }
            `}</style>
        </div>
    );
}
