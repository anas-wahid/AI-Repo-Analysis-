"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { useState } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLanding) {
    return <main className="landing-root">{children}</main>;
  }

  const getPageTitle = () => {
    if (pathname.startsWith("/review")) return "PR Review";
    if (pathname.startsWith("/projects")) return "Projects";
    if (pathname.startsWith("/history")) return "History";
    if (pathname.startsWith("/settings")) return "Settings";
    return "Dashboard";
  };

  return (
    <div className="app-shell">
      {/* Mobile App Header */}
      <header className="mobile-app-header">
        <div className="mobile-header-brand">
          <a href="/review" className="mobile-brand-link">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="TESTO" className="mobile-brand-logo" />
            <span className="mobile-brand-name">TESTO</span>
          </a>
          <span className="mobile-header-divider">/</span>
          <span className="mobile-header-title">{getPageTitle()}</span>
        </div>
        <button
          type="button"
          className="mobile-hamburger-btn"
          aria-label="Toggle navigation"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </header>

      {/* Backdrop for mobile */}
      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <main className="main-panel">{children}</main>
    </div>
  );
}
