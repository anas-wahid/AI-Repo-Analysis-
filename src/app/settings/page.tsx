"use client";

import { useEffect, useState } from "react";
import { getCachedGitHubStatus } from "@/lib/github-status-cache";

type Integration = {
  name: string;
  key: string;
  configured: boolean;
  required: boolean;
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
    },
    {
      name: "GitHub Token",
      key: "GITHUB_TOKEN",
      configured: githubStatus?.connected ?? false,
      required: false,
    },
    {
      name: "OpenAI API",
      key: "OPENAI_API_KEY",
      configured: health?.layers?.ai === "configured",
      required: false,
    },
    {
      name: "Browserbase",
      key: "BROWSERBASE_API_KEY + BROWSERBASE_PROJECT_ID",
      configured: health?.layers?.browserbase === "configured",
      required: false,
    },
  ];

  return (
    <section className="review-page">
      <header className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your integrations and connection status.</p>
        </div>
      </header>

      {loading ? (
        <div className="notice-banner">Loading configuration status...</div>
      ) : (
        <>
          <div className="settings-grid">
            {integrations.map((item) => (
              <article className="connection-card" key={item.key}>
                <div className="card-icon">
                  {item.configured ? "✓" : "✗"}
                </div>
                <div>
                  <h2>{item.name}</h2>
                  <p>
                    <code>{item.key}</code>
                  </p>
                  {item.name === "GitHub Token" && githubStatus?.username && (
                    <p style={{ marginTop: 6, color: "var(--text)" }}>
                      Connected as <strong>{githubStatus.username}</strong>
                    </p>
                  )}
                </div>
                <span style={{ fontSize: 13, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span className={`status-dot ${item.configured ? "success" : item.required ? "danger" : "warning"}`} />
                  {item.configured ? "Connected" : item.required ? "Required" : "Optional"}
                </span>
              </article>
            ))}
          </div>

          <div className="settings-section">
            <h2>Environment Info</h2>
            <div className="env-info">
              <div className="env-row">
                <span>Service</span>
                <strong>{health?.service || "—"}</strong>
              </div>
              <div className="env-row">
                <span>Status</span>
                <strong>
                  <span style={{ fontSize: 13, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span className={`status-dot ${health?.ok ? "success" : "danger"}`} />
                    {health?.ok ? "Healthy" : "Issues Detected"}
                  </span>
                </strong>
              </div>
              {health?.missingEnv && health.missingEnv.length > 0 && (
                <div className="env-row">
                  <span>Missing</span>
                  <strong style={{ color: "var(--danger)" }}>
                    {health.missingEnv.join(", ")}
                  </strong>
                </div>
              )}
            </div>
          </div>


        </>
      )}
    </section>
  );
}
