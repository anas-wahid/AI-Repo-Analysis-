import type { GeneratedScript, TestStep } from "@/lib/ai-testing";

export type BrowserRunResult = {
  status: "passed" | "failed" | "skipped" | "queued";
  summary: string;
  sessionId?: string;
  liveUrl?: string;
  logs: string[];
};

export async function runInBrowserbase(input: {
  generatedScript: GeneratedScript;
  targetBaseUrl?: string;
}): Promise<BrowserRunResult> {
  const apiKey = process.env.BROWSERBASE_API_KEY;
  const projectId = process.env.BROWSERBASE_PROJECT_ID;
  const targetBaseUrl = input.targetBaseUrl || process.env.TARGET_BASE_URL;

  if (!apiKey || !projectId) {
    return {
      status: "skipped",
      summary: "Browserbase credentials are not configured yet.",
      logs: [
        "Set BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID in .env.local.",
        "The app can still analyze repos and generate test cases/scripts without Browserbase.",
      ],
    };
  }

  if (!targetBaseUrl) {
    return {
      status: "skipped",
      summary: "TARGET_BASE_URL is missing.",
      logs: ["Set TARGET_BASE_URL to the deployed app URL Browserbase should test."],
    };
  }

  try {
    const { chromium } = await import("playwright-core");
    const session = await createBrowserbaseSession(apiKey, projectId);
    const logs = [`Created Browserbase session ${session.id}`];
    const browser = await chromium.connectOverCDP(
      `wss://connect.browserbase.com?apiKey=${encodeURIComponent(apiKey)}&sessionId=${encodeURIComponent(session.id)}`,
    );

    try {
      const context = browser.contexts()[0] ?? (await browser.newContext());
      const page = context.pages()[0] ?? (await context.newPage());

      page.on("console", (message) => logs.push(`console.${message.type()}: ${message.text()}`));
      page.on("pageerror", (error) => logs.push(`pageerror: ${error.message}`));

      for (const step of input.generatedScript.steps) {
        await runStep(page, step, targetBaseUrl, logs);
      }

      return {
        status: "passed",
        summary: `Completed ${input.generatedScript.steps.length} Browserbase step(s).`,
        sessionId: session.id,
        liveUrl: session.debuggerFullscreenUrl,
        logs,
      };
    } finally {
      await browser.close().catch(() => undefined);
    }
  } catch (error) {
    return {
      status: "failed",
      summary: "Browserbase execution failed.",
      logs: [error instanceof Error ? error.message : "Unknown Browserbase error."],
    };
  }
}

async function runStep(page: {
  goto: (url: string, options?: Record<string, unknown>) => Promise<unknown>;
  locator: (selector: string) => {
    first: () => {
      click: (options?: Record<string, unknown>) => Promise<unknown>;
      fill: (value: string, options?: Record<string, unknown>) => Promise<unknown>;
      waitFor: (options?: Record<string, unknown>) => Promise<unknown>;
    };
  };
  getByText: (text: string, options?: Record<string, unknown>) => {
    first: () => { waitFor: (options?: Record<string, unknown>) => Promise<unknown> };
  };
  screenshot: (options?: Record<string, unknown>) => Promise<unknown>;
}, step: TestStep, baseUrl: string, logs: string[]) {
  if (step.action === "goto") {
    const url = step.url.startsWith("http") ? step.url : new URL(step.url || "/", baseUrl).toString();
    logs.push(`goto ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
    return;
  }

  if (step.action === "click") {
    logs.push(`click ${step.selector}`);
    await page.locator(step.selector).first().click({ timeout: 10_000 });
    return;
  }

  if (step.action === "fill") {
    logs.push(`fill ${step.selector}`);
    await page.locator(step.selector).first().fill(step.value, { timeout: 10_000 });
    return;
  }

  if (step.action === "expectVisible") {
    logs.push(`expect visible ${step.selector}`);
    await page.locator(step.selector).first().waitFor({ state: "visible", timeout: 10_000 });
    return;
  }

  if (step.action === "expectText") {
    logs.push(`expect text ${step.text}`);
    await page.getByText(step.text, { exact: false }).first().waitFor({ state: "visible", timeout: 10_000 });
    return;
  }

  if (step.action === "screenshot") {
    logs.push(`screenshot ${step.name}`);
    await page.screenshot({ fullPage: true });
  }
}

async function createBrowserbaseSession(apiKey: string, projectId: string) {
  const response = await fetch("https://api.browserbase.com/v1/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-bb-api-key": apiKey,
    },
    body: JSON.stringify({ projectId }),
  });

  if (!response.ok) {
    throw new Error(`Browserbase session creation failed: ${response.status} ${(await response.text()).slice(0, 300)}`);
  }

  return response.json() as Promise<{ id: string; debuggerFullscreenUrl?: string }>;
}