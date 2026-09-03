export type GitHubTreeFile = {
  path: string;
  type: "blob" | "tree" | "commit";
  size?: number;
  sha?: string;
  url?: string;
};

export type SelectedRepositoryFile = {
  path: string;
  language: string;
  sizeBytes: number;
  reason: string;
  contentPreview?: string;
};

export type RepositoryAnalysis = {
  repository: {
    owner: string;
    name: string;
    fullName: string;
    description: string | null;
    htmlUrl: string;
    defaultBranch: string;
    selectedBranch: string;
    private: boolean;
    stars: number;
    primaryLanguage: string | null;
    pushedAt: string | null;
  };
  tree: {
    filesScanned: number;
    directoriesScanned: number;
    truncated: boolean;
  };
  stack: {
    detected: string[];
    signals: string[];
  };
  selectedFiles: SelectedRepositoryFile[];
};

type GitHubRepoResponse = {
  name: string;
  full_name: string;
  owner: { login: string };
  description: string | null;
  html_url: string;
  default_branch: string;
  private: boolean;
  stargazers_count: number;
  language: string | null;
  pushed_at: string | null;
};

type GitHubTreeResponse = {
  tree: GitHubTreeFile[];
  truncated: boolean;
};

type GitHubContentResponse = {
  content?: string;
  encoding?: string;
};

const MAX_PREVIEW_FILES = 5;  // Fewer previews = faster analysis
const MAX_PREVIEW_BYTES = 60_000; // Skip large files
const MAX_PREVIEW_CHARS = 1_500;  // Trim previews shorter

const ignoredPathParts = new Set([
  ".git",
  ".next",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".turbo",
  ".vercel",
  "target",
  ".venv",
  "venv",
]);

const importantExactFiles = new Set([
  "package.json",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "playwright.config.js",
  "playwright.config.ts",
  "tsconfig.json",
  "drizzle.config.ts",
  "drizzle.config.js",
  "README.md",
]);

const sourceRoots = ["app/", "pages/", "src/", "components/", "tests/", "e2e/"];

export function parseGitHubRepoUrl(repoUrl: string) {
  const trimmed = repoUrl.trim();
  const sshMatch = trimmed.match(/^git@github\.com:([\w.-]+)\/([\w.-]+?)(?:\.git)?$/);
  if (sshMatch) {
    return { owner: sshMatch[1], repo: sshMatch[2] };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("Enter a valid GitHub repository URL.");
  }

  if (parsed.hostname !== "github.com") {
    throw new Error("Only github.com repository URLs are supported on Day 2.");
  }

  const [owner, repoName] = parsed.pathname.split("/").filter(Boolean);
  if (!owner || !repoName) {
    throw new Error("GitHub URL must include an owner and repository name.");
  }

  return { owner, repo: repoName.replace(/\.git$/, "") };
}

export async function analyzeGitHubRepository(input: {
  repoUrl: string;
  branch?: string;
}): Promise<RepositoryAnalysis> {
  const { owner, repo } = parseGitHubRepoUrl(input.repoUrl);
  const repository = await githubFetch<GitHubRepoResponse>(`/repos/${owner}/${repo}`);
  const selectedBranch = sanitizeRef(input.branch) || repository.default_branch;
  const tree = await githubFetch<GitHubTreeResponse>(
    `/repos/${owner}/${repo}/git/trees/${encodeURIComponent(selectedBranch)}?recursive=1`,
  );

  const files = tree.tree.filter((item) => item.type === "blob" && !isIgnored(item.path));
  const directories = tree.tree.filter((item) => item.type === "tree" && !isIgnored(item.path));
  const selectedFiles = rankRelevantFiles(files).slice(0, 40);
  const previewableFiles = selectedFiles
    .filter((file) => file.sizeBytes <= MAX_PREVIEW_BYTES)
    .slice(0, MAX_PREVIEW_FILES);

  const previews = await Promise.all(
    previewableFiles.map(async (file) => ({
      path: file.path,
      contentPreview: await fetchFilePreview(owner, repo, file.path, selectedBranch),
    })),
  );

  const selectedWithPreviews = selectedFiles.map((file) => {
    const preview = previews.find((item) => item.path === file.path);
    return preview?.contentPreview
      ? { ...file, contentPreview: preview.contentPreview }
      : file;
  });

  const stack = detectStack(files.map((file) => file.path));

  return {
    repository: {
      owner,
      name: repository.name,
      fullName: repository.full_name,
      description: repository.description,
      htmlUrl: repository.html_url,
      defaultBranch: repository.default_branch,
      selectedBranch,
      private: repository.private,
      stars: repository.stargazers_count,
      primaryLanguage: repository.language,
      pushedAt: repository.pushed_at,
    },
    tree: {
      filesScanned: files.length,
      directoriesScanned: directories.length,
      truncated: tree.truncated,
    },
    stack,
    selectedFiles: selectedWithPreviews,
  };
}

