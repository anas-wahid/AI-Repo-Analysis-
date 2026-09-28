"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Scroll reveal observer for vertical entrance animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".scroll-reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-wrap">
      {/* ── Top Header / Navbar ─────────────────────────────────── */}
      <header className="landing-nav-header">
        <div className="landing-nav-inner">
          <Link href="/" className="landing-brand">
            <span className="brand-dot-grid">
              <span className="dot dot-dark" />
              <span className="dot dot-dark" />
              <span className="dot dot-dark" />
              <span className="dot dot-dark" />
            </span>
            <span className="brand-title">TESTO</span>
          </Link>

          <nav className={`landing-nav-links ${mobileMenuOpen ? "open" : ""}`}>
            <a href="#solutions" onClick={() => setMobileMenuOpen(false)}>Solutions</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#integrations" onClick={() => setMobileMenuOpen(false)}>Integrations</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
            <Link href="/review" className="mobile-cta-btn" onClick={() => setMobileMenuOpen(false)}>
              Get started
            </Link>
          </nav>

          <div className="landing-nav-actions">
            <Link href="/review" className="nav-signin-link">Sign in</Link>
            <Link href="/review" className="btn-get-demo">Get started</Link>
            <button
              type="button"
              className="landing-hamburger-btn"
              aria-label="Toggle navigation menu"
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
          </div>
        </div>
      </header>

      {/* ── Main Landing Content Container ──────────────────────── */}
      <main className="landing-content">
        {/* ── Section 1: Hero Frame (Pure Black & White with Floating Micro-Animations) ── */}
        <section className="hero-canvas-card scroll-reveal">
          <div className="hero-pattern-bg" />

          {/* Central 3D Cube Icon (Monochrome with Floating Animation) */}
          <div className="hero-3d-cube floating-cube" aria-hidden="true">
            <div className="cube-inner">
              <span className="cube-dot" />
              <span className="cube-dot" />
              <span className="cube-dot" />
              <span className="cube-dot" />
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="hero-headline">
            <span className="headline-dark">Test, verify, and ship</span>
            <span className="headline-muted">all in one place</span>
          </h1>

          <p className="hero-subtext">
            Autonomous AI testing agents that scan repositories, write Playwright test suites,
            and execute in cloud browsers with full video replay.
          </p>

          <div className="hero-action-row">
            <Link href="/review" className="hero-primary-btn">
              Get started free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Floating Tactile 3D Cards with Gentle Float */}
          <div className="hero-floating-elements">
            {/* Top Right: Reminders Card + Clock Tile */}
            <div className="float-card reminders-card float-anim-1">
              <div className="reminders-header">
                <span className="reminders-title">Scheduled Runs</span>
                <span className="reminders-tag">CI/CD</span>
              </div>
              <div className="reminders-body">
                <strong>PR Review Automation</strong>
                <span>Runs on push to main & pull requests</span>
                <div className="reminders-time">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>Avg Duration: 2m 14s</span>
                </div>
              </div>
              <div className="clock-3d-tile">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 15 15" />
                </svg>
              </div>
            </div>

            {/* Bottom Left: Today's Test Suites */}
            <div className="float-card tasks-card float-anim-2">
              <div className="tasks-header">
                <span className="tasks-title">Active Test Suites</span>
              </div>
              <div className="task-item">
                <div className="task-row-top">
                  <span className="task-badge">8</span>
                  <span className="task-name">homepage.spec.ts</span>
                  <span className="task-pct">100%</span>
                </div>
                <div className="task-bar-track">
                  <div className="task-bar-fill" style={{ width: "100%" }} />
                </div>
              </div>
              <div className="task-item">
                <div className="task-row-top">
                  <span className="task-badge">3</span>
                  <span className="task-name">auth-checkout.spec.ts</span>
                  <span className="task-pct">100%</span>
                </div>
                <div className="task-bar-track">
                  <div className="task-bar-fill" style={{ width: "100%" }} />
                </div>
              </div>
            </div>

            {/* Bottom Right: Integrations Tile Stack */}
            <div className="float-card integrations-hero-card float-anim-3">
              <span className="integrations-hero-title">100+ Integrations</span>
              <div className="integrations-hero-icons">
                <div className="hero-app-tile" title="GitHub">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
                <div className="hero-app-tile" title="Playwright">
                  <span style={{ fontSize: 13, fontWeight: 800 }}>PW</span>
                </div>
                <div className="hero-app-tile" title="Browserbase">
                  <span style={{ fontSize: 13, fontWeight: 800 }}>BB</span>
                </div>
                <div className="hero-app-tile" title="Neon Postgres">
                  <span style={{ fontSize: 13, fontWeight: 800 }}>N</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 2: Solutions (Solutions in Distinct Elevated Boxes) ── */}
        <section className="landing-section scroll-reveal" id="solutions">
          <div className="section-pill-tag">Solutions</div>
          <h2 className="section-title-large">Solve your team&apos;s biggest challenges</h2>

          {/* Solutions In Boxes */}
          <div className="solutions-three-col">
            <div className="sol-col-box scroll-reveal">
              <div className="sol-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3 className="sol-box-title">Regression Prevention</h3>
              <p>Catch regressions and broken flows automatically before merging code into production.</p>
            </div>

            <div className="sol-col-box scroll-reveal">
              <div className="sol-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </div>
              <h3 className="sol-box-title">Smart Test Prioritization</h3>
              <p>Prioritize critical workflows with AI-generated test cases written from your actual schema and routes.</p>
            </div>

            <div className="sol-col-box scroll-reveal">
              <div className="sol-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="sol-box-title">Replay & Root Cause</h3>
              <p>Give every engineer instant confidence with cloud replay recordings, logs, and root cause diagnosis.</p>
            </div>
          </div>

          {/* Large Showcase App Window (Obsidian Black Frame) */}
          <div className="showcase-window-wrapper scroll-reveal">
            <div className="showcase-floating-tile check float-anim-1" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="showcase-floating-tile number float-anim-2" aria-hidden="true">20</div>

            <div className="showcase-frame">
              <div className="showcase-inner-app">
                {/* App Topbar */}
                <div className="app-mock-topbar">
                  <div className="app-mock-brand">
                    <span className="mock-dot-grid" />
                    <strong>TESTO PR Review</strong>
                  </div>
                  <div className="app-mock-search">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span>Search tests, repos, branches...</span>
                  </div>
                  <div className="app-mock-user">
                    <span className="app-user-pill">Connected: @developer</span>
                  </div>
                </div>

                {/* App Greeting Row */}
                <div className="app-mock-greeting">
                  <div>
                    <h3>Repository Analysis Dashboard</h3>
                    <p>Repository: anas-wahid/AI-Repo-Analysis · Branch: main</p>
                  </div>
                  <Link href="/review" className="app-mock-run-btn">
                    Run Suite
                  </Link>
                </div>

                {/* Dashboard Panels Grid */}
                <div className="app-mock-grid">
                  <div className="app-mock-card">
                    <div className="mock-card-head">
                      <span>📁 Scanned Files</span>
                      <span className="badge-pill">24 files</span>
                    </div>
                    <div className="mock-file-list">
                      <div className="mock-file-item">src/app/page.tsx <small>React 19</small></div>
                      <div className="mock-file-item">src/app/api/auth/route.ts <small>OAuth</small></div>
                      <div className="mock-file-item">src/db/schema.ts <small>Drizzle</small></div>
                    </div>
                  </div>

                  <div className="app-mock-card">
                    <div className="mock-card-head">
                      <span>⏱️ Cloud Session</span>
                      <span className="badge-pill">Running</span>
                    </div>
                    <div className="mock-timer-display">02:14:58</div>
                    <div className="mock-session-stats">
                      <span className="metric-chip pass">29 Passed</span>
                      <span className="metric-chip fail">0 Failed</span>
                    </div>
                  </div>

                  <div className="app-mock-card">
                    <div className="mock-card-head">
                      <span>🎯 Generated Tests</span>
                      <span className="badge-pill">3 Suites</span>
                    </div>
                    <div className="mock-test-bars">
                      <div className="test-bar-row">
                        <span>Homepage Load</span>
                        <div className="mini-track"><div className="mini-fill" style={{ width: "100%" }} /></div>
                      </div>
                      <div className="test-bar-row">
                        <span>OAuth Flow</span>
                        <div className="mini-track"><div className="mini-fill" style={{ width: "85%" }} /></div>
                      </div>
                      <div className="test-bar-row">
                        <span>Database Query</span>
                        <div className="mini-track"><div className="mini-fill" style={{ width: "95%" }} /></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 3: Features 2x2 Bento (Monochrome with Scroll Reveal) ── */}
        <section className="landing-section scroll-reveal" id="features">
          <div className="section-pill-tag">Features</div>
          <h2 className="section-title-large">Keep everything in one place</h2>
          <p className="section-desc-muted">Forget complex project management tools and flaky manual tests.</p>

          <div className="bento-2x2-grid">
            {/* Bento Card 1 */}
            <div className="bento-card scroll-reveal">
              <div className="bento-card-preview">
                <div className="mini-preview-sheet">
                  <div className="sheet-header">
                    <span className="sheet-badge">Code Analysis</span>
                    <span>42 Components</span>
                  </div>
                  <div className="sheet-rows">
                    <div className="sheet-row">✓ Route verification verified</div>
                    <div className="sheet-row">✓ Auth state machine mapped</div>
                    <div className="sheet-row">✓ API payload contract checked</div>
                  </div>
                </div>
              </div>
              <h3 className="bento-title">Autonomous Repository Analysis</h3>
              <p className="bento-desc">
                Our LLM pipeline scans your repository structure, recognizes component hierarchies, and builds high-priority test targets.
              </p>
            </div>

            {/* Bento Card 2 */}
            <div className="bento-card scroll-reveal">
              <div className="bento-card-preview">
                <div className="mini-preview-schedule">
                  <div className="mini-schedule-row">
                    <span className="day-box">P1</span>
                    <span className="sched-text">Navigation assertions</span>
                    <span className="status-dot" />
                  </div>
                  <div className="mini-schedule-row">
                    <span className="day-box">P2</span>
                    <span className="sched-text">Form validation suite</span>
                    <span className="status-dot" />
                  </div>
                  <div className="mini-schedule-donut">
                    <div className="donut-circle">95%</div>
                    <span>Pass Rate</span>
                  </div>
                </div>
              </div>
              <h3 className="bento-title">Cloud Browser Execution</h3>
              <p className="bento-desc">
                Runs tests on Browserbase cloud instances with full session replay, high-res screenshots, and video recordings.
              </p>
            </div>

            {/* Bento Card 3 */}
            <div className="bento-card scroll-reveal">
              <div className="bento-card-preview">
                <div className="mini-preview-timeline">
                  <div className="timeline-badge-row">
                    <span className="tile-arrow">»</span>
                    <span>AI Error Diagnostic</span>
                  </div>
                  <div className="mini-code-box">
                    <code>Error: Button locator not found</code>
                    <small>Confidence: 94% · Cause: Missing client hydration tag</small>
                  </div>
                </div>
              </div>
              <h3 className="bento-title">AI Root-Cause Diagnosis</h3>
              <p className="bento-desc">
                When a test fails, the agent inspects the DOM and network traces to suggest the exact code fix in seconds.
              </p>
            </div>

            {/* Bento Card 4 */}
            <div className="bento-card scroll-reveal">
              <div className="bento-card-preview">
                <div className="mini-preview-widgets">
                  <div className="widget-chip">
                    <span className="chip-time">04:21</span>
                    <span>Automated PR Bot</span>
                  </div>
                  <div className="widget-grid-mini">
                    <span className="box-mini">Neon DB</span>
                    <span className="box-mini">Drizzle</span>
                    <span className="box-mini">GitHub</span>
                  </div>
                </div>
              </div>
              <h3 className="bento-title">Customizable Test Suites</h3>
              <p className="bento-desc">
                Target specific branches, trigger runs from GitHub webhooks, or prompt in natural language to generate custom test scenarios.
              </p>
            </div>
          </div>

          <div className="bento-footer-note">and a lot more features...</div>
        </section>

        {/* ── Section 4: Integrations (Monochrome Tiles with Scroll Reveal) ── */}
        <section className="landing-section scroll-reveal" id="integrations">
          <div className="section-pill-tag">Integrations</div>
          <h2 className="section-title-large">Connect integrations you use every day</h2>

          {/* Central Hub Node Icon (Monochrome) */}
          <div className="integrations-hub-icon floating-cube" aria-hidden="true">
            <span className="hub-dot" />
            <span className="hub-dot" />
            <span className="hub-dot" />
            <span className="hub-dot" />
          </div>

          {/* Grid of Tactile 3D Icon Tiles in Monochrome */}
          <div className="integrations-tiles-grid">
            <div className="tactile-app-tile" title="GitHub">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </div>
            <div className="tactile-app-tile" title="Playwright">
              <span className="app-text-badge">PW</span>
            </div>
            {/* <div className="tactile-app-tile" title="Browserbase">
              <span className="app-text-badge">BB</span>
            </div> */}
            <div className="tactile-app-tile" title="Neon Postgres">
              <span className="app-text-badge">Neon</span>
            </div>
            <div className="tactile-app-tile" title="Drizzle ORM">
              <span className="app-text-badge">Drizzle</span>
            </div>
            {/* <div className="tactile-app-tile" title="Next.js">
              <span className="app-text-badge">Next</span>
            </div> */}
            {/* <div className="tactile-app-tile" title="TypeScript">
              <span className="app-text-badge">TS</span>
            </div> */}
            {/* <div className="tactile-app-tile" title="Docker">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
            </div> */}
            {/* <div className="tactile-app-tile" title="Slack">
              <span className="app-text-badge">#</span>
            </div> */}
            <div className="tactile-app-tile" title="Discord">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="6" width="20" height="12" rx="4" /><path d="m14 12-2 2-2-2" /><circle cx="8" cy="11" r="1" /><circle cx="16" cy="11" r="1" />
              </svg>
            </div>
            {/* <div className="tactile-app-tile" title="Linear">
              <span className="app-text-badge">Linear</span>
            </div> */}
            <div className="tactile-app-tile" title="GitLab">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 22 8.5 18 21 6 21 2 8.5 12 2" />
              </svg>
            </div>
            <div className="tactile-app-tile" title="Vercel">
              <span className="app-text-badge">▲</span>
            </div>
            <div className="tactile-app-tile" title="Webhooks">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
          </div>
        </section>

        {/* ── Section 5: Testimonials (Horizontal Infinite Scroll Marquee) ── */}
        <section className="landing-section scroll-reveal" id="testimonials">
          <div className="section-pill-tag">Testimonials</div>
          <h2 className="section-title-large">Engineers and teams are already using TESTO</h2>

          <div className="testimonials-horizontal-marquee">
            <div className="testimonials-marquee-track track-scroll-left">
              {/* Card 1 */}
              <div className="testi-card-quote">
                <p className="testi-quote-text">
                  &ldquo;TESTO caught 3 critical bugs before our v2 launch that our manual tests missed entirely. We now collaborate in real-time and always meet release deadlines.&rdquo;
                </p>
                <div className="testi-author-row">
                  <div className="testi-avatar-cube av-1">SC</div>
                  <div>
                    <strong>Sarah Chen</strong>
                    <span>VP of Engineering</span>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="testi-card-quote">
                <p className="testi-quote-text">
                  &ldquo;An essential tool for any development team looking to automate regression testing without writing boilerplate.&rdquo;
                </p>
                <div className="testi-author-row">
                  <div className="testi-avatar-cube av-2">MR</div>
                  <div>
                    <strong>Marcus Rivera</strong>
                    <span>Lead DevOps Architect</span>
                  </div>
                </div>
              </div>

              {/* Card 3 - Video Review */}
              <div className="testi-card-video">
                <div className="video-card-bg">
                  <div className="video-overlay-tint" />
                  <div className="video-play-badge">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <div className="video-pill-tag">Watch video review</div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="testi-card-quote">
                <p className="testi-quote-text">
                  &ldquo;The built-in cloud analytics and video playback give our entire team complete confidence before merging code.&rdquo;
                </p>
                <div className="testi-author-row">
                  <div className="testi-avatar-cube av-3">AP</div>
                  <div>
                    <strong>Aisha Patel</strong>
                    <span>Senior QA Engineer</span>
                  </div>
                </div>
              </div>

              {/* Card 5 */}
              <div className="testi-card-quote">
                <p className="testi-quote-text">
                  &ldquo;I love how easy it is to link repositories and see full Playwright scripts generated directly from our codebase.&rdquo;
                </p>
                <div className="testi-author-row">
                  <div className="testi-avatar-cube av-4">DT</div>
                  <div>
                    <strong>Daniela Torres</strong>
                    <span>Engineering Manager</span>
                  </div>
                </div>
              </div>

              {/* Card 6 */}
              <div className="testi-card-quote">
                <p className="testi-quote-text">
                  &ldquo;The time-to-test dropped by 80%. Automated PR reviews run on every branch without slowing down the CI pipeline.&rdquo;
                </p>
                <div className="testi-author-row">
                  <div className="testi-avatar-cube av-2">AM</div>
                  <div>
                    <strong>Alex Mercer</strong>
                    <span>Staff QA Engineer</span>
                  </div>
                </div>
              </div>

              {/* Duplicate Set for Seamless Infinite Horizontal Loop */}
              <div className="testi-card-quote" aria-hidden="true">
                <p className="testi-quote-text">
                  &ldquo;TESTO caught 3 critical bugs before our v2 launch that our manual tests missed entirely. We now collaborate in real-time and always meet release deadlines.&rdquo;
                </p>
                <div className="testi-author-row">
                  <div className="testi-avatar-cube av-1">SC</div>
                  <div>
                    <strong>Sarah Chen</strong>
                    <span>VP of Engineering</span>
                  </div>
                </div>
              </div>

              <div className="testi-card-quote" aria-hidden="true">
                <p className="testi-quote-text">
                  &ldquo;An essential tool for any development team looking to automate regression testing without writing boilerplate.&rdquo;
                </p>
                <div className="testi-author-row">
                  <div className="testi-avatar-cube av-2">MR</div>
                  <div>
                    <strong>Marcus Rivera</strong>
                    <span>Lead DevOps Architect</span>
                  </div>
                </div>
              </div>

              {/* <div className="testi-card-video" aria-hidden="true">
                <div className="video-card-bg">
                  <div className="video-overlay-tint" />
                  <div className="video-play-badge">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <div className="video-pill-tag">Watch video review</div>
                </div>
              </div> */}

              <div className="testi-card-quote" aria-hidden="true">
                <p className="testi-quote-text">
                  &ldquo;The built-in cloud analytics and video playback give our entire team complete confidence before merging code.&rdquo;
                </p>
                <div className="testi-author-row">
                  <div className="testi-avatar-cube av-3">AP</div>
                  <div>
                    <strong>Aisha Patel</strong>
                    <span>Senior QA Engineer</span>
                  </div>
                </div>
              </div>

              <div className="testi-card-quote" aria-hidden="true">
                <p className="testi-quote-text">
                  &ldquo;I love how easy it is to link repositories and see full Playwright scripts generated directly from our codebase.&rdquo;
                </p>
                <div className="testi-author-row">
                  <div className="testi-avatar-cube av-4">DT</div>
                  <div>
                    <strong>Daniela Torres</strong>
                    <span>Engineering Manager</span>
                  </div>
                </div>
              </div>

              <div className="testi-card-quote" aria-hidden="true">
                <p className="testi-quote-text">
                  &ldquo;The time-to-test dropped by 80%. Automated PR reviews run on every branch without slowing down the CI pipeline.&rdquo;
                </p>
                <div className="testi-author-row">
                  <div className="testi-avatar-cube av-2">AM</div>
                  <div>
                    <strong>Alex Mercer</strong>
                    <span>Staff QA Engineer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 6: Footer Banner & Tactile 3D Tiles ─────────── */}
        <footer className="footer-canvas-card scroll-reveal">
          <div className="footer-canvas-top">
            <div className="footer-brand-col">
              <div className="footer-brand">
                <span className="brand-dot-grid">
                  <span className="dot dot-dark" />
                  <span className="dot dot-dark" />
                  <span className="dot dot-dark" />
                  <span className="dot dot-dark" />
                </span>
                <strong>TESTO</strong>
              </div>
              <h2 className="footer-cta-title">
                Stay organized and<br />boost your test confidence
              </h2>
            </div>

            <div className="footer-links-grid">
              <div className="footer-link-col">
                <a href="#solutions">→ About Us</a>
                <a href="#features">→ Features</a>
                <Link href="/review">→ PR Review</Link>
                <Link href="/history">→ History</Link>
              </div>
              <div className="footer-link-col">
                <a href="#integrations">→ Product</a>
                <a href="#solutions">→ Solutions</a>
                <a href="#integrations">→ Integrations</a>
                <a href="#testimonials">→ Testimonials</a>
              </div>
            </div>
          </div>

          {/* Scattered Tactile 3D Tiles (Monochrome with Subtle Float) */}
          <div className="footer-scattered-tiles" aria-hidden="true">
            <div className="scatter-tile float-scatter-1" title="Feedback">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="scatter-tile font-num float-scatter-2">20</div>
            <div className="scatter-tile float-scatter-3" title="Completed">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="scatter-tile float-scatter-1" title="Pipeline">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <div className="scatter-tile float-scatter-2" title="Clock">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="scatter-tile float-scatter-3" title="Timer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 22h14" /><path d="M5 2h14" /><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" /><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
              </svg>
            </div>
            <div className="scatter-tile float-scatter-1" title="Calendar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="scatter-tile float-scatter-2" title="Speed">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="14" r="8" /><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="10" x2="12" y2="14" />
              </svg>
            </div>
            <div className="scatter-tile float-scatter-3" title="Intelligence">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
              </svg>
            </div>
            <div className="scatter-tile float-scatter-1" title="Forward">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" />
              </svg>
            </div>
          </div>

          <div className="footer-canvas-bottom">
            <span>&copy; 2026 TESTO. All rights reserved.</span>
            <div className="footer-legal-links">
              <Link href="/review">Privacy Policy</Link>
              <Link href="/review">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
