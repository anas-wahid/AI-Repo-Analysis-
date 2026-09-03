"use client";

import { useEffect, useState } from "react";

type RunEntry = {
  id: string;
  repoName: string;
  repoFullName: string;
  status: string;
  summary: string | null;
  durationMs: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  sessionUrl: string | null;
  screenshotUrl: string | null;
};

export default function HistoryPage() {
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/runs")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.runs)) {
          setRuns(data.runs);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function statusIcon(status: string) {
    if (status === "passed") return "✓";
    if (status === "failed") return "✗";
    if (status === "cancelled") return "—";
    return "●";
  }

  function statusClass(status: string) {
    if (status === "passed") return "success";
    if (status === "failed") return "danger";
    return "warning";
  }

  function formatDate(iso: string) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "—";
    }
  }

  function formatTime(iso: string) {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  function formatDuration(ms: number | null) {
    if (!ms) return "—";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }

  const passed = runs.filter((r) => r.status === "passed").length;
  const failed = runs.filter((r) => r.status === "failed").length;
  const passRate = runs.length > 0 ? ((passed / runs.length) * 100).toFixed(0) : "—";

  return (
    <section className="review-page">
      <header className="page-header">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>Test Run History</h1>
          <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 6 }}>
            View past test runs and their results across all repositories.
          </p>
        </div>
        <button
          className="btn btn-outline btn-md"
          type="button"
          onClick={() => {
            setLoading(true);
            fetch("/api/runs")
              .then((r) => r.json())
              .then((data) => { if (data.ok) setRuns(data.runs); })
              .catch(() => {})
              .finally(() => setLoading(false));
          }}
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          Refresh
        </button>
      </header>

      {loading ? (
        <div className="skeleton-grid">
          <div className="skeleton-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            <div className="skeleton-card header-skeleton" />
            <div className="skeleton-card header-skeleton" />
            <div className="skeleton-card header-skeleton" />
            <div className="skeleton-card header-skeleton" />
          </div>
          <div className="skeleton-card" style={{ height: 200 }} />
        </div>
      ) : runs.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-icon" style={{ marginBottom: 16 }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d4d4d8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>No test runs yet</h2>
          <p style={{ color: "var(--muted)", maxWidth: 380, margin: "8px auto 0", lineHeight: 1.6 }}>
            Run a browser test from the PR Review page to see results here.
          </p>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="history-stats">
            <div className="history-stat" style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 20 }}>
              <span className="history-stat-value" style={{ fontSize: 32, fontWeight: 800 }}>{runs.length}</span>
              <span className="history-stat-label" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", marginTop: 4 }}>Total Runs</span>
            </div>
            <div className="history-stat" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14, padding: 20 }}>
              <span className="history-stat-value" style={{ fontSize: 32, fontWeight: 800, color: "#059669" }}>{passed}</span>
              <span className="history-stat-label" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#059669", marginTop: 4 }}>Passed</span>
            </div>
            <div className="history-stat" style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 14, padding: 20 }}>
              <span className="history-stat-value" style={{ fontSize: 32, fontWeight: 800, color: "#ef4444" }}>{failed}</span>
              <span className="history-stat-label" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#ef4444", marginTop: 4 }}>Failed</span>
            </div>
            <div className="history-stat" style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 14, padding: 20 }}>
              <span className="history-stat-value" style={{ fontSize: 32, fontWeight: 800 }}>{passRate}</span>
              <span className="history-stat-label" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", marginTop: 4 }}>Pass Rate</span>
            </div>
          </div>

          {/* Runs table */}
          <div className="history-table" style={{ border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", background: "var(--panel)" }}>
            <div className="history-table-header">
              <span>Status</span>
              <span>Repository</span>
              <span>Summary</span>
              <span>Duration</span>
              <span>Date</span>
            </div>
            {runs.map((run) => (
              <div key={run.id}>
                <div
                  className={`history-row ${expandedId === run.id ? "expanded" : ""}`}
                  onClick={() => setExpandedId(expandedId === run.id ? null : run.id)}
                >
                  <span className="history-status">
                    <span className={`status-dot ${statusClass(run.status)}`} />
                    <span className={`history-status-text ${statusClass(run.status)}`}>
                      {statusIcon(run.status)} {run.status}
                    </span>
                  </span>
                  <span className="history-repo">
                    <strong>{run.repoName}</strong>
                    {run.repoFullName && <small>{run.repoFullName}</small>}
                  </span>
                  <span className="history-summary">
                    {run.summary ? (run.summary.length > 80 ? run.summary.slice(0, 80) + "…" : run.summary) : "—"}
                  </span>
                  <span className="history-duration">{formatDuration(run.durationMs)}</span>
                  <span className="history-date">
                    <span>{formatDate(run.createdAt)}</span>
                    <small>{formatTime(run.createdAt)}</small>
                  </span>
                </div>

                {expandedId === run.id && (
                  <div className="history-detail fade-in">
                    <div className="history-detail-grid">
                      <div className="history-detail-item">
                        <span className="history-detail-label">Run ID</span>
                        <code>{run.id.slice(0, 8)}…</code>
                      </div>
                      {run.startedAt && (
                        <div className="history-detail-item">
                          <span className="history-detail-label">Started</span>
                          <span>{formatDate(run.startedAt)} {formatTime(run.startedAt)}</span>
                        </div>
                      )}
                      {run.finishedAt && (
                        <div className="history-detail-item">
                          <span className="history-detail-label">Finished</span>
                          <span>{formatDate(run.finishedAt)} {formatTime(run.finishedAt)}</span>
                        </div>
                      )}
                      {run.durationMs && (
                        <div className="history-detail-item">
                          <span className="history-detail-label">Duration</span>
                          <span>{formatDuration(run.durationMs)}</span>
                        </div>
                      )}
                    </div>
                    {run.summary && (
                      <div className="history-detail-summary">
                        <span className="history-detail-label">Full Summary</span>
                        <p>{run.summary}</p>
                      </div>
                    )}
                    <div className="history-detail-actions">
                      {run.sessionUrl && (
                        <a href={run.sessionUrl} target="_blank" rel="noopener noreferrer" className="session-link" onClick={(e) => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                          View Browserbase Session
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
