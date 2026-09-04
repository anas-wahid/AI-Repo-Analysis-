"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCachedGitHubStatus, type GitHubStatusCache } from "@/lib/github-status-cache";

type GitHubStatus = {
  connected: boolean;
  via: "oauth" | "token" | "none";
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  canConnect: boolean;
  canDisconnect: boolean;
  message: string;
};

const navItems = [
  { 
    label: "PR Review", 
    href: "/review", 
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-svg">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ) 
  },
  { 
    label: "Projects", 
    href: "/projects", 
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-svg">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ) 
  },
  { 
    label: "History", 
    href: "/history", 
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-svg">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ) 
  },
  { 
    label: "Settings", 
    href: "/settings", 
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-svg">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ) 
  },
];


export function Sidebar() {
  const pathname = usePathname();
  const [githubStatus, setGithubStatus] = useState<GitHubStatus>({
    connected: false,
    via: "none",
    username: null,
    displayName: null,
    avatarUrl: null,
    canConnect: false,
    canDisconnect: false,
    message: "",
  });

  useEffect(() => {
    const forceRefresh = window.location.search.includes("connected=github");
    if (forceRefresh) {
      window.history.replaceState({}, "", window.location.pathname);
    }

    getCachedGitHubStatus(forceRefresh).then((data) => {
      if (data) setGithubStatus(data as unknown as GitHubStatus);
    });
  }, []);

  return (
    <aside className="sidebar">
      <div className="brand" style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="TESTO logo" style={{ height: 24, width: "auto", borderRadius: 4 }} />
        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text)" }}>TESTO</span>
      </div>

      <nav className="nav-block">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={pathname === item.href ? "active" : ""}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* GitHub Connection Block */}
      <nav className="nav-block" style={{ borderTop: "1px solid var(--line)", marginTop: 8 }}>
        <p>ACCOUNT</p>

        {githubStatus.connected ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "8px 14px" }}>
            <span style={{ fontSize: 13, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span className="status-dot success" />
              Connected to GitHub
            </span>
            {githubStatus.canDisconnect && (
              <a href="/api/auth/logout" className="disconnect-link" style={{ marginTop: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Disconnect GitHub
              </a>
            )}
          </div>
        ) : (
          <>
            {githubStatus.canConnect ? (
              <div style={{ padding: "8px 14px" }}>
                <a href="/api/auth/github" className="connect-github-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6 }}>
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Connect GitHub
                </a>
              </div>
            ) : (
              <div style={{ padding: "8px 14px" }}>
                <Link href="/settings" style={{ fontSize: 13, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span className="status-dot warning" />
                  GitHub API Offline
                </Link>
              </div>
            )}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="profile">
          <div className="avatar">
            {githubStatus.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={githubStatus.avatarUrl}
                alt="Profile"
                style={{ width: "100%", height: "100%", borderRadius: 999, objectFit: "cover" }}
              />
            ) : (
              <span style={{ width: "100%", height: "100%", borderRadius: 999, background: "var(--gradient-primary)", color: "white", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700 }}>
                D
              </span>
            )}
          </div>
          <div className="profile-info">
            <strong>{githubStatus.displayName || githubStatus.username || "Developer"}</strong>
            <span>{githubStatus.username ? `@${githubStatus.username}` : "Local Dev"}</span>
          </div>
          <div className="profile-more">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </div>
        </div>
      </div>
    </aside>
  );
}
