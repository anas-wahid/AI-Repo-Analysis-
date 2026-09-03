"use client";

import Link from "next/link";

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
        <circle cx="9" cy="15" r="1" fill="currentColor" />
        <circle cx="15" cy="15" r="1" fill="currentColor" />
      </svg>
    ),
    title: "AI-Powered Analysis",
    desc: "Scans your entire codebase with LLM intelligence to understand architecture, patterns, and critical paths.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
    title: "Smart Test Generation",
    desc: "Generates comprehensive Playwright test cases from natural language descriptions or code analysis.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="12" x="3" y="4" rx="2" />
        <line x1="2" y1="20" x2="22" y2="20" />
        <circle cx="12" cy="10" r="2" />
      </svg>
    ),
    title: "Cloud Browser Testing",
    desc: "Runs tests on Browserbase cloud browsers with full video recording, screenshots, and session replay.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: "Error Root Cause Analysis",
    desc: "AI analyzes test failures, identifies root causes, and suggests fixes with confidence scoring.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    ),
    title: "GitHub Integration",
    desc: "Connects via OAuth. Auto-triggers tests on PRs, commits, and webhooks. Posts results as PR comments.",
    gradient: "from-slate-700 to-slate-900",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
      </svg>
    ),
    title: "Serverless Database",
    desc: "Neon Postgres stores test history, analytics, and run metadata. Drizzle ORM for type-safe queries.",
    gradient: "from-indigo-500 to-violet-500",
  },
];

const stats = [
  { value: "10x", label: "Faster test creation" },
  { value: "95%", label: "Bug detection rate" },
  { value: "50+", label: "Languages supported" },
  { value: "24/7", label: "Cloud execution" },
];

const steps = [
  { num: "01", title: "Connect GitHub", desc: "One-click OAuth to link your repositories" },
  { num: "02", title: "AI Scans Code", desc: "LLM analyzes structure, routes, and patterns" },
  { num: "03", title: "Tests Generated", desc: "Playwright scripts created automatically" },
  { num: "04", title: "Run & Review", desc: "Cloud execution with AI error analysis" },
];

