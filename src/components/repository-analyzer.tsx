"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { getCachedGitHubStatus } from "@/lib/github-status-cache";

/* ── Types ──────────────────────────────────────────────────── */

type SelectedFile = {
  path: string;
  language: string;
  sizeBytes: number;
  reason: string;
  contentPreview?: string;
};

type Analysis = {
  repository: {
    fullName: string;
    description: string | null;
    htmlUrl: string;
    selectedBranch: string;
  };
  tree: { filesScanned: number };
  stack: { detected: string[]; signals: string[] };
  selectedFiles: SelectedFile[];
};

type TestCase = {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  targetRoute: string;
  assertions: string[];
};

type GeneratedScript = {
  title: string;
  framework: "playwright";
  script: string;
  steps: unknown[];
};

type StepResult = {
  index: number;
  action: string;
  label: string;
  status: "passed" | "failed" | "skipped";
  durationMs: number;
  error?: string;
};

type AIErrorExplanation = {
  reason: string;
  possibleCauses: string[];
  confidence: number;
};

type RunResult = {
  status: string;
  summary: string;
  logs: string[];
  screenshotBase64?: string;
  failureScreenshotBase64?: string;
  videoBase64?: string;
  videoName?: string;
  sessionUrl?: string;
  durationMs?: number;
  stepResults?: StepResult[];
  aiErrorExplanation?: AIErrorExplanation;
};

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

type GHRepo = {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  description: string | null;
  defaultBranch: string;
  language: string | null;
};

type GHBranch = {
  name: string;
  protected: boolean;
};

type AIConversationTurn = {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: string;
};

type AIConversationMeta = {
  model: string;
  durationMs: number;
  endpoint: string;
  turns: AIConversationTurn[];
  isFallback: boolean;
};

type AIActivityEntry = {
  id: string;
  label: string;
  timestamp: string;
  conversation: AIConversationMeta;
};


/* ── Component ──────────────────────────────────────────────── */

