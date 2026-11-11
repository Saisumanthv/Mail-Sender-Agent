import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null); // { text, ok }
  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState("");

  // Load the history once, then listen for new rows
  useEffect(() => {
    const loadHistory = async () => {
      const { data, error } = await supabase
        .from("email_logs")
        .select("*")
        .eq("sent_status", true)
        .order("created_at", { ascending: false });

      if (error) setHistoryError(error.message);
      else setHistory(data);
    };
    loadHistory();

    const channel = supabase
      .channel("email_logs_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "email_logs" },
        (payload) => {
          if (!payload.new.sent_status) return;
          setHistory((prev) =>
            prev.some((row) => row.id === payload.new.id)
              ? prev
              : [payload.new, ...prev]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSend = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(`${API_URL}/api/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: query }),
      });
      const data = await res.json();
      setResponse({
        text: data.data || data.error || data.details || "No response received.",
        ok: Boolean(data.success),
      });
      if (data.success) setQuery("");
    } catch (err) {
      setResponse({ text: `Could not reach the server: ${err.message}`, ok: false });
    } finally {
      setLoading(false);
    }
  };

  // Ctrl+Enter (or Cmd+Enter) sends the request
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSend();
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Sent mail history</h2>
          <span className="badge">{history.length}</span>
        </div>

        {historyError && <p className="error-text">{historyError}</p>}
        {!historyError && history.length === 0 && (
          <p className="empty">No mails sent yet.</p>
        )}

        {history.map((row) => (
          <div className="item" key={row.id}>
            <strong>{row.mail_id}</strong>
            <small>{new Date(row.created_at).toLocaleString()}</small>
            <details>
              <summary>View content</summary>
              <pre>{row.content}</pre>
            </details>
          </div>
        ))}
      </aside>

      <main className="main">
        <div className="card">
          <h1>Mail Agent</h1>
          <p className="subtitle">
            Describe the mail and include the recipient's address. Press Ctrl+Enter to send.
          </p>

          <textarea
            rows={4}
            placeholder="Write a selection mail to SDE-1 role at NxtWave and send it to aiwithsumanth@gmail.com"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />

          <button
            className="send-btn"
            onClick={handleSend}
            disabled={loading || !query.trim()}
          >
            {loading ? "Sending..." : "Send"}
          </button>

          {response && (
            <p className={`response ${response.ok ? "success" : "error"}`}>
              {response.text}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}