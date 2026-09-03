"use client";

import { useEffect, useState } from "react";
import { getCachedGitHubStatus } from "@/lib/github-status-cache";

type Integration = {
  name: string;
  key: string;
  configured: boolean;
  required: boolean;
  description: string;
  icon: React.ReactNode;
};

type HealthData = {
  ok: boolean;
  service: string;
  layers: Record<string, string | boolean>;
  missingEnv: string[];
};

export default function SettingsPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [githubStatus, setGithubStatus] = useState<{
    connected: boolean;
    username?: string;
    message?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/health").then((r) => r.json()),
      getCachedGitHubStatus(),
    ])
      .then(([h, g]) => {
        setHealth(h);
        if (g) setGithubStatus(g as unknown as typeof githubStatus);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const integrations: Integration[] = [
    {
      name: "Neon Database",
      key: "DATABASE_URL",
      configured: health?.layers?.neon === "configured",
      required: true,
      description: "Serverless Postgres for storing test results and analytics.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
        </svg>
      ),
    },
    {
      name: "GitHub OAuth",
      key: "GITHUB_CLIENT_ID + SECRET",
      configured: githubStatus?.connected ?? false,
      required: false,
      description: "Connect GitHub to access private repos and webhooks.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
    {
      name: "NVIDIA AI (Llama)",
      key: "NVIDIA_API_KEY",
      configured: health?.layers?.ai === "configured",
      required: false,
      description: "AI model for generating test cases and error analysis.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.57 3.25 3.92L8 22h8l-3.25-12.08A4.001 4.001 0 0 0 12 2z" />
        </svg>
      ),
    },
    {
      name: "Browserbase",
      key: "BROWSERBASE_API_KEY",
      configured: health?.layers?.browserbase === "configured",
      required: false,
      description: "Cloud browser infrastructure for running E2E tests.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
  ];

  return (
    <section className="review-page">
      <header className="page-header">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>Settings</h1>
          <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 6 }}>
            Manage your integrations and connection status.
          </p>
        </div>
      </header>

      {loading ? (
        <div className="skeleton-grid">
          <div className="skeleton-card" style={{ height: 100 }} />
          <div className="skeleton-card" style={{ height: 100 }} />
          <div className="skeleton-card" style={{ height: 100 }} />
          <div className="skeleton-card" style={{ height: 100 }} />
        </div>
      ) : (
        <>
          {/* Health Status Banner */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 20px",
            borderRadius: 12,
            border: `1px solid ${health?.ok ? "#bbf7d0" : "#fecaca"}`,
            background: health?.ok ? "#f0fdf4" : "#fef2f2",
            marginBottom: 24,
          }}>
            <span className={`status-dot ${health?.ok ? "success" : "danger"}`} />
            <span style={{ fontSize: 14, fontWeight: 600, color: health?.ok ? "#059669" : "#ef4444" }}>
              {health?.ok ? "All systems operational" : "Issues detected"}
            </span>
            <span style={{ fontSize: 13, color: "var(--muted)", marginLeft: "auto" }}>
              {health?.service || "—"}
            </span>
          </div>

          {/* Integration Cards */}
          <div className="settings-grid">
            {integrations.map((item) => (
              <article className="connection-card" key={item.key} style={{ padding: 20 }}>
                <div className="card-icon" style={{
                  background: item.configured ? "var(--text)" : "var(--soft)",
                  color: item.configured ? "white" : "var(--text)",
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{item.name}</h2>
                    {item.required && (
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--danger)", background: "#fef2f2", padding: "2px 6px", borderRadius: 4, border: "1px solid #fecaca" }}>Required</span>
                    )}
                  </div>
                  <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: 13 }}>{item.description}</p>
                  <p style={{ margin: "6px 0 0" }}>
                    <code style={{ fontSize: 11, padding: "2px 6px", background: "var(--soft)", borderRadius: 4 }}>{item.key}</code>
                  </p>
                  {item.name === "GitHub OAuth" && githubStatus?.username && (
                    <p style={{ marginTop: 6, color: "var(--text)", fontSize: 13, fontWeight: 600 }}>
                      Connected as @{githubStatus.username}
                    </p>
                  )}
                </div>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: item.configured ? "#059669" : item.required ? "#ef4444" : "#d97706",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: item.configured ? "#ecfdf5" : item.required ? "#fef2f2" : "#fffbeb",
                  border: `1px solid ${item.configured ? "#a7f3d0" : item.required ? "#fecaca" : "#fde68a"}`,
                }}>
                  <span className={`status-dot ${item.configured ? "success" : item.required ? "danger" : "warning"}`} />
                  {item.configured ? "Connected" : item.required ? "Required" : "Optional"}
                </span>
              </article>
            ))}
          </div>

          {/* Environment Info */}
          <div className="settings-section">
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Environment Info</h2>
            <div className="env-info" style={{ borderRadius: 14, overflow: "hidden" }}>
              <div className="env-row">
                <span>Service</span>
                <strong>{health?.service || "—"}</strong>
              </div>
              <div className="env-row">
                <span>Status</span>
                <span style={{ fontSize: 13, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span className={`status-dot ${health?.ok ? "success" : "danger"}`} />
                  {health?.ok ? "Healthy" : "Issues Detected"}
                </span>
              </div>
              {health?.missingEnv && health.missingEnv.length > 0 && (
                <div className="env-row">
                  <span>Missing</span>
                  <strong style={{ color: "var(--danger)" }}>
                    {health.missingEnv.join(", ")}
                  </strong>
                </div>
              )}
              <div className="env-row">
                <span>App URL</span>
                <code style={{ fontSize: 12, padding: "2px 6px", background: "var(--soft)", borderRadius: 4 }}>
                  {typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}
                </code>
              </div>
              <div className="env-row">
                <span>Node.js</span>
                <code style={{ fontSize: 12, padding: "2px 6px", background: "var(--soft)", borderRadius: 4 }}>16.x</code>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
