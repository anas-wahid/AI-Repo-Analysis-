import { chromium, type Browser, type BrowserContext, type Page } from "playwright-core";
import fs from "fs";
import os from "os";
import path from "path";

// ── Types ─────────────────────────────────────────────────────

export type StepResult = {
  index: number;
  action: string;
  label: string;
  status: "passed" | "failed" | "skipped";
  durationMs: number;
  error?: string;
};

export type BrowserRunResult = {
  status: "passed" | "failed" | "skipped" | "error";
  summary: string;
  logs: string[];
  screenshotBase64?: string;
  failureScreenshotBase64?: string;    // screenshot with red-box injected on failure
  videoBase64?: string;                // webm video recording as base64
  videoName?: string;                  // suggested filename e.g. "login_test.webm"
  sessionUrl?: string;
  durationMs: number;
  stepResults: StepResult[];
  failingStep?: string;                // "expectVisible: #root" for AI explainer
  errorMessage?: string;
};

type ScriptStep =
  | { action: "goto"; url: string }
  | { action: "click"; selector: string }
  | { action: "fill"; selector: string; value: string }
  | { action: "expectVisible"; selector: string }
  | { action: "expectText"; text: string }
  | { action: "screenshot"; name: string };

// ── Public API ────────────────────────────────────────────────

/**
 * Run a series of script steps in a cloud Browserbase session
 * or fall back to local headless Chromium when Browserbase credentials are missing.
 * Supports: video recording, per-step results, failure screenshots with red-box highlights.
 */
export async function runBrowserSession(options: {
  steps: ScriptStep[];
  targetBaseUrl: string;
  testTitle?: string;
  browserbaseApiKey?: string;
  browserbaseProjectId?: string;
}): Promise<BrowserRunResult> {
  const { steps, targetBaseUrl, testTitle, browserbaseApiKey, browserbaseProjectId } = options;
  const logs: string[] = [];
  const start = Date.now();

  if (browserbaseApiKey && browserbaseProjectId) {
    return runBrowserbase({ steps, targetBaseUrl, testTitle, browserbaseApiKey, browserbaseProjectId, logs, start });
  }

  return runLocal({ steps, targetBaseUrl, testTitle, logs, start });
}

// ── Browserbase Cloud ─────────────────────────────────────────

async function runBrowserbase(ctx: {
  steps: ScriptStep[];
  targetBaseUrl: string;
  testTitle?: string;
  browserbaseApiKey: string;
  browserbaseProjectId: string;
  logs: string[];
  start: number;
}): Promise<BrowserRunResult> {
  const { steps, targetBaseUrl, testTitle, browserbaseApiKey, browserbaseProjectId, logs, start } = ctx;

  logs.push("Creating Browserbase cloud session...");
  let browser: Browser | undefined;

  try {
    const sessionRes = await fetch("https://api.browserbase.com/v1/sessions", {
      method: "POST",
      headers: {
        "x-bb-api-key": browserbaseApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ projectId: browserbaseProjectId }),
    });

    if (!sessionRes.ok) {
      const text = await sessionRes.text();
      throw new Error(`Browserbase session creation failed (${sessionRes.status}): ${text.slice(0, 300)}`);
    }

    const session = (await sessionRes.json()) as { id: string; connectUrl?: string };
    const connectUrl =
      session.connectUrl ||
      `wss://connect.browserbase.com?apiKey=${browserbaseApiKey}&sessionId=${session.id}`;

    logs.push(`Session created: ${session.id}`);
    logs.push("Connecting via CDP...");

    browser = await chromium.connectOverCDP(connectUrl, { timeout: 30_000 });
    const context = browser.contexts()[0] || (await browser.newContext());
    const page = context.pages()[0] || (await context.newPage());

    const { screenshotBase64, failureScreenshotBase64, stepResults, failingStep, errorMessage } =
      await executeSteps(page, steps, targetBaseUrl, logs);

    const status = stepResults.some((s) => s.status === "failed") ? "error" : "passed";

    return {
      status,
      summary:
        status === "passed"
          ? `Browserbase session ${session.id} completed successfully.`
          : errorMessage || "Test failed.",
      logs,
      screenshotBase64,
      failureScreenshotBase64,
      sessionUrl: `https://app.browserbase.com/sessions/${session.id}`,
      durationMs: Date.now() - start,
      stepResults,
      failingStep,
      errorMessage,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Browserbase error.";
    logs.push(`Error: ${message}`);
    return {
      status: "error",
      summary: message,
      logs,
      durationMs: Date.now() - start,
      stepResults: [],
      errorMessage: message,
    };
  } finally {
    try { await browser?.close(); } catch { /* ignore */ }
  }
}

// ── Local Headless ────────────────────────────────────────────

