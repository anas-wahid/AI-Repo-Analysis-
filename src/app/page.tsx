"use client";

import Link from "next/link";

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: "AI-Powered Test Generation",
    desc: "Automatically generate test cases from your repository using advanced AI analysis of code structure and patterns.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 18l6-6-6-6" />
        <path d="M8 6l-6 6 6 6" />
      </svg>
    ),
    title: "Playwright Browser Testing",
    desc: "Run end-to-end tests in real browsers powered by Playwright, with full screenshot capture and video recording.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Browserbase Cloud",
    desc: "Execute tests on scalable cloud browser infrastructure — no local setup required. Faster, more reliable results.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    ),
    title: "GitHub Integration",
    desc: "Seamlessly connect with GitHub repos. Automatic test triggers on PRs, webhooks, and commit events.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
      </svg>
    ),
    title: "Neon Postgres Database",
    desc: "Serverless Postgres for storing test results, history, and analytics with Drizzle ORM for type-safe queries.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: "Custom Test Prompts",
    desc: "Write tests in plain English. Describe what you want to test and the AI translates it into executable Playwright scripts.",
  },
];

const steps = [
  {
    num: "01",
    title: "Connect GitHub",
    desc: "Link your GitHub account and select the repository you want to test.",
  },
  {
    num: "02",
    title: "Analyze Codebase",
    desc: "AI scans your code to understand structure, routes, and critical user flows.",
  },
  {
    num: "03",
    title: "Generate Tests",
    desc: "Receive comprehensive test cases tailored to your application's behavior.",
  },
  {
    num: "04",
    title: "Run & Review",
    desc: "Execute tests in cloud browsers and get detailed results with AI error analysis.",
  },
];

const techStack = [
  { name: "Next.js", icon: "N" },
  { name: "TypeScript", icon: "TS" },
  { name: "Playwright", icon: "PW" },
  { name: "Browserbase", icon: "BB" },
  { name: "Neon", icon: "N" },
  { name: "Drizzle", icon: "D" },
  { name: "GitHub", icon: "GH" },
];

export default function Home() {
  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">
          <span className="status-dot success" />
          Open-source test automation
        </div>
        <h1 className="hero-title">
          Ship with confidence.
          <br />
          <span className="hero-highlight">AI tests your app automatically.</span>
        </h1>
        <p className="hero-sub">
          Connect a GitHub repo, and the AI agent generates, runs, and analyzes
          end-to-end tests for your application — using Playwright in real
          browsers via Browserbase.
        </p>
        <div className="hero-actions">
          <Link href="/projects" className="btn btn-gradient btn-lg">
            Get Started
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="btn btn-outline btn-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </div>

        {/* App Preview */}
        <div className="hero-preview">
          <div className="preview-browser">
            <div className="preview-dots">
              <span />
              <span />
              <span />
            </div>
            <div className="preview-url">localhost:3000/projects</div>
          </div>
          <div className="preview-content">
            {/* Sidebar */}
            <div className="preview-sidebar-mock">
              <div className="mock-brand">TESTO</div>
              <div className="mock-nav-row active">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                Overview
              </div>
              <div className="mock-nav-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                Repositories
              </div>
              <div className="mock-nav-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M6 21V9a9 9 0 0 0 9 9" /></svg>
                Pull Requests
              </div>
              <div className="mock-nav-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                Issues
              </div>
              <div className="mock-nav-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                Settings
              </div>
            </div>
            {/* Main Content */}
            <div className="preview-main-mock">
              <div className="mock-header">
                <div className="mock-title">Overview</div>
                <div className="mock-btn">New Project</div>
              </div>
              <p className="mock-subtitle">Tracking activity across your AI agent test repositories.</p>
              <div className="mock-stats">
                <div className="mock-stat-card">
                  <div className="mock-stat-icon">&lt;/&gt;</div>
                  <div>
                    <div className="mock-stat-label">Repositories</div>
                    <div className="mock-stat-value">3</div>
                    <div className="mock-stat-sub">Total repositories</div>
                  </div>
                </div>
                <div className="mock-stat-card">
                  <div className="mock-stat-icon">PR</div>
                  <div>
                    <div className="mock-stat-label">Pull Requests</div>
                    <div className="mock-stat-value">12</div>
                    <div className="mock-stat-sub">Open pull requests</div>
                  </div>
                </div>
                <div className="mock-stat-card">
                  <div className="mock-stat-icon">!</div>
                  <div>
                    <div className="mock-stat-label">Issues</div>
                    <div className="mock-stat-value">8</div>
                    <div className="mock-stat-sub">Open issues</div>
                  </div>
                </div>
              </div>
              <div className="mock-activity">
                <div className="mock-activity-title">Recent Activity</div>
                <div className="mock-activity-row">
                  <span className="mock-dot blue" />
                  <span>AI agent merged PR #12 in repo frontend</span>
                  <span className="mock-time">2m ago</span>
                </div>
                <div className="mock-activity-row">
                  <span className="mock-dot green" />
                  <span>AI agent closed issue #8 in repo backend</span>
                  <span className="mock-time">15m ago</span>
                </div>
                <div className="mock-activity-row">
                  <span className="mock-dot blue" />
                  <span>AI agent created PR #11 in repo api-service</span>
                  <span className="mock-time">1h ago</span>
                </div>
                <div className="mock-activity-row">
                  <span className="mock-dot orange" />
                  <span>AI agent opened issue #7 in repo frontend</span>
                  <span className="mock-time">3h ago</span>
                </div>
                <div className="mock-view-all">View all activity &rarr;</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="section-label">How it works</div>
        <h2 className="section-title">From repo to results in 4 steps</h2>
        <p className="section-desc">
          No manual test writing. The AI handles everything from analysis to execution.
        </p>
        <div className="steps-grid">
          {steps.map((s) => (
            <div key={s.num} className="step-card">
              <span className="step-num-badge">{s.num}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="section-label">Capabilities</div>
        <h2 className="section-title">Everything you need to test</h2>
        <p className="section-desc">
          A complete testing pipeline powered by AI and cloud infrastructure.
        </p>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="section">
        <div className="section-label">Built with</div>
        <h2 className="section-title">Modern tech stack</h2>
        <p className="section-desc">
          Industry-leading tools working together for reliable, scalable test automation.
        </p>
        <div className="tech-row">
          {techStack.map((t) => (
            <div key={t.name} className="tech-chip">
              <span className="tech-icon">{t.icon}</span>
              {t.name}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to automate your tests?</h2>
        <p className="cta-desc">
          Connect your first repo and let the AI agent write and run tests for you — in minutes, not hours.
        </p>
        <Link href="/projects" className="btn btn-gradient btn-lg">
          Start Testing Now
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <span className="footer-brand">TESTO</span>
          <div className="footer-links">
            <Link href="/projects">Projects</Link>
            <Link href="/history">History</Link>
            <Link href="/settings">Settings</Link>
          </div>
          <span className="footer-copy">AI Testing Automation Agent</span>
        </div>
      </footer>
    </div>
  );
}