function rankRelevantFiles(files: GitHubTreeFile[]): SelectedRepositoryFile[] {
  return files
    .map((file) => {
      const reason = getSelectionReason(file.path);
      return reason
        ? {
            path: file.path,
            language: detectLanguage(file.path),
            sizeBytes: file.size ?? 0,
            reason,
          }
        : null;
    })
    .filter((file): file is SelectedRepositoryFile => Boolean(file))
    .sort((a, b) => scoreFile(b) - scoreFile(a));
}

function getSelectionReason(path: string) {
  const lower = path.toLowerCase();
  const basename = path.split("/").pop() ?? path;

  if (importantExactFiles.has(basename)) return "project configuration";
  if (sourceRoots.some((root) => lower.startsWith(root))) return "application source";
  if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(lower)) return "existing test";
  if (/\/(tests?|__tests__)\//.test(lower)) return "test folder";
  if (/\.(tsx|ts|jsx|js|mdx|css)$/.test(lower) && lower.includes("route")) return "route implementation";
  return "";
}

function scoreFile(file: SelectedRepositoryFile) {
  const path = file.path.toLowerCase();
  let score = 0;
  if (path.endsWith("package.json")) score += 100;
  if (path.includes("playwright.config")) score += 90;
  if (path.startsWith("app/") || path.includes("/app/")) score += 70;
  if (path.startsWith("pages/") || path.includes("/pages/")) score += 65;
  if (path.startsWith("src/")) score += 55;
  if (path.includes("components/")) score += 45;
  if (path.includes("test") || path.includes("spec")) score += 40;
  if (file.sizeBytes > MAX_PREVIEW_BYTES) score -= 30;
  return score;
}

function detectStack(paths: string[]) {
  const set = new Set(paths);
  const signals: string[] = [];
  const detected: string[] = [];
  const hasPath = (value: string) => set.has(value) || paths.some((path) => path.endsWith(`/${value}`));
  const hasPrefix = (value: string) => paths.some((path) => path.startsWith(value));

  if (hasPath("package.json")) signals.push("package.json");
  if (hasPath("next.config.js") || hasPath("next.config.mjs") || hasPath("next.config.ts")) {
    detected.push("Next.js");
    signals.push("next.config.*");
  }
  if (hasPrefix("app/")) {
    detected.push("Next.js App Router");
    signals.push("app/ directory");
  }
  if (hasPrefix("pages/")) {
    detected.push("Next.js Pages Router");
    signals.push("pages/ directory");
  }
  if (paths.some((path) => path.endsWith(".tsx") || path.endsWith(".jsx"))) {
    detected.push("React UI");
    signals.push("tsx/jsx files");
  }
  if (paths.some((path) => path.includes("playwright.config"))) {
    detected.push("Playwright");
    signals.push("playwright config");
  }
  if (paths.some((path) => path.includes("drizzle.config"))) {
    detected.push("Drizzle ORM");
    signals.push("drizzle config");
  }

  return {
    detected: [...new Set(detected)],
    signals: [...new Set(signals)],
  };
}

function isIgnored(path: string) {
  return path.split("/").some((part) => ignoredPathParts.has(part));
}

function sanitizeRef(ref?: string) {
  if (!ref?.trim()) return "";
  if (!/^[\w./-]+$/.test(ref)) {
    throw new Error("Branch may only contain letters, numbers, dots, slashes, underscores, and hyphens.");
  }
  return ref.trim();
}

function detectLanguage(path: string) {
  const ext = path.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: "TypeScript",
    tsx: "TypeScript React",
    js: "JavaScript",
    jsx: "JavaScript React",
    json: "JSON",
    md: "Markdown",
    mdx: "MDX",
    css: "CSS",
    py: "Python",
    go: "Go",
    rs: "Rust",
  };
  return ext ? map[ext] ?? ext.toUpperCase() : "Unknown";
}

async function fetchFilePreview(owner: string, repo: string, path: string, ref: string) {
  try {
    const content = await githubFetch<GitHubContentResponse>(
      `/repos/${owner}/${repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(ref)}`,
    );

    if (content.encoding !== "base64" || !content.content) return "";
    const cleanBase64 = content.content.replace(/\s/g, "");
    return Buffer.from(cleanBase64, "base64")
      .toString("utf8")
      .slice(0, MAX_PREVIEW_CHARS);
  } catch {
    return "";
  }
}

async function githubFetch<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "ai-testing-automation-agent",
      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = response.status === 404
      ? "Repository not found."
      : response.status === 403
      ? "GitHub API rate limit exceeded or access denied."
      : `GitHub API error (${response.status}).`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}