async function runLocal(ctx: {
  steps: ScriptStep[];
  targetBaseUrl: string;
  testTitle?: string;
  logs: string[];
  start: number;
}): Promise<BrowserRunResult> {
  const { steps, targetBaseUrl, testTitle, logs, start } = ctx;

  logs.push("No Browserbase credentials — running locally with headless Chromium.");

  // Video output dir on E: drive (has 67GB free) to avoid C: space issues
  const videoDir = path.join("E:\\", "ai-testing-automation-agent", ".test-videos");
  fs.mkdirSync(videoDir, { recursive: true });

  let browser: Browser | undefined;
  let context: BrowserContext | undefined;

  try {
    const executablePath = findChromium();
    logs.push(`Using browser: ${executablePath || "channel:chrome fallback"}`);

    browser = await chromium.launch({
      headless: true,
      ...(executablePath ? { executablePath } : { channel: "chrome" }),
      args: [
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--font-render-hinting=none",
      ],
    });

    // Create context with video recording enabled
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      recordVideo: {
        dir: videoDir,
        size: { width: 1280, height: 720 },
      },
    });

    const page = await context.newPage();

    logs.push("📹 Video recording started.");

    const { screenshotBase64, failureScreenshotBase64, stepResults, failingStep, errorMessage } =
      await executeSteps(page, steps, targetBaseUrl, logs);

    const hasFailed = stepResults.some((s) => s.status === "failed");
    logs.push("Local run complete.");

    // Stop recording — must close page/context before reading video path
    const videoPath = await page.video()?.path();
    await page.close();
    await context.close();

    // Read video as base64
    let videoBase64: string | undefined;
    if (videoPath && fs.existsSync(videoPath)) {
      try {
        const videoBuf = fs.readFileSync(videoPath);
        videoBase64 = videoBuf.toString("base64");
        const sizeKb = Math.round(videoBuf.length / 1024);
        logs.push(`📹 Video captured (${sizeKb}KB)`);
        // Clean up temp file
        fs.unlinkSync(videoPath);
      } catch {
        logs.push("⚠ Could not read video file.");
      }
    }

    const slug = (testTitle || "test").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, "");

    return {
      status: hasFailed ? "error" : "passed",
      summary: hasFailed
        ? (errorMessage || "Test failed.")
        : "Test executed successfully with local headless Chromium.",
      logs,
      screenshotBase64,
      failureScreenshotBase64,
      videoBase64,
      videoName: `${slug}.webm`,
      durationMs: Date.now() - start,
      stepResults,
      failingStep,
      errorMessage,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown local run error.";
    logs.push(`Error: ${message}`);

    // Try to close context even on error so video gets flushed
    try { await context?.close(); } catch { /* ignore */ }

    return {
      status: "error",
      summary: message,
      logs,
      durationMs: Date.now() - start,
      stepResults: [],
      errorMessage: message,
    };
  } finally {
    try { await browser?.close(); } catch { /* ignore */ }
  }
}

// ── Step Executor ─────────────────────────────────────────────

