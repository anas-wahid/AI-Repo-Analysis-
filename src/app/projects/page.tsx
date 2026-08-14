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
      .catch(() => { })
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
          <h1>Projects</h1>
          <p>All analyzed repositories and their test status.</p>
        </div>
        <Link href="/" className="ghost-button" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
          + Add Repo
        </Link>
      </header>

      {loading ? (
        <div className="notice-banner">Loading projects...</div>
      ) : repos.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-icon">📁</div>
          <h2>No projects yet</h2>
          <p>Go to the <Link href="/">PR Review</Link> page and add a GitHub repo to get started.</p>
        </div>
      ) : (
        <div className="projects-grid">
          {repos.map((repo) => (
            <article className="project-card" key={repo.id}>
              <div className="project-header">
                <div className="card-icon">
                  {repo.githubRepo.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2>{repo.githubRepo}</h2>
                  <p>{repo.githubOwner}/{repo.githubRepo}</p>
                </div>
                <span style={{ fontSize: 13, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span className="status-dot success" />
                  Analyzed
                </span>
              </div>
              <div className="project-meta">
                <div>
                  <span>Branch</span>
                  <strong>{repo.selectedBranch}</strong>
                </div>
                <div>
                  <span>Added</span>
                  <strong>{new Date(repo.createdAt).toLocaleDateString()}</strong>
                </div>
              </div>
              <div className="project-actions">
                <Link href="/" className="run-button" style={{ textDecoration: "none", textAlign: "center" }}>
                  Open
                </Link>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => deleteRepo(repo.id)}
                  style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
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
