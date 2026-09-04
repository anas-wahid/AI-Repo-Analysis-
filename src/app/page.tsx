"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ── Animated Counter ──────────────────────────────────────── */
function AnimatedCounter({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const step = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Scroll Reveal Hook ───────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ── Particle Canvas ──────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; hue: number }[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
        hue: Math.random() * 60 + 230,
      });
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas!.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas!.height) p.vy *= -1;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${p.hue}, 70%, 60%, ${p.opacity})`;
        ctx!.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `hsla(240, 60%, 60%, ${0.06 * (1 - dist / 120)})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
}

/* ── Typing Effect ────────────────────────────────────────── */
function TypingEffect({ texts, speed = 80, pause = 2000 }: { texts: string[]; speed?: number; pause?: number }) {
  const [display, setDisplay] = useState("");
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplay(current.slice(0, charIdx + 1));
        setCharIdx(charIdx + 1);
        if (charIdx + 1 === current.length) {
          setTimeout(() => setDeleting(true), pause);
        }
      } else {
        setDisplay(current.slice(0, charIdx - 1));
        setCharIdx(charIdx - 1);
        if (charIdx - 1 === 0) {
          setDeleting(false);
          setTextIdx((textIdx + 1) % texts.length);
        }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, textIdx, texts, speed, pause]);

  return (
    <span className="typing-text">
      {display}
      <span className="typing-cursor">|</span>
    </span>
  );
}

