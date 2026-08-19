import { useEffect, useMemo, useState } from "react";
import { APPS_SCRIPT_URL } from "./config";
import "./AdminPage.css";

interface Participant {
  number: number;
  fullName: string;
  workplace: string;
  position: string;
}

function AdminPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [deletingNumber, setDeletingNumber] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(APPS_SCRIPT_URL);
      const data = await res.json();
      if (!data.ok) throw new Error("Деректерді алу мүмкін болмады");
      setParticipants(data.participants || []);
    } catch {
      setError("Тізімді жүктеу кезінде қате пайда болды.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const removeParticipant = async (participant: Participant) => {
    const confirmed = window.confirm(
      `Удалить участника «${participant.fullName}»?\n\nЭто действие нельзя отменить.`
    );
    if (!confirmed) return;

    setDeletingNumber(participant.number);
    setError("");

    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "delete", number: participant.number }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Удаление не удалось");

      setParticipants((current) =>
        current
          .filter((p) => p.number !== participant.number)
          .map((p, index) => ({ ...p, number: index + 1 }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить участника.");
    } finally {
      setDeletingNumber(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.workplace.toLowerCase().includes(q) ||
        p.position.toLowerCase().includes(q)
    );
  }, [participants, query]);

  return (
    <div className="admin-page">
      <div className="admin-print-header">
        <p className="admin-print-org">«№11 Жалпы орта білім беретін мектебі» КММ</p>
        <p className="admin-print-title">
          Білім беру қызметкерлерінің тамыз конференциясы
        </p>
        <p className="admin-print-theme">
          Жаңа халықтық конституцияның нормалары мен құндылықтары: Адами
          капиталды дамыту – білім беру жүйесінің стратегиялық негізі
        </p>
      </div>

      <div className="admin-toolbar">
        <div className="admin-heading">
          <h1>ҚАТЫСУШЫЛАР</h1>
          <p>Жалпы қатысушылар саны: {participants.length}</p>
        </div>

        <div className="admin-actions">
          <input
            type="text"
            className="admin-search"
            placeholder="Аты-жөні, орны немесе лауазымы бойынша іздеу"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="admin-btn" onClick={load} disabled={loading}>
            {loading ? "Жаңартылуда..." : "Жаңарту"}
          </button>
          <button className="admin-btn primary" onClick={() => window.print()}>
            Басып шығару
          </button>
        </div>
      </div>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Аты-жөні</th>
              <th>Жұмыс орны</th>
              <th>Лауазымы</th>
              <th className="admin-col-actions">Әрекет</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.number}>
                <td>{p.number}</td>
                <td>{p.fullName}</td>
                <td>{p.workplace}</td>
                <td>{p.position}</td>
                <td className="admin-col-actions">
                  <button
                    type="button"
                    className="admin-delete-btn"
                    onClick={() => removeParticipant(p)}
                    disabled={deletingNumber !== null}
                  >
                    {deletingNumber === p.number ? "Удаление..." : "Удалить"}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-empty">
                  Қатысушылар табылмады
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-credit" aria-label="Автор">
        <span>conference system</span>
        <span>·</span>
        <span>Шыңғыс</span>
      </div>
    </div>
  );
}

export default AdminPage;