export function RepositoryAnalyzer() {
  // Form state
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("");
  const [targetBaseUrl, setTargetBaseUrl] = useState("");

  // UI state
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set([0]));
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [settingsRow, setSettingsRow] = useState<number | null>(null);

  // Data state
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [repositoryId, setRepositoryId] = useState<string | undefined>();
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<TestCase | null>(null);
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [runResult, setRunResult] = useState<RunResult | null>(null);

  // Repo picker state
  const [ghRepos, setGhRepos] = useState<GHRepo[]>([]);
  const [repoSearch, setRepoSearch] = useState("");
  const [repoPickerOpen, setRepoPickerOpen] = useState(false);
  const [selectedGhRepo, setSelectedGhRepo] = useState<GHRepo | null>(null);
  const [branches, setBranches] = useState<GHBranch[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  // GitHub status
  const [githubStatus, setGithubStatus] = useState<GitHubStatus>({
    connected: false, via: "none", username: null, displayName: null,
    avatarUrl: null, canConnect: false, canDisconnect: false, message: "",
  });

  // Edit form state
  const [editUrl, setEditUrl] = useState("");
  const [editBranch, setEditBranch] = useState("");

  // AI Activity state
  const [aiActivityLog, setAiActivityLog] = useState<AIActivityEntry[]>([]);
  const [expandedTurns, setExpandedTurns] = useState<Set<string>>(new Set());

  // Test case editor state
  const [editingTestCaseId, setEditingTestCaseId] = useState<string | null>(null);
  const [editTcTitle, setEditTcTitle] = useState("");
  const [editTcDescription, setEditTcDescription] = useState("");
  const [editTcPriority, setEditTcPriority] = useState<"low" | "medium" | "high">("medium");
  const [editTcRoute, setEditTcRoute] = useState("");
  const [editTcAssertions, setEditTcAssertions] = useState("");

  // Natural language test creation state
  const [nlPrompt, setNlPrompt] = useState("");
  const [nlLoading, setNlLoading] = useState(false);

  // Theme state
  const [isDark, setIsDark] = useState(false);

  // Search debounce ref
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem("theme") === "dark";
    setIsDark(saved);
    if (saved) document.documentElement.classList.add("dark");
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    if (next) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };


  // Fetch GitHub status + repos on mount
  useEffect(() => {
    getCachedGitHubStatus().then((data) => {
      if (data) {
        setGithubStatus(data as unknown as GitHubStatus);
        if (data.connected) loadGhRepos();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadGhRepos(q = "") {
    setLoadingRepos(true);
    try {
      const url = q ? `/api/github/repos?q=${encodeURIComponent(q)}` : "/api/github/repos";
      const data = await fetch(url).then((r) => r.json());
      if (data.ok) setGhRepos(data.repos as GHRepo[]);
    } catch { /* ignore */ } finally {
      setLoadingRepos(false);
    }
  }

  async function selectGhRepo(repo: GHRepo) {
    setSelectedGhRepo(repo);
    setRepoUrl(`https://github.com/${repo.fullName}`);
    setBranch(repo.defaultBranch);
    setRepoPickerOpen(false);
    // Fetch branches
    try {
      const [owner, repoName] = repo.fullName.split("/");
      const data = await fetch(`/api/github/${owner}/${repoName}/branches`).then((r) => r.json());
      if (data.ok) setBranches(data.branches as GHBranch[]);
    } catch { /* ignore */ }
  }


  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const rows = useMemo(() => {
    if (!analysis) return [];
    return [
      {
        name: analysis.repository.fullName.split("/")[1] ?? analysis.repository.fullName,
        repo: analysis.repository.fullName,
        state: testCases.length ? `${testCases.length} tests generated` : "Ready",
        date: new Date().toLocaleDateString(),
      },
    ];
  }, [analysis, testCases.length]);

  /* ── Actions ────────────────────────────────────────────── */

  async function analyzeRepo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run("Analyzing repository", async () => {
      const payload = await postJson("/api/repos/analyze", { repoUrl, branch });
      setAnalysis(payload.analysis as Analysis);
      const persistence = payload.persistence as { repositoryId?: string } | undefined;
      setRepositoryId(persistence?.repositoryId);
      setTestCases([]);
      setSelectedCase(null);
      setGeneratedScript(null);
      setRunResult(null);
      setExpandedRows(new Set([0]));
    });
  }

  const generateCases = useCallback(async () => {
    if (!analysis) {
      setError("Add a GitHub repo first, then run the review.");
      return;
    }
    await run("Generating tests", async () => {
      const payload = await postJson("/api/tests/generate", { analysis, repositoryId });
      const cases = payload.testCases as TestCase[];
      setTestCases(cases);
      setSelectedCase(cases[0] ?? null);
      setGeneratedScript(null);
      setRunResult(null);
      // Capture AI conversation
      const convos = payload.aiConversation as AIConversationMeta[] | undefined;
      if (convos?.length) {
        setAiActivityLog((prev) => [
          ...prev,
          ...convos.map((c, i) => ({
            id: `gen-tests-${Date.now()}-${i}`,
            label: "Generate Test Cases",
            timestamp: new Date().toISOString(),
            conversation: c,
          })),
        ]);
      }
    });
  }, [analysis, repositoryId]);

  async function generateScript() {
    if (!selectedCase) {
      setError("Generate and select a test case first.");
      return;
    }
    await run("Generating script", async () => {
      const payload = await postJson("/api/scripts/generate", { analysis, testCase: selectedCase, repositoryId });
      setGeneratedScript(payload.generatedScript as GeneratedScript);
      setRunResult(null);
      // Capture AI conversation
      const convos = payload.aiConversation as AIConversationMeta[] | undefined;
      if (convos?.length) {
        setAiActivityLog((prev) => [
          ...prev,
          ...convos.map((c, i) => ({
            id: `gen-script-${Date.now()}-${i}`,
            label: "Generate Playwright Script",
            timestamp: new Date().toISOString(),
            conversation: c,
          })),
        ]);
      }
    });
  }

  async function runScript() {
    if (!generatedScript) {
      setError("Generate a Playwright script first.");
      return;
    }
    await run("Running browser test", async () => {
      const payload = await postJson("/api/tests/run", {
        generatedScript,
        targetBaseUrl,
        repositoryId,
      });
      setRunResult(payload.result as RunResult);
      // Capture AI conversation from error explanation
      const convos = payload.aiConversation as AIConversationMeta[] | undefined;
      if (convos?.length) {
        setAiActivityLog((prev) => [
          ...prev,
          ...convos.map((c, i) => ({
            id: `run-test-${Date.now()}-${i}`,
            label: "AI Error Analysis",
            timestamp: new Date().toISOString(),
            conversation: c,
          })),
        ]);
      }
    });
  }

  async function run(label: string, action: () => Promise<void>) {
    setLoading(label);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setLoading("");
    }
  }

  function toggleRow(index: number) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function openEdit(index: number) {
    const row = rows[index];
    if (row) {
      setEditUrl(`https://github.com/${row.repo}`);
      setEditBranch(analysis?.repository.selectedBranch || "");
    }
    setEditingRow(index);
    setSettingsRow(null);
  }

  function closeEdit() {
    setEditingRow(null);
    setEditUrl("");
    setEditBranch("");
  }

  async function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRepoUrl(editUrl);
    setBranch(editBranch);
    closeEdit();
    // Re-analyze with new values
    await run("Re-analyzing repository", async () => {
      const payload = await postJson("/api/repos/analyze", { repoUrl: editUrl, branch: editBranch });
      setAnalysis(payload.analysis as Analysis);
      const persistence = payload.persistence as { repositoryId?: string } | undefined;
      setRepositoryId(persistence?.repositoryId);
      setTestCases([]);
      setSelectedCase(null);
      setGeneratedScript(null);
      setRunResult(null);
    });
  }

  function deleteTestCase(id: string) {
    setTestCases((prev) => prev.filter((tc) => tc.id !== id));
    if (selectedCase?.id === id) setSelectedCase(null);
  }

  function startEditTestCase(tc: TestCase) {
    setEditingTestCaseId(tc.id);
    setEditTcTitle(tc.title);
    setEditTcDescription(tc.description);
    setEditTcPriority(tc.priority);
    setEditTcRoute(tc.targetRoute);
    setEditTcAssertions(tc.assertions.join("\n"));
  }

  function cancelEditTestCase() {
    setEditingTestCaseId(null);
  }

  function saveEditTestCase(id: string) {
    const updatedAssertions = editTcAssertions
      .split("\n")
      .map((a) => a.trim())
      .filter(Boolean);

    setTestCases((prev) =>
      prev.map((tc) =>
        tc.id === id
          ? {
              ...tc,
              title: editTcTitle,
              description: editTcDescription,
              priority: editTcPriority,
              targetRoute: editTcRoute,
              assertions: updatedAssertions,
            }
          : tc
      )
    );

    // Update selectedCase if it's the one being edited
    if (selectedCase?.id === id) {
      setSelectedCase({
        ...selectedCase,
        title: editTcTitle,
        description: editTcDescription,
        priority: editTcPriority,
        targetRoute: editTcRoute,
        assertions: updatedAssertions,
      });
    }

    setEditingTestCaseId(null);
    setToast("Test case updated!");

    // Persist to DB (best-effort)
    if (repositoryId) {
      fetch(`/api/tests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTcTitle,
          description: editTcDescription,
          priority: editTcPriority,
          targetRoute: editTcRoute,
          assertions: updatedAssertions,
        }),
      }).catch(() => {});
    }
  }

  async function createTestFromPrompt() {
    if (!nlPrompt.trim() || nlPrompt.trim().length < 5) {
      setError("Please describe the test in at least 5 characters.");
      return;
    }
    setNlLoading(true);
    setError("");
    try {
      const payload = await postJson("/api/tests/from-prompt", {
        prompt: nlPrompt.trim(),
        repositoryId,
        analysis,
      });
      const newCase = payload.testCase as TestCase;
      setTestCases((prev) => [newCase, ...prev]);
      setSelectedCase(newCase);
      setNlPrompt("");
      setToast("Test case created from your description!");

      // Capture AI conversation
      const convos = payload.aiConversation as AIConversationMeta[] | undefined;
      if (convos?.length) {
        setAiActivityLog((prev) => [
          ...prev,
          ...convos.map((c, i) => ({
            id: `nl-test-${Date.now()}-${i}`,
            label: "Natural Language Test",
            timestamp: new Date().toISOString(),
            conversation: c,
          })),
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create test.");
    } finally {
      setNlLoading(false);
    }
  }

  function copyScript() {
    if (generatedScript) {
      navigator.clipboard.writeText(generatedScript.script).then(() => setToast("Script copied!")).catch(() => { });
    }
  }

  const priorityColor = (p: string) => {
    if (p === "high") return "var(--danger)";
    if (p === "medium") return "#d97706";
    return "var(--muted)";
  };

  /* ── Render ─────────────────────────────────────────────── */

  return (
    <section className="review-page">
      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}

      <div className="main-header glass">
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>PR Review</h1>
          <p style={{ margin: "6px 0 0", color: "var(--muted)", fontSize: 14 }}>
            Automatically analyze repositories, generate tests, and run browser feedback.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="dark-mode-toggle" type="button" onClick={toggleDark} title="Toggle Theme">
            {isDark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <Button variant="outline" size="sm" type="button" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Provider tabs */}
      <div className="provider-tabs">
        <button className="selected" type="button">GitHub</button>
        <button type="button" onClick={() => setToast("GitLab integration coming soon!")}>
          GitLab
        </button>
        <button type="button" onClick={() => setToast("Bitbucket integration coming soon!")}>
          Bitbucket
        </button>
        <button type="button" onClick={() => setToast("Azure DevOps integration coming soon!")}>
          Azure DevOps
        </button>
      </div>

      {/* GitHub Connection + Repo Picker */}
      <div className="connection-grid">
        {/* Step 1: GitHub connection card */}
        <article className="connection-card glass">
          <div className="card-icon" style={{ background: githubStatus.connected ? "var(--text)" : "var(--soft)", color: githubStatus.connected ? "var(--bg)" : "var(--text)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h2>GitHub</h2>
            {githubStatus.connected ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                {githubStatus.avatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={githubStatus.avatarUrl} alt={githubStatus.username || ""} className="gh-avatar-sm" />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ display: "block" }}>{githubStatus.displayName || githubStatus.username}</strong>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>@{githubStatus.username} · via {githubStatus.via}</span>
                </div>
                {githubStatus.canDisconnect && (
                  <a href="/api/auth/logout" className="small-disconnect-btn">Disconnect</a>
                )}
              </div>

            ) : (
              <>
                <p>{githubStatus.message || "Connect to access your private repos"}</p>
                {githubStatus.canConnect && (
                  <a href="/api/auth/github" className="connect-github-btn" style={{ marginTop: 12, display: "inline-flex" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                    </svg>
                    Connect GitHub
                  </a>
                )}
              </>
            )}
          </div>
          <span style={{ fontSize: 13, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span className={`status-dot ${githubStatus.connected ? "success" : "neutral"}`} />
            {githubStatus.connected ? "Connected" : "Not Connected"}
          </span>
        </article>

        {/* Step 2: Repo picker card */}
        <article className="connection-card glass" style={{ flexDirection: "column", alignItems: "stretch", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div className="card-icon" style={{ display: "grid", placeItems: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h2 style={{ margin: 0 }}>Select Repository</h2>
                <span style={{ fontSize: 13, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span className={`status-dot ${selectedGhRepo || repoUrl ? "success" : "neutral"}`} />
                  {selectedGhRepo ? selectedGhRepo.name : repoUrl ? "Manual" : "None selected"}
                </span>
              </div>
              <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: 13 }}>
                Pick from your repos or enter a URL manually
              </p>
            </div>
          </div>


          {/* Repo picker dropdown (only when connected) */}
          {githubStatus.connected && (
            <div className="repo-picker">
              <div className="repo-picker-trigger" onClick={() => { setRepoPickerOpen(!repoPickerOpen); if (!ghRepos.length) loadGhRepos(); }}>
                <span>
                  {selectedGhRepo ? `📁 ${selectedGhRepo.fullName}` : "— Choose a repository —"}
                </span>
                <span>{repoPickerOpen ? "▴" : "▾"}</span>
              </div>

              {repoPickerOpen && (
                <div className="repo-picker-dropdown">
                  <input
                    className="repo-search-input"
                    placeholder="Search repos..."
                    value={repoSearch}
                    autoFocus
                    onChange={(e) => {
                      const value = e.target.value;
                      setRepoSearch(value);
                      // Debounce search to avoid firing on every keystroke
                      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
                      searchTimerRef.current = setTimeout(() => loadGhRepos(value), 300);
                    }}
                  />
                  <div className="repo-picker-list">
                    {loadingRepos ? (
                      <div className="repo-picker-empty"><span className="spinner" /> Loading...</div>
                    ) : ghRepos.length === 0 ? (
                      <div className="repo-picker-empty">No repositories found</div>
                    ) : (
                      ghRepos.map((repo) => (
                        <button
                          key={repo.id}
                          className="repo-picker-item"
                          type="button"
                          onClick={() => selectGhRepo(repo)}
                        >
                          <div className="repo-picker-item-name">
                            {repo.private ? "🔒" : "📁"} {repo.fullName}
                          </div>
                          <div className="repo-picker-item-meta">
                            {repo.language && <span>{repo.language}</span>}
                            <span>⭐ {repo.defaultBranch}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Branch picker (after selecting repo) */}
          {selectedGhRepo && branches.length > 0 && (
            <div>
              <label className="picker-label">Branch</label>
              <select
                className="branch-select"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              >
                {branches.map((b) => (
                  <option key={b.name} value={b.name}>{b.name}{b.protected ? " 🔒" : ""}</option>
                ))}
              </select>
            </div>
          )}

          {/* Manual URL fallback */}
          <details className="manual-url-details">
            <summary>Or enter URL manually</summary>
            <form className="add-repo-form" style={{ marginTop: 10 }} onSubmit={analyzeRepo}>
              <input
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                required
                suppressHydrationWarning
              />
              <input
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="branch (optional)"
                suppressHydrationWarning
              />
              <Button type="submit" disabled={Boolean(loading)}>
                {loading === "Analyzing repository" ? "Analyzing..." : "Add Repo"}
              </Button>
            </form>
          </details>

          {/* Analyze button (when repo selected via picker) */}
          {selectedGhRepo && (
            <Button
              variant="gradient"
              type="button"
              disabled={Boolean(loading)}
              style={{ marginTop: 4, width: "100%" }}
              onClick={() => {
                const fakeEvent = { preventDefault: () => { } } as React.FormEvent<HTMLFormElement>;
                analyzeRepo(fakeEvent);
              }}
            >
              {loading === "Analyzing repository" ? "Analyzing..." : `Analyze ${selectedGhRepo.name}`}
            </Button>
          )}
        </article>
      </div>

      {/* Status banners */}
      {loading && <div className="notice-banner"><span className="spinner" /> {loading}...</div>}
      {error && <div className="error-banner">{error}</div>}



      {/* Repo rows */}
      {rows.length > 0 && (
        <div className="repo-list">
          {rows.map((row, index) => (
            <article className="repo-row glass" key={row.repo}>
              <button className="chevron" type="button" onClick={() => toggleRow(index)}>
                {expandedRows.has(index) ? "▾" : "▸"}
              </button>
              <div className="repo-name">
                <strong>{row.name}</strong>
                <span>{row.repo}</span>
              </div>
              <code>{row.repo}</code>
              <Button variant="outline" size="sm" type="button" onClick={() => openEdit(index)}>
                Edit
              </Button>
              <span style={{ fontSize: 13, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span className="status-dot success" />
                Ready
              </span>
              <label className="enabled">
                <input type="checkbox" defaultChecked />
                Enabled
              </label>
              <div className="review-state">
                <strong>{row.state}</strong>
                <span>{row.date}</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={() => setSettingsRow(settingsRow === index ? null : index)}
                title="Settings"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="icon">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </Button>
              <Button variant="gradient" type="button" onClick={generateCases} disabled={Boolean(loading)}>
                {loading === "Generating tests" ? "..." : "Run"}
              </Button>

              {/* Settings popover */}
              {settingsRow === index && (
                <div className="settings-popover">
                  <div className="popover-header">
                    <strong>Repo Settings</strong>
                    <Button variant="ghost" size="sm" type="button" onClick={() => setSettingsRow(null)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="icon">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </Button>
                  </div>
                  <label>
                    Target Base URL
                    <input
                      value={targetBaseUrl}
                      onChange={(e) => setTargetBaseUrl(e.target.value)}
                      placeholder="https://your-app.com"
                    />
                  </label>
                  <label>
                    Branch
                    <input value={analysis?.repository.selectedBranch || ""} disabled />
                  </label>
                  <p style={{ fontSize: 12, color: "var(--muted)", margin: "8px 0 0" }}>
                    Configure the target URL where your app is deployed for browser testing.
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editingRow !== null && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Repository</h2>
              <Button variant="ghost" size="sm" type="button" onClick={closeEdit}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="icon">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Button>
            </div>
            <form onSubmit={submitEdit}>
              <label>
                Repository URL
                <input
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  required
                />
              </label>
              <label>
                Branch
                <input
                  value={editBranch}
                  onChange={(e) => setEditBranch(e.target.value)}
                  placeholder="main"
                />
              </label>
              <div className="modal-actions">
                <Button variant="secondary" type="button" onClick={closeEdit}>Cancel</Button>
                <Button type="submit" variant="gradient" disabled={Boolean(loading)}>
                  Re-analyze
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pipeline panel */}
      {analysis && rows.some((_, i) => expandedRows.has(i)) ? (
        <div className="pipeline-panel glass fade-in">
          <div className="metrics">
            <Metric label="Branch" value={analysis.repository.selectedBranch} />
            <Metric label="Files scanned" value={analysis.tree.filesScanned.toLocaleString()} />
            <Metric label="Selected files" value={analysis.selectedFiles.length.toString()} />
            <Metric label="Stack" value={analysis.stack.detected.join(", ") || "Unknown"} />
          </div>

          <div className="pipeline-actions">
            <label>
              Target app URL
              <input
                value={targetBaseUrl}
                onChange={(e) => setTargetBaseUrl(e.target.value)}
                placeholder="https://your-deployed-app.com"
              />
            </label>
            <Button variant="outline" type="button" disabled={Boolean(loading)} onClick={generateCases}>
              {loading === "Generating tests" ? "Generating..." : "Generate Cases"}
            </Button>
            <Button variant="outline" type="button" disabled={!selectedCase || Boolean(loading)} onClick={generateScript}>
              {loading === "Generating script" ? "Generating..." : "Generate Script"}
            </Button>
            <Button
              variant="gradient"
              type="button"
              disabled={!generatedScript || Boolean(loading)}
              onClick={runScript}
            >
              {loading === "Running browser test" ? "Running..." : "Run Locally"}
            </Button>
          </div>

          <div className="pipeline-grid">
            {/* Test cases */}
            <div>
              <h3>AI Test Cases {testCases.length > 0 && <span className="count-badge" style={{ fontSize: 11, marginLeft: 8 }}>{testCases.length}</span>}</h3>

              {/* Natural Language Test Input */}
              <div className="nl-test-input">
                <input
                  type="text"
                  value={nlPrompt}
                  onChange={(e) => setNlPrompt(e.target.value)}
                  placeholder="Describe a test in plain English..."
                  disabled={nlLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      createTestFromPrompt();
                    }
                  }}
                />
                <button
                  className="nl-submit-btn"
                  type="button"
                  disabled={nlLoading || !nlPrompt.trim()}
                  onClick={createTestFromPrompt}
                  title="Create test from description"
                >
                  {nlLoading ? (
                    <span className="spinner" style={{ width: 16, height: 16 }} />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="case-list">
                {testCases.length ? (
                  testCases.map((testCase) => (
                    <div key={testCase.id} className="case-card-wrapper">
                      {editingTestCaseId === testCase.id ? (
                        /* ── Inline Edit Mode ── */
                        <div className="case-card-edit">
                          <label>
                            Title
                            <input
                              type="text"
                              value={editTcTitle}
                              onChange={(e) => setEditTcTitle(e.target.value)}
                            />
                          </label>
                          <div className="case-edit-row">
                            <label>
                              Priority
                              <select
                                value={editTcPriority}
                                onChange={(e) => setEditTcPriority(e.target.value as "low" | "medium" | "high")}
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                            </label>
                            <label>
                              Route
                              <input
                                type="text"
                                value={editTcRoute}
                                onChange={(e) => setEditTcRoute(e.target.value)}
                              />
                            </label>
                          </div>
                          <label>
                            Description
                            <textarea
                              value={editTcDescription}
                              onChange={(e) => setEditTcDescription(e.target.value)}
                              rows={2}
                            />
                          </label>
                          <label>
                            Assertions <small style={{ color: "var(--muted)", fontWeight: 400 }}>(one per line)</small>
                            <textarea
                              value={editTcAssertions}
                              onChange={(e) => setEditTcAssertions(e.target.value)}
                              rows={3}
                              placeholder="Each assertion on a new line"
                            />
                          </label>
                          <div className="case-edit-actions">
                            <Button
                              variant="gradient"
                              size="sm"
                              type="button"
                              onClick={() => saveEditTestCase(testCase.id)}
                            >
                              ✓ Save
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              type="button"
                              onClick={cancelEditTestCase}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* ── Read Mode ── */
                        <>
                          <button
                            className={selectedCase?.id === testCase.id ? "case-card active" : "case-card"}
                            type="button"
                            onClick={() => setSelectedCase(testCase)}
                          >
                            <div className="case-card-header">
                              <strong>{testCase.title}</strong>
                              <span className="priority-badge" style={{ color: testCase.priority === 'high' ? 'var(--text)' : 'var(--muted)' }}>
                                {testCase.priority}
                              </span>
                            </div>
                            <span>Route: {testCase.targetRoute}</span>
                            <small>{testCase.description}</small>
                            {testCase.assertions.length > 0 && (
                              <div className="assertions">
                                {testCase.assertions.map((a, i) => (
                                  <span key={i} className="assertion-chip">✓ {a}</span>
                                ))}
                              </div>
                            )}
                          </button>
                          <div className="case-card-actions">
                            <button
                              className="case-edit-btn"
                              type="button"
                              title="Edit test case"
                              onClick={(e) => { e.stopPropagation(); startEditTestCase(testCase); }}
                            >
                              ✏️
                            </button>
                            <button
                              className="case-delete"
                              type="button"
                              title="Remove test case"
                              onClick={() => deleteTestCase(testCase.id)}
                            >
                              ✕
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="empty-state">Run the repo to generate AI test cases, or describe a test above.</p>
                )}
              </div>
            </div>

            {/* Script */}
            <div>
              <div className="script-header">
                <h3>Generated Playwright Script</h3>
              </div>
              {generatedScript ? (
                <CodeWindow title="playwright.spec.ts" content={generatedScript.script} />
              ) : (
                <p className="empty-state">Generate a script after selecting a test case.</p>
              )}
            </div>
          </div>

          {/* Run result */}
          {runResult && (
            <div className="run-result glass fade-in">

              {/* Header */}
              <div className="run-result-header">
                <h3>Browser Test Result</h3>
                <span className={`pill ${runResult.status === "passed" ? "success" : runResult.status === "error" ? "danger" : "warning"}`}>
                  {runResult.status === "passed" ? "✓ passed" : runResult.status === "error" ? "✗ failed" : runResult.status}
                </span>
                {runResult.durationMs && (
                  <span style={{ color: "var(--muted)", fontSize: 13, marginLeft: "auto" }}>
                    {(runResult.durationMs / 1000).toFixed(1)}s
                  </span>
                )}
              </div>
              <p style={{ color: "var(--muted)", margin: "8px 0" }}>{runResult.summary}</p>

              {/* Browserbase cloud link */}
              {runResult.sessionUrl && (
                <a href={runResult.sessionUrl} target="_blank" rel="noopener noreferrer" className="session-link" style={{ display: "inline-flex", alignItems: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  View Browserbase Session
                </a>
              )}

              {/* ── AI Root Cause Analysis ── */}
              {runResult.aiErrorExplanation && (
                <div className="ai-explanation-card">
                  <div className="ai-explanation-header">
                    <span className="ai-explanation-icon" style={{ display: "inline-flex", alignItems: "center" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                        <polyline points="4 17 10 11 4 5" />
                        <line x1="12" y1="19" x2="20" y2="19" />
                      </svg>
                    </span>
                    <strong>AI Root Cause Analysis</strong>
                    <div className="confidence-badge">
                      Confidence: {runResult.aiErrorExplanation.confidence}%
                    </div>
                  </div>

                  <div className="ai-rca-section">
                    <div className="ai-rca-label">Reason:</div>
                    <p className="ai-rca-reason">{runResult.aiErrorExplanation.reason}</p>
                  </div>

                  <div className="ai-rca-section">
                    <div className="ai-rca-label">Possible Causes:</div>
                    <ul className="ai-rca-causes">
                      {runResult.aiErrorExplanation.possibleCauses.map((cause, idx) => (
                        <li key={idx}>
                          <span className="cause-check" style={{ display: "inline-flex", marginRight: 6 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* ── Step Timeline ── */}
              {runResult.stepResults && runResult.stepResults.length > 0 && (
                <div className="step-timeline">
                  <h4 style={{ margin: "0 0 10px" }}>Step Results</h4>
                  {runResult.stepResults.map((step) => (
                    <div
                      key={step.index}
                      className={`step-row ${step.status === "passed" ? "step-passed"
                          : step.status === "failed" ? "step-failed"
                            : "step-skipped"
                        }`}
                    >
                      <span className="step-icon" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        {step.status === "passed" ? (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : step.status === "failed" ? (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        ) : (
                          "—"
                        )}
                      </span>
                      <span className="step-num">{step.index}.</span>
                      <span className="step-label">{step.label}</span>
                      <span className="step-duration">
                        {step.status === "skipped" ? "skipped" : `${step.durationMs}ms`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Failure Screenshot ── */}
              {runResult.failureScreenshotBase64 && (
                <div className="screenshot-preview failure-screenshot">
                  <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    Failure Screenshot
                  </h4>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`data:image/png;base64,${runResult.failureScreenshotBase64}`}
                    alt="Failure screenshot with red highlight"
                  />
                </div>
              )}

              {/* ── Success Screenshot ── */}
              {runResult.screenshotBase64 && !runResult.failureScreenshotBase64 && (
                <div className="screenshot-preview">
                  <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    Screenshot
                  </h4>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`data:image/png;base64,${runResult.screenshotBase64}`}
                    alt="Browser test screenshot"
                  />
                </div>
              )}

              {/* ── Video Recording ── */}
              {runResult.videoBase64 && (
                <div className="video-preview">
                  <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 7l-7 5 7 5V7z" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                    Video Recording
                  </h4>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video
                    src={`data:video/webm;base64,${runResult.videoBase64}`}
                    controls
                    style={{ width: "100%", borderRadius: 8, background: "#000" }}
                  />
                  <a
                    href={`data:video/webm;base64,${runResult.videoBase64}`}
                    download={runResult.videoName || "test-recording.webm"}
                    className="download-video-btn"
                    style={{ display: "inline-flex", alignItems: "center" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download {runResult.videoName || "recording.webm"}
                  </a>
                </div>
              )}

              {/* ── Execution Logs ── */}
              <details className="run-logs">
                <summary>Execution Logs ({runResult.logs.length})</summary>
                <CodeWindow title="execution.log" content={runResult.logs.join("\n")} />
              </details>

              <Button variant="secondary" type="button" onClick={runScript} style={{ marginTop: 12, display: "inline-flex", alignItems: "center" }} disabled={Boolean(loading)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                Re-run Test
              </Button>
            </div>
          )}

          <AIActivityPanel
            entries={aiActivityLog}
            expandedTurns={expandedTurns}
            onToggleTurn={(id) =>
              setExpandedTurns((prev) => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              })
            }
            onClear={() => { setAiActivityLog([]); setExpandedTurns(new Set()); }}
            isLoading={Boolean(loading)}
          />

          <p className="tip">Tip: a project is reviewed only when its repo matches owner/repo exactly.</p>
        </div>
      ) : (
        loading === "Analyzing repository" ? (
          <div style={{ marginTop: 24 }}>
            <SkeletonLoader />
          </div>
        ) : (
          !analysis && (
            <p className="tip">Tip: add a GitHub repo URL above, then run the review pipeline.</p>
          )
        )
      )}
    </section>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function CodeWindow({ title, content }: { title: string; content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-window">
      <div className="code-window-header">
        <div className="code-window-dots">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        <span className="code-window-title">{title}</span>
        <button className="code-copy-btn" type="button" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="code-window-body">
        <pre><code>{content}</code></pre>
      </div>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="skeleton-grid">
      <div className="skeleton-card header-skeleton" />
      <div className="skeleton-card row-skeleton" />
      <div className="skeleton-card row-skeleton" />
      <div className="skeleton-card row-skeleton" />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AIActivityPanel({
  entries,
  expandedTurns,
  onToggleTurn,
  onClear,
  isLoading,
}: {
  entries: AIActivityEntry[];
  expandedTurns: Set<string>;
  onToggleTurn: (id: string) => void;
  onClear: () => void;
  isLoading: boolean;
}) {
  const [isOpen, setIsOpen] = useState(entries.length > 0);

  // Auto-open when new entries arrive
  useEffect(() => {
    if (entries.length > 0) setIsOpen(true);
  }, [entries.length]);

  function truncate(text: string, max: number) {
    if (text.length <= max) return text;
    return text.slice(0, max) + "…";
  }

  function formatTime(iso: string) {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return "";
    }
  }

  return (
    <details className="ai-activity-panel" open={isOpen || undefined} onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="ai-activity-header" onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}>
        <span className="ai-icon" style={{ display: "inline-flex", alignItems: "center" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
        </span>
        <strong>AI Activity</strong>
        {entries.length > 0 && <span className="ai-activity-count">{entries.length}</span>}
        {entries.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            className="ai-activity-clear"
            type="button"
            onClick={(e) => { e.stopPropagation(); onClear(); }}
          >
            Clear
          </Button>
        )}
        <span className="ai-activity-chevron">▾</span>
      </summary>

      <div className="ai-activity-body">
        {entries.length === 0 && !isLoading ? (
          <div className="ai-activity-empty">
            <span className="empty-brain" style={{ display: "inline-flex", justifyContent: "center", marginBottom: 12 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d4d4d8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
            </span>
            <p>AI interactions will appear here as you generate tests, scripts, and run analysis.</p>
          </div>
        ) : (
          <>
            {entries.map((entry) => (
              <div key={entry.id} className="ai-conversation-entry">
                <div className="ai-conv-header">
                  <span className="ai-conv-label">{entry.label}</span>
                  <span className="ai-model-badge" style={{ display: "inline-flex", alignItems: "center" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    {entry.conversation.model}
                  </span>
                  {entry.conversation.durationMs > 0 && (
                    <span className="ai-duration-badge">{(entry.conversation.durationMs / 1000).toFixed(1)}s</span>
                  )}
                  {entry.conversation.isFallback && (
                    <span className="ai-fallback-badge">Fallback</span>
                  )}
                </div>
                <div className="ai-conv-turns">
                  {entry.conversation.turns.map((turn, ti) => {
                    const turnKey = `${entry.id}-${ti}`;
                    const isExpanded = expandedTurns.has(turnKey);
                    const isLong = turn.content.length > 200;

                    return (
                      <div key={ti} className={`ai-chat-bubble ${turn.role}`}>
                        <div className="ai-bubble-label">
                          <span className="ai-bubble-dot" />
                          {turn.role === "system" ? "System Prompt" : turn.role === "user" ? "Input Data" : "AI Response"}
                          <span className="ai-bubble-time">{formatTime(turn.timestamp)}</span>
                        </div>
                        <div className="ai-bubble-content">
                          {isLong && !isExpanded ? (
                            <>
                              {truncate(turn.content, 200)}
                              <br />
                              <button className="ai-bubble-toggle" type="button" onClick={() => onToggleTurn(turnKey)}>
                                Show full {turn.role === "assistant" ? "response" : "content"} ▾
                              </button>
                            </>
                          ) : (
                            <>
                              {turn.role === "assistant" && turn.content.startsWith("{") ? (
                                <pre>{formatJson(turn.content)}</pre>
                              ) : (
                                <span style={{ whiteSpace: "pre-wrap" }}>{turn.content}</span>
                              )}
                              {isLong && (
                                <button className="ai-bubble-toggle" type="button" onClick={() => onToggleTurn(turnKey)}>
                                  Show less ▴
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="ai-typing-indicator">
                <span /><span /><span />
              </div>
            )}
          </>
        )}
      </div>
    </details>
  );
}

function formatJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok || payload.ok === false) throw new Error(payload.error || "Request failed.");
  return payload as Record<string, unknown>;
}