/* ── Robot SVG ────────────────────────────────────────────── */
function RobotIllustration() {
  return (
    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="robot-svg">
      <defs>
        <radialGradient id="glow1" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="transparent" /></radialGradient>
        <radialGradient id="glow2" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="transparent" /></radialGradient>
        <linearGradient id="bodyG" x1="130" y1="160" x2="270" y2="280"><stop offset="0%" stopColor="#e2e8f0" /><stop offset="100%" stopColor="#cbd5e1" /></linearGradient>
        <linearGradient id="headG" x1="145" y1="80" x2="255" y2="170"><stop offset="0%" stopColor="#f1f5f9" /><stop offset="100%" stopColor="#e2e8f0" /></linearGradient>
        <linearGradient id="strG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#94a3b8" /><stop offset="100%" stopColor="#64748b" /></linearGradient>
        <linearGradient id="eyeG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient>
        <linearGradient id="antG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#a78bfa" /></linearGradient>
        <linearGradient id="armG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#e2e8f0" /><stop offset="100%" stopColor="#cbd5e1" /></linearGradient>
        <linearGradient id="handG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f1f5f9" /><stop offset="100%" stopColor="#e2e8f0" /></linearGradient>
        <linearGradient id="legG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#cbd5e1" /><stop offset="100%" stopColor="#94a3b8" /></linearGradient>
        <linearGradient id="footG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#94a3b8" /><stop offset="100%" stopColor="#64748b" /></linearGradient>
        <filter id="robotShadow"><feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#6366f1" floodOpacity="0.25" /></filter>
      </defs>
      <circle cx="200" cy="200" r="160" fill="url(#glow1)" opacity="0.12" />
      <circle cx="200" cy="200" r="120" fill="url(#glow2)" opacity="0.08" />
      <g filter="url(#robotShadow)">
        <rect x="130" y="160" width="140" height="120" rx="20" fill="url(#bodyG)" stroke="url(#strG)" strokeWidth="2" />
        <rect x="145" y="80" width="110" height="90" rx="18" fill="url(#headG)" stroke="url(#strG)" strokeWidth="2" />
        <line x1="200" y1="80" x2="200" y2="55" stroke="url(#strG)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="200" cy="48" r="8" fill="url(#antG)" stroke="url(#strG)" strokeWidth="2">
          <animate attributeName="r" values="8;11;8" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="175" cy="115" r="12" fill="#0f172a" />
        <circle cx="225" cy="115" r="12" fill="#0f172a" />
        <circle cx="175" cy="115" r="8" fill="url(#eyeG)"><animate attributeName="cx" values="175;179;175;171;175" dur="4s" repeatCount="indefinite" /></circle>
        <circle cx="225" cy="115" r="8" fill="url(#eyeG)"><animate attributeName="cx" values="225;229;225;221;225" dur="4s" repeatCount="indefinite" /></circle>
        <circle cx="178" cy="112" r="3" fill="white" opacity="0.8" />
        <circle cx="228" cy="112" r="3" fill="white" opacity="0.8" />
        <path d="M185 138 Q200 150 215 138" stroke="url(#strG)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <rect x="125" y="105" width="12" height="30" rx="6" fill="url(#armG)" stroke="url(#strG)" strokeWidth="1.5" />
        <rect x="263" y="105" width="12" height="30" rx="6" fill="url(#armG)" stroke="url(#strG)" strokeWidth="1.5" />
        <rect x="155" y="180" width="90" height="50" rx="10" fill="#0f172a" opacity="0.6" />
        <rect x="165" y="190" width="30" height="8" rx="4" fill="#22c55e" opacity="0.8"><animate attributeName="width" values="30;55;30" dur="3s" repeatCount="indefinite" /></rect>
        <rect x="165" y="204" width="50" height="8" rx="4" fill="#60a5fa" opacity="0.8"><animate attributeName="width" values="50;30;50" dur="2.5s" repeatCount="indefinite" /></rect>
        <rect x="165" y="218" width="40" height="8" rx="4" fill="#a78bfa" opacity="0.8"><animate attributeName="width" values="40;60;40" dur="3.5s" repeatCount="indefinite" /></rect>
        <rect x="100" y="185" width="22" height="60" rx="11" fill="url(#armG)" stroke="url(#strG)" strokeWidth="1.5" />
        <rect x="278" y="185" width="22" height="60" rx="11" fill="url(#armG)" stroke="url(#strG)" strokeWidth="1.5" />
        <circle cx="111" cy="255" r="14" fill="url(#handG)" stroke="url(#strG)" strokeWidth="1.5" />
        <circle cx="289" cy="255" r="14" fill="url(#handG)" stroke="url(#strG)" strokeWidth="1.5" />
        <rect x="155" y="285" width="22" height="50" rx="11" fill="url(#legG)" stroke="url(#strG)" strokeWidth="1.5" />
        <rect x="223" y="285" width="22" height="50" rx="11" fill="url(#legG)" stroke="url(#strG)" strokeWidth="1.5" />
        <rect x="145" y="330" width="42" height="16" rx="8" fill="url(#footG)" stroke="url(#strG)" strokeWidth="1.5" />
        <rect x="213" y="330" width="42" height="16" rx="8" fill="url(#footG)" stroke="url(#strG)" strokeWidth="1.5" />
      </g>
      {[
        { cx: 75, cy: 120, r: 3, fill: "#a78bfa", delay: "0s", dur: "3s" },
        { cx: 325, cy: 100, r: 2, fill: "#60a5fa", delay: "0.5s", dur: "4s" },
        { cx: 85, cy: 280, r: 2.5, fill: "#22c55e", delay: "1s", dur: "3.5s" },
        { cx: 315, cy: 300, r: 2, fill: "#f59e0b", delay: "1.5s", dur: "2.8s" },
        { cx: 55, cy: 200, r: 1.5, fill: "#ec4899", delay: "0.3s", dur: "3.2s" },
        { cx: 345, cy: 200, r: 1.5, fill: "#8b5cf6", delay: "0.8s", dur: "2.7s" },
        { cx: 100, cy: 350, r: 1.5, fill: "#06b6d4", delay: "1.2s", dur: "3.8s" },
        { cx: 300, cy: 50, r: 2, fill: "#f43f5e", delay: "0.6s", dur: "3.1s" },
      ].map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={p.fill} opacity="0.5">
          <animate attributeName="cy" values={`${p.cy};${p.cy - 18};${p.cy}`} dur={p.dur} begin={p.delay} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.15;0.5" dur={p.dur} begin={p.delay} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

/* ── Code Demo ────────────────────────────────────────────── */
const codeLines = [
  { indent: 0, text: "import", color: "#c678dd" },
  { indent: 0, text: " { test, expect } ", color: "#e06c75" },
  { indent: 0, text: "from", color: "#c678dd" },
  { indent: 0, text: " '@playwright/test'", color: "#98c379" },
  { indent: 0, text: ";", color: "#abb2bf" },
  { indent: 0, text: "", color: "" },
  { indent: 0, text: "test", color: "#61afef" },
  { indent: 0, text: "(", color: "#abb2bf" },
  { indent: 0, text: "'homepage loads correctly'", color: "#98c379" },
  { indent: 0, text: ",", color: "#abb2bf" },
  { indent: 0, text: " async", color: "#c678dd" },
  { indent: 0, text: " ({ page }) ", color: "#e06c75" },
  { indent: 0, text: "=>", color: "#56b6c2" },
  { indent: 0, text: " {", color: "#abb2bf" },
  { indent: 1, text: "await", color: "#c678dd" },
  { indent: 1, text: " page.", color: "#abb2bf" },
  { indent: 1, text: "goto", color: "#61afef" },
  { indent: 1, text: "(", color: "#abb2bf" },
  { indent: 1, text: "'https://example.com'", color: "#98c379" },
  { indent: 1, text: ");", color: "#abb2bf" },
  { indent: 1, text: "", color: "" },
  { indent: 1, text: "await", color: "#c678dd" },
  { indent: 1, text: " expect", color: "#e5c07b" },
  { indent: 1, text: "(page).", color: "#abb2bf" },
  { indent: 1, text: "toHaveTitle", color: "#61afef" },
  { indent: 1, text: "(", color: "#abb2bf" },
  { indent: 1, text: "'My App'", color: "#98c379" },
  { indent: 1, text: ");", color: "#abb2bf" },
  { indent: 1, text: "", color: "" },
  { indent: 1, text: "await", color: "#c678dd" },
  { indent: 1, text: " expect", color: "#e5c07b" },
  { indent: 1, text: "(page.locator(", color: "#abb2bf" },
  { indent: 1, text: "'h1'", color: "#98c379" },
  { indent: 1, text: ")).", color: "#abb2bf" },
  { indent: 1, text: "toBeVisible", color: "#61afef" },
  { indent: 1, text: "();", color: "#abb2bf" },
  { indent: 0, text: "});", color: "#abb2bf" },
];

/* ── Data ─────────────────────────────────────────────────── */
const features = [
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" /><circle cx="9" cy="15" r="1" fill="currentColor" /><circle cx="15" cy="15" r="1" fill="currentColor" /></svg>, title: "AI-Powered Analysis", desc: "Scans your entire codebase with LLM intelligence to understand architecture, patterns, and critical user flows." },
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>, title: "Smart Test Generation", desc: "Generates comprehensive Playwright test cases from natural language descriptions or code analysis." },
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect width="18" height="12" x="3" y="4" rx="2" /><line x1="2" y1="20" x2="22" y2="20" /><circle cx="12" cy="10" r="2" /></svg>, title: "Cloud Browser Testing", desc: "Runs tests on Browserbase cloud browsers with full video recording, screenshots, and session replay." },
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>, title: "Error Root Cause Analysis", desc: "AI analyzes test failures, identifies root causes, and suggests fixes with confidence scoring." },
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>, title: "GitHub Integration", desc: "Connects via OAuth. Auto-triggers tests on PRs, commits, and webhooks. Posts results as PR comments." },
  { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" /></svg>, title: "Serverless Database", desc: "Neon Postgres stores test history, analytics, and run metadata. Drizzle ORM for type-safe queries." },
];

const steps = [
  { num: "01", title: "Connect GitHub", desc: "One-click OAuth to link your repositories" },
  { num: "02", title: "AI Scans Code", desc: "LLM analyzes structure, routes, and patterns" },
  { num: "03", title: "Tests Generated", desc: "Playwright scripts created automatically" },
  { num: "04", title: "Run & Review", desc: "Cloud execution with AI error analysis" },
];

const testimonials = [
  { name: "Sarah Chen", role: "CTO at TechFlow", text: "TESTO caught 3 critical bugs before our v2 launch that our manual tests missed entirely. The AI analysis is scarily accurate.", avatar: "SC" },
  { name: "Marcus Rivera", role: "Lead Developer at Stackify", text: "We went from 2 hours of manual testing to 5 minutes of automated runs. The natural language test creation is a game changer.", avatar: "MR" },
  { name: "Aisha Patel", role: "QA Engineer at CloudBase", text: "The error root cause analysis saved us hours of debugging. It pinpointed the exact issue in our auth flow.", avatar: "AP" },
];

/* ── Main Component ───────────────────────────────────────── */
export default function Home() {
  const f1 = useReveal();
  const f2 = useReveal();
  const f3 = useReveal();
  const f4 = useReveal();

  return (
    <div className="landing">
      <ParticleCanvas />

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge reveal" ref={f1}>
          <span className="status-dot success" />
          AI-Powered Test Automation
        </div>
        <h1 className="hero-title reveal" ref={f2}>
          Ship bug-free code
          <br />
          <span className="hero-highlight">
            <TypingEffect texts={["with AI testing agents.", "with zero manual tests.", "with confidence.", "at lightning speed."]} />
          </span>
        </h1>
        <p className="hero-sub reveal" ref={f3}>
          TESTO connects to your GitHub repos, analyzes code with LLMs, generates
          Playwright tests, and runs them in cloud browsers — automatically.
        </p>
        <div className="hero-actions reveal" ref={f4}>
          <Link href="/review" className="btn btn-gradient btn-lg">
            Start Testing Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="btn btn-outline btn-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
            Star on GitHub
          </a>
        </div>

        {/* Robot + Stats */}
        <div className="hero-visual">
          <div className="hero-robot">
            <RobotIllustration />
          </div>
          <div className="hero-stats-float">
            <div className="hero-stat-card">
              <span className="hero-stat-value"><AnimatedCounter end={10} suffix="x" /></span>
              <span className="hero-stat-label">Faster test creation</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-value"><AnimatedCounter end={95} suffix="%" /></span>
              <span className="hero-stat-label">Bug detection rate</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-value"><AnimatedCounter end={50} suffix="+" /></span>
              <span className="hero-stat-label">Languages supported</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-value">24/7</span>
              <span className="hero-stat-label">Cloud execution</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="section-label reveal" ref={useReveal()}>Workflow</div>
        <h2 className="section-title reveal" ref={useReveal()}>From repo to results in seconds</h2>
        <p className="section-desc reveal" ref={useReveal()}>Zero manual test writing. The AI handles everything.</p>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div key={s.num} className="step-card reveal" ref={useReveal()} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="step-num-badge">{s.num}</div>
              {i < steps.length - 1 && <div className="step-connector" />}
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="section-label reveal" ref={useReveal()}>Capabilities</div>
        <h2 className="section-title reveal" ref={useReveal()}>Everything you need to test</h2>
        <p className="section-desc reveal" ref={useReveal()}>A complete AI-powered testing pipeline.</p>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={f.title} className="feature-card reveal" ref={useReveal()} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Code Demo */}
      <section className="section">
        <div className="section-label reveal" ref={useReveal()}>Output</div>
        <h2 className="section-title reveal" ref={useReveal()}>AI-generated test code</h2>
        <p className="section-desc reveal" ref={useReveal()}>Clean, readable Playwright scripts ready to run.</p>
        <div className="code-demo reveal" ref={useReveal()}>
          <div className="code-window">
            <div className="code-window-header">
              <div className="code-window-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <span className="code-window-title">homepage.spec.ts</span>
              <span className="code-window-badge">AI Generated</span>
            </div>
            <div className="code-window-body">
              <code>
                {codeLines.map((line, i) => (
                  <div key={i} className="code-line" style={{ paddingLeft: line.indent * 20 }}>
                    <span className="line-num">{i + 1}</span>
                    <span style={{ color: line.color }}>{line.text}</span>
                  </div>
                ))}
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="section-label reveal" ref={useReveal()}>Trusted by</div>
        <h2 className="section-title reveal" ref={useReveal()}>Loved by developers</h2>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={t.name} className="testimonial-card reveal" ref={useReveal()} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.avatar}</div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* App Preview */}
      <section className="section">
        <div className="section-label reveal" ref={useReveal()}>Interface</div>
        <h2 className="section-title reveal" ref={useReveal()}>Built for developers</h2>
        <div className="hero-preview reveal" ref={useReveal()}>
          <div className="preview-browser">
            <div className="preview-dots"><span /><span /><span /></div>
            <div className="preview-url">localhost:3000/review</div>
          </div>
          <div className="preview-content">
            <div className="preview-sidebar-mock">
              <div className="mock-brand">TESTO</div>
              <div className="mock-nav-row active">PR Review</div>
              <div className="mock-nav-row">Projects</div>
              <div className="mock-nav-row">History</div>
              <div className="mock-nav-row">Settings</div>
            </div>
            <div className="preview-main-mock">
              <div className="mock-header">
                <div className="mock-title">PR Review</div>
                <div className="mock-btn">Run</div>
              </div>
              <div className="mock-connection-card">
                <div className="mock-conn-icon">GH</div>
                <div className="mock-conn-info"><strong>GitHub</strong><span>Connected as @anas-wahid</span></div>
                <span className="mock-status-badge green">Connected</span>
              </div>
              <div className="mock-connection-card">
                <div className="mock-conn-icon">📁</div>
                <div className="mock-conn-info"><strong>Select Repository</strong><span>Pick from your repos</span></div>
                <span className="mock-status-badge gray">None selected</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-glow" />
        <h2 className="cta-title reveal" ref={useReveal()}>Ready to ship with confidence?</h2>
        <p className="cta-desc reveal" ref={useReveal()}>Join developers who trust TESTO to catch bugs before their users do.</p>
        <Link href="/review" className="btn btn-gradient btn-lg reveal" ref={useReveal()}>
          Get Started Free
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
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