function RobotIllustration() {
  return (
    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="robot-svg">
      {/* Glow background */}
      <circle cx="200" cy="200" r="160" fill="url(#robotGlow)" opacity="0.15" />
      <circle cx="200" cy="200" r="120" fill="url(#robotGlow2)" opacity="0.1" />

      {/* Robot body */}
      <rect x="130" y="160" width="140" height="120" rx="20" fill="url(#bodyGrad)" stroke="url(#strokeGrad)" strokeWidth="2" />

      {/* Robot head */}
      <rect x="145" y="80" width="110" height="90" rx="18" fill="url(#headGrad)" stroke="url(#strokeGrad)" strokeWidth="2" />

      {/* Antenna */}
      <line x1="200" y1="80" x2="200" y2="55" stroke="url(#strokeGrad)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="200" cy="48" r="8" fill="url(#antennaGrad)" stroke="url(#strokeGrad)" strokeWidth="2">
        <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Eyes */}
      <circle cx="175" cy="115" r="12" fill="#0f172a" />
      <circle cx="225" cy="115" r="12" fill="#0f172a" />
      <circle cx="175" cy="115" r="8" fill="url(#eyeGrad)">
        <animate attributeName="cx" values="175;178;175;172;175" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="225" cy="115" r="8" fill="url(#eyeGrad)">
        <animate attributeName="cx" values="225;228;225;222;225" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="178" cy="112" r="3" fill="white" opacity="0.8" />
      <circle cx="228" cy="112" r="3" fill="white" opacity="0.8" />

      {/* Mouth */}
      <path d="M185 138 Q200 148 215 138" stroke="url(#strokeGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Ears */}
      <rect x="125" y="105" width="12" height="30" rx="6" fill="url(#earGrad)" stroke="url(#strokeGrad)" strokeWidth="1.5" />
      <rect x="263" y="105" width="12" height="30" rx="6" fill="url(#earGrad)" stroke="url(#strokeGrad)" strokeWidth="1.5" />

      {/* Chest panel */}
      <rect x="155" y="180" width="90" height="50" rx="10" fill="#0f172a" opacity="0.6" />
      <rect x="165" y="190" width="30" height="8" rx="4" fill="#22c55e" opacity="0.8">
        <animate attributeName="width" values="30;50;30" dur="3s" repeatCount="indefinite" />
      </rect>
      <rect x="165" y="204" width="50" height="8" rx="4" fill="#60a5fa" opacity="0.8">
        <animate attributeName="width" values="50;35;50" dur="2.5s" repeatCount="indefinite" />
      </rect>
      <rect x="165" y="218" width="40" height="8" rx="4" fill="#a78bfa" opacity="0.8">
        <animate attributeName="width" values="40;55;40" dur="3.5s" repeatCount="indefinite" />
      </rect>

      {/* Arms */}
      <rect x="100" y="185" width="22" height="60" rx="11" fill="url(#armGrad)" stroke="url(#strokeGrad)" strokeWidth="1.5" />
      <rect x="278" y="185" width="22" height="60" rx="11" fill="url(#armGrad)" stroke="url(#strokeGrad)" strokeWidth="1.5" />

      {/* Hands */}
      <circle cx="111" cy="255" r="14" fill="url(#handGrad)" stroke="url(#strokeGrad)" strokeWidth="1.5" />
      <circle cx="289" cy="255" r="14" fill="url(#handGrad)" stroke="url(#strokeGrad)" strokeWidth="1.5" />

      {/* Legs */}
      <rect x="155" y="285" width="22" height="50" rx="11" fill="url(#legGrad)" stroke="url(#strokeGrad)" strokeWidth="1.5" />
      <rect x="223" y="285" width="22" height="50" rx="11" fill="url(#legGrad)" stroke="url(#strokeGrad)" strokeWidth="1.5" />

      {/* Feet */}
      <rect x="145" y="330" width="42" height="16" rx="8" fill="url(#footGrad)" stroke="url(#strokeGrad)" strokeWidth="1.5" />
      <rect x="213" y="330" width="42" height="16" rx="8" fill="url(#footGrad)" stroke="url(#strokeGrad)" strokeWidth="1.5" />

      {/* Floating particles */}
      <circle cx="80" cy="120" r="3" fill="#a78bfa" opacity="0.6">
        <animate attributeName="cy" values="120;100;120" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="320" cy="100" r="2" fill="#60a5fa" opacity="0.5">
        <animate attributeName="cy" values="100;120;100" dur="4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.2;0.5" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="90" cy="280" r="2.5" fill="#22c55e" opacity="0.5">
        <animate attributeName="cy" values="280;265;280" dur="3.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="310" cy="300" r="2" fill="#f59e0b" opacity="0.5">
        <animate attributeName="cy" values="300;285;300" dur="2.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="60" cy="200" r="1.5" fill="#ec4899" opacity="0.4">
        <animate attributeName="cy" values="200;185;200" dur="3.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="340" cy="200" r="1.5" fill="#8b5cf6" opacity="0.4">
        <animate attributeName="cy" values="200;215;200" dur="2.7s" repeatCount="indefinite" />
      </circle>

      {/* Gradient definitions */}
      <defs>
        <radialGradient id="robotGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="robotGlow2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="bodyGrad" x1="130" y1="160" x2="270" y2="280">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="headGrad" x1="145" y1="80" x2="255" y2="170">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id="strokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="eyeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="antennaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="earGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="armGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="handGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id="legGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id="footGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Home() {
  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">
          <span className="status-dot success" />
          AI-Powered Test Automation
        </div>
        <h1 className="hero-title">
          Ship bug-free code
          <br />
          <span className="hero-highlight">with AI testing agents.</span>
        </h1>
        <p className="hero-sub">
          TESTO connects to your GitHub repos, analyzes code with LLMs, generates
          Playwright tests, and runs them in cloud browsers — automatically.
        </p>
        <div className="hero-actions">
          <Link href="/review" className="btn btn-gradient btn-lg">
            Start Testing Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="btn btn-outline btn-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            Star on GitHub
          </a>
        </div>

        {/* Robot + Stats Hero */}
        <div className="hero-visual">
          <div className="hero-robot">
            <RobotIllustration />
          </div>
          <div className="hero-stats-float">
            {stats.map((s) => (
              <div key={s.label} className="hero-stat-card">
                <span className="hero-stat-value">{s.value}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="section-label">Workflow</div>
        <h2 className="section-title">From repo to results in seconds</h2>
        <p className="section-desc">
          Zero manual test writing. The AI handles everything from analysis to execution.
        </p>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div key={s.num} className="step-card">
              <div className="step-num-badge">{s.num}</div>
              <div className="step-connector" style={{ display: i < steps.length - 1 ? "block" : "none" }} />
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
          A complete AI-powered testing pipeline built for modern development.
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

      {/* App Preview */}
      <section className="section">
        <div className="section-label">Interface</div>
        <h2 className="section-title">Built for developers</h2>
        <p className="section-desc">
          Clean, fast, and intuitive. See your tests come to life.
        </p>
        <div className="hero-preview">
          <div className="preview-browser">
            <div className="preview-dots">
              <span />
              <span />
              <span />
            </div>
            <div className="preview-url">localhost:3000/review</div>
          </div>
          <div className="preview-content">
            <div className="preview-sidebar-mock">
              <div className="mock-brand">TESTO</div>
              <div className="mock-nav-row active">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                PR Review
              </div>
              <div className="mock-nav-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                Projects
              </div>
              <div className="mock-nav-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                History
              </div>
              <div className="mock-nav-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4" /></svg>
                Settings
              </div>
            </div>
            <div className="preview-main-mock">
              <div className="mock-header">
                <div className="mock-title">PR Review</div>
                <div className="mock-btn-row">
                  <span className="mock-pill">GitHub</span>
                  <span className="mock-pill muted">GitLab</span>
                </div>
              </div>
              <div className="mock-connection-card">
                <div className="mock-conn-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                </div>
                <div className="mock-conn-info">
                  <strong>GitHub</strong>
                  <span>Connected as @anas-wahid</span>
                </div>
                <span className="mock-status-badge green">Connected</span>
              </div>
              <div className="mock-connection-card">
                <div className="mock-conn-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                </div>
                <div className="mock-conn-info">
                  <strong>Select Repository</strong>
                  <span>Pick from your repos or enter URL</span>
                </div>
                <span className="mock-status-badge gray">None selected</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-glow" />
        <h2 className="cta-title">Ready to ship with confidence?</h2>
        <p className="cta-desc">
          Join developers who trust TESTO to catch bugs before their users do.
        </p>
        <Link href="/review" className="btn btn-gradient btn-lg">
          Get Started Free
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
            <Link href="/review">PR Review</Link>
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
