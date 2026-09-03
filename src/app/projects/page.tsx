"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Repo = {
  id: string;
  githubOwner: string;
  githubRepo: string;
  selectedBranch: string;
  createdAt: string;
};

export default function ProjectsPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/repos")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.repositories)) {
          setRepos(data.repositories);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function deleteRepo(id: string) {
    if (!confirm("Delete this repository?")) return;
    try {
      const res = await fetch(`/api/repos/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.ok) {
        setRepos((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      // ignore
    }
  }

  return (
    <section className="review-page">
      <header className="page-header">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>Projects</h1>
          <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 6 }}>
            All analyzed repositories and their test status.
          </p>
        </div>
        <Link
          href="/review"
          className="btn btn-gradient btn-md"
          style={{ textDecoration: "none" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Repository
        </Link>
      </header>

      {loading ? (
        <div className="skeleton-grid">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : repos.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-icon" style={{ fontSize: 56, marginBottom: 16 }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d4d4d8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>No projects yet</h2>
          <p style={{ color: "var(--muted)", maxWidth: 380, margin: "8px auto 0", lineHeight: 1.6 }}>
            Connect a GitHub repository and let the AI agent analyze your codebase to generate tests.
          </p>
          <Link
            href="/review"
            className="btn btn-gradient btn-md"
            style={{ textDecoration: "none", marginTop: 24, display: "inline-flex" }}
          >
            Get Started
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="projects-grid">
          {repos.map((repo) => (
            <article className="project-card" key={repo.id}>
              <div className="project-header">
                <div className="card-icon" style={{ background: "var(--text)", color: "white", fontWeight: 800, fontSize: 16 }}>
                  {repo.githubRepo.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{repo.githubRepo}</h2>
                  <p style={{ color: "var(--muted)", fontSize: 13, margin: "2px 0 0" }}>
                    {repo.githubOwner}/{repo.githubRepo}
                  </p>
                </div>
                <span style={{ fontSize: 12, color: "#059669", display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600, background: "#ecfdf5", padding: "4px 10px", borderRadius: 6, border: "1px solid #a7f3d0" }}>
                  <span className="status-dot success" />
                  Analyzed
                </span>
              </div>
              <div className="project-meta">
                <div>
                  <span>Branch</span>
                  <strong style={{ fontFamily: "ui-monospace, monospace", fontSize: 13 }}>{repo.selectedBranch}</strong>
                </div>
                <div>
                  <span>Added</span>
                  <strong>{new Date(repo.createdAt).toLocaleDateString()}</strong>
                </div>
              </div>
              <div className="project-actions">
                <Link href="/review" className="btn btn-gradient btn-sm" style={{ textDecoration: "none", flex: 1, textAlign: "center" }}>
                  Open
                </Link>
                <button
                  className="btn btn-outline btn-sm"
                  type="button"
                  onClick={() => deleteRepo(repo.id)}
                  style={{ color: "var(--danger)", borderColor: "#fecaca", background: "#fef2f2" }}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