async function executeSteps(
  page: Page,
  steps: ScriptStep[],
  targetBaseUrl: string,
  logs: string[],
): Promise<{
  screenshotBase64?: string;
  failureScreenshotBase64?: string;
  stepResults: StepResult[];
  failingStep?: string;
  errorMessage?: string;
}> {
  let screenshotBase64: string | undefined;
  let failureScreenshotBase64: string | undefined;
  let failingStep: string | undefined;
  let errorMessage: string | undefined;
  const stepResults: StepResult[] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepStart = Date.now();
    const label = labelForStep(step);
    logs.push(`[Step ${i + 1}] ${label}`);

    try {
      await runSingleStep(page, step, targetBaseUrl);
      logs.push(`  ✓ ${label}`);
      stepResults.push({
        index: i + 1,
        action: step.action,
        label,
        status: "passed",
        durationMs: Date.now() - stepStart,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logs.push(`  ✗ ${label} — ${msg}`);

      failingStep = `${step.action}: ${"selector" in step ? step.selector : "text" in step ? step.text : "url" in step ? step.url : step.name}`;
      errorMessage = msg;

      stepResults.push({
        index: i + 1,
        action: step.action,
        label,
        status: "failed",
        durationMs: Date.now() - stepStart,
        error: msg,
      });

      // Inject red highlight around the failing element, then capture failure screenshot
      failureScreenshotBase64 = await captureFailureScreenshot(page, step, logs);

      // Mark remaining steps as skipped
      for (let j = i + 1; j < steps.length; j++) {
        stepResults.push({
          index: j + 1,
          action: steps[j].action,
          label: labelForStep(steps[j]),
          status: "skipped",
          durationMs: 0,
        });
      }
      break; // stop execution on first failure
    }
  }

  // Final screenshot if test passed and no screenshot step was run
  if (!screenshotBase64 && !failureScreenshotBase64) {
    try {
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(400);
      const buf = await page.screenshot({ fullPage: true });
      screenshotBase64 = buf.toString("base64");
      logs.push(`Final screenshot captured (${Math.round(buf.length / 1024)}KB)`);
    } catch { /* ignore */ }
  }

  return { screenshotBase64, failureScreenshotBase64, stepResults, failingStep, errorMessage };
}

// ── Single Step Runner ────────────────────────────────────────

async function runSingleStep(page: Page, step: ScriptStep, targetBaseUrl: string) {
  switch (step.action) {
    case "goto": {
      const url = resolveUrl(step.url, targetBaseUrl);
      await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
      break;
    }
    case "click": {
      await page.locator(step.selector).first().click({ timeout: 10_000 });
      break;
    }
    case "fill": {
      await page.locator(step.selector).first().fill(step.value, { timeout: 10_000 });
      break;
    }
    case "expectVisible": {
      await page.locator(step.selector).first().waitFor({ state: "visible", timeout: 10_000 });
      break;
    }
    case "expectText": {
      await page.getByText(step.text, { exact: false }).first().waitFor({ state: "visible", timeout: 10_000 });
      break;
    }
    case "screenshot": {
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(400);
      // screenshot steps are handled at caller level; just wait here
      break;
    }
  }
}

// ── Failure Highlight + Screenshot ───────────────────────────

async function captureFailureScreenshot(
  page: Page,
  failedStep: ScriptStep,
  logs: string[],
): Promise<string | undefined> {
  try {
    // Inject red outline + error label onto the failing element
    if (failedStep.action === "expectVisible" || failedStep.action === "click" || failedStep.action === "fill") {
      const selector = (failedStep as { selector: string }).selector;
      await page.evaluate((sel: string) => {
        const el = document.querySelector(sel) as HTMLElement | null;
        if (el) {
          el.style.outline = "4px solid #ef4444";
          el.style.outlineOffset = "2px";
          el.style.boxShadow = "0 0 0 8px rgba(239,68,68,0.2)";
          // Inject floating error label
          const label = document.createElement("div");
          label.setAttribute("data-pw-error", "true");
          label.style.cssText = `
            position: fixed;
            top: 16px;
            left: 50%;
            transform: translateX(-50%);
            background: #ef4444;
            color: white;
            font-family: monospace;
            font-size: 13px;
            font-weight: bold;
            padding: 8px 16px;
            border-radius: 6px;
            z-index: 999999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            white-space: nowrap;
          `;
          label.textContent = `✗ Element not found: ${sel}`;
          document.body.appendChild(label);
        } else {
          // Element doesn't exist at all — inject page-level error banner
          const banner = document.createElement("div");
          banner.setAttribute("data-pw-error", "true");
          banner.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0;
            background: #ef4444;
            color: white;
            font-family: monospace;
            font-size: 14px;
            font-weight: bold;
            padding: 12px 24px;
            z-index: 999999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          `;
          banner.textContent = `✗ ASSERTION FAILED — Element not found: ${sel}`;
          document.body.appendChild(banner);
        }
      }, selector);
    } else if (failedStep.action === "expectText") {
      const text = (failedStep as { text: string }).text;
      await page.evaluate((t: string) => {
        const banner = document.createElement("div");
        banner.setAttribute("data-pw-error", "true");
        banner.style.cssText = `
          position: fixed;
          top: 0; left: 0; right: 0;
          background: #ef4444;
          color: white;
          font-family: monospace;
          font-size: 14px;
          font-weight: bold;
          padding: 12px 24px;
          z-index: 999999;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        `;
        banner.textContent = `✗ ASSERTION FAILED — Text not found: "${t}"`;
        document.body.appendChild(banner);
      }, text);
    }

    await page.waitForTimeout(200); // let the DOM update render
    const buf = await page.screenshot({ fullPage: true });
    const b64 = buf.toString("base64");
    logs.push(`🔴 Failure screenshot captured with highlight (${Math.round(buf.length / 1024)}KB)`);
    return b64;
  } catch (e) {
    logs.push(`⚠ Could not capture failure screenshot: ${e instanceof Error ? e.message : e}`);
    return undefined;
  }
}

// ── Helpers ───────────────────────────────────────────────────

function labelForStep(step: ScriptStep): string {
  switch (step.action) {
    case "goto":          return `Navigate to ${step.url}`;
    case "click":         return `Click ${step.selector}`;
    case "fill":          return `Fill ${step.selector} with "${step.value}"`;
    case "expectVisible": return `Assert visible: ${step.selector}`;
    case "expectText":    return `Assert text: "${step.text}"`;
    case "screenshot":    return `Screenshot: ${step.name}`;
    default:              return `${(step as { action: string }).action}`;
  }
}

function resolveUrl(route: string, baseUrl: string): string {
  let pathAndQuery = route;
  if (route.startsWith("http://") || route.startsWith("https://")) {
    try {
      const parsed = new URL(route);
      pathAndQuery = parsed.pathname + parsed.search + parsed.hash;
    } catch {
      // If parsing fails, just use the original string as path
    }
  }
  
  const base = baseUrl.replace(/\/+$/, "");
  const p = pathAndQuery.startsWith("/") ? pathAndQuery : `/${pathAndQuery}`;
  return `${base}${p}`;
}

function findChromium(): string | undefined {
  if (process.platform === "win32") {
    const paths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    ];
    return paths.find((p) => fs.existsSync(p));
  }
  if (process.platform === "darwin") {
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  }
  return undefined;
}
