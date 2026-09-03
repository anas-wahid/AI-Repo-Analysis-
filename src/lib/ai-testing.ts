import type { RepositoryAnalysis } from "@/lib/github";

export type AIConversationTurn = {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: string;
};

export type AIConversationMeta = {
  model: string;
  durationMs: number;
  endpoint: string;
  turns: AIConversationTurn[];
  isFallback: boolean;
};

export type TestCase = {
  id: string;
  databaseId?: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  targetRoute: string;
  assertions: string[];
};

export type TestStep =
  | { action: "goto"; url: string }
  | { action: "click"; selector: string }
  | { action: "fill"; selector: string; value: string }
  | { action: "expectVisible"; selector: string }
  | { action: "expectText"; selector: string; text: string }
  | { action: "screenshot"; name: string };

export type TestCasesResult = {
  testCases: TestCase[];
  aiConversation: AIConversationMeta[];
};

export type GeneratedScript = {
  title: string;
  framework: "playwright";
  script: string;
  steps: TestStep[];
};

export type ScriptResult = {
  generatedScript: GeneratedScript;
  aiConversation: AIConversationMeta[];
};

export async function generateTestCases(analysis: RepositoryAnalysis): Promise<TestCasesResult> {
  if (!process.env.OPENAI_API_KEY && !process.env.NVIDIA_API_KEY) {
    return {
      testCases: fallbackTestCases(analysis),
      aiConversation: [{
        model: "fallback (no API key)",
        durationMs: 0,
        endpoint: "local",
        isFallback: true,
        turns: [
          { role: "system", content: "No AI API key configured. Using deterministic fallback test generation.", timestamp: new Date().toISOString() },
          { role: "assistant", content: "Generated fallback test cases based on repository structure analysis.", timestamp: new Date().toISOString() },
        ],
      }],
    };
  }


  try {
    const { parsed, conversation } = await callOpenAI({
      instructions:
        "Generate practical browser test cases for this repository. Focus on routes, forms, navigation, loading, error states, and user-visible behavior. Return JSON only.",
      schemaName: "test_cases",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          testCases: {
            type: "array",
            minItems: 2,
            maxItems: 4,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                priority: { type: "string", enum: ["low", "medium", "high"] },
                targetRoute: { type: "string" },
                assertions: { type: "array", items: { type: "string" } },
              },
              required: ["title", "description", "priority", "targetRoute", "assertions"],
            },
          },
        },
        required: ["testCases"],
      },
      input: {
        repository: analysis.repository,
        stack: analysis.stack,
        selectedFiles: analysis.selectedFiles.slice(0, 5).map((file) => ({
          path: file.path,
          language: file.language,
          reason: file.reason,
          contentPreview: file.contentPreview?.slice(0, 1000),
        })),
      },
    });

    return {
      testCases: normalizeCases(parsed.testCases as Record<string, unknown>[]),
      aiConversation: [conversation],
    };
  } catch (error) {
    return {
      testCases: fallbackTestCases(analysis),
      aiConversation: [{
        model: "fallback (error)",
        durationMs: 0,
        endpoint: "local",
        isFallback: true,
        turns: [
          { role: "system", content: "AI call failed. Using deterministic fallback.", timestamp: new Date().toISOString() },
          { role: "assistant", content: `Error: ${error instanceof Error ? error.message : "Unknown error"}. Fell back to rule-based test generation.`, timestamp: new Date().toISOString() },
        ],
      }],
    };
  }
}

export async function generatePlaywrightScript(input: {
  analysis?: RepositoryAnalysis;
  testCase: TestCase;
}): Promise<ScriptResult> {
  if (!process.env.OPENAI_API_KEY && !process.env.NVIDIA_API_KEY) {
    return {
      generatedScript: fallbackScript(input.testCase),
      aiConversation: [{
        model: "fallback (no API key)",
        durationMs: 0,
        endpoint: "local",
        isFallback: true,
        turns: [
          { role: "system", content: "No AI API key configured. Using deterministic fallback script generation.", timestamp: new Date().toISOString() },
          { role: "assistant", content: "Generated a basic Playwright script based on the test case definition.", timestamp: new Date().toISOString() },
        ],
      }],
    };
  }


  try {
    const { parsed, conversation } = await callOpenAI({
      instructions:
        "Generate a safe Playwright-style script and structured steps for Browserbase execution. Only use step actions: goto, click, fill, expectVisible, expectText, screenshot. Do not include shell commands, filesystem access, arbitrary Node APIs, or secrets.",
      schemaName: "playwright_script",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          script: { type: "string" },
          steps: {
            type: "array",
            minItems: 2,
            maxItems: 12,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                action: {
                  type: "string",
                  enum: ["goto", "click", "fill", "expectVisible", "expectText", "screenshot"],
                },
                url: { type: "string" },
                selector: { type: "string" },
                value: { type: "string" },
                text: { type: "string" },
                name: { type: "string" },
              },
              required: ["action"],
            },
          },
        },
        required: ["title", "script", "steps"],
      },
      input: {
        repository: input.analysis?.repository,
        stack: input.analysis?.stack,
        testCase: input.testCase,
        selectedFiles: input.analysis?.selectedFiles?.slice(0, 8) ?? [],
      },
    });

    return {
      generatedScript: {
        title: String(parsed.title || input.testCase.title),
        framework: "playwright",
        script: String(parsed.script || fallbackScript(input.testCase).script),
        steps: normalizeSteps(parsed.steps as TestStep[]),
      },
      aiConversation: [conversation],
    };
  } catch {
    return {
      generatedScript: fallbackScript(input.testCase),
      aiConversation: [{
        model: "fallback (error)",
        durationMs: 0,
        endpoint: "local",
        isFallback: true,
        turns: [
          { role: "system", content: "AI call failed. Using deterministic fallback.", timestamp: new Date().toISOString() },
          { role: "assistant", content: "Fell back to rule-based Playwright script generation.", timestamp: new Date().toISOString() },
        ],
      }],
    };
  }
}

async function callOpenAI(input: {
  instructions: string;
  schemaName: string;
  schema: Record<string, unknown>;
  input: unknown;
}): Promise<{ parsed: Record<string, unknown>; conversation: AIConversationMeta }> {
  const isNvidia = Boolean(process.env.NVIDIA_API_KEY);
  const apiKey = process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY;
  const endpoint = isNvidia 
    ? "https://integrate.api.nvidia.com/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";
  const model = isNvidia
    ? (process.env.NVIDIA_MODEL || "meta/llama-3.1-70b-instruct")
    : (process.env.OPENAI_MODEL || "gpt-4o-mini");

  const systemPrompt = `${input.instructions}
You must return a valid JSON object that exactly matches this schema:
${JSON.stringify(input.schema, null, 2)}`;

  const userContent = JSON.stringify(input.input);
  const callTimestamp = new Date().toISOString();

  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000); // 25s timeout

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 1024,
    }),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      response.status === 429
        ? "AI API rate limit exceeded. Please try again later."
        : response.status === 401
        ? "AI API authentication failed. Check your API key."
        : `AI API error (${response.status}).`,
    );
  }

  const json = await response.json();
  const text = json.choices?.[0]?.message?.content;
  const durationMs = Date.now() - start;

  if (!text) throw new Error("No AI output text.");

  let cleanText = text.trim();
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleanText);
  } catch (e) {
    throw new Error("AI returned invalid JSON: " + cleanText);
  }

  const conversation: AIConversationMeta = {
    model,
    durationMs,
    endpoint: isNvidia ? "NVIDIA NIM" : "OpenAI",
    isFallback: false,
    turns: [
      { role: "system", content: systemPrompt, timestamp: callTimestamp },
      { role: "user", content: userContent, timestamp: callTimestamp },
      { role: "assistant", content: cleanText, timestamp: new Date().toISOString() },
    ],
  };

  return { parsed, conversation };
}



function fallbackTestCases(analysis: RepositoryAnalysis): TestCase[] {
  const routes = inferRoutes(analysis);
  return normalizeCases([
    {
      title: "Homepage renders",
      description: "Verify the app opens and visible page content is available.",
      priority: "high",
      targetRoute: routes[0] || "/",
      assertions: ["Page loads", "Body content is visible", "No immediate browser crash"],
    },
    {
      title: "Navigation remains usable",
      description: "Verify the primary route can load and remain interactive.",
      priority: "medium",
      targetRoute: routes[0] || "/",
      assertions: ["Route opens", "Main page body is visible"],
    },
    {
      title: "Missing route is stable",
      description: "Verify an unknown route does not break the browser session.",
      priority: "medium",
      targetRoute: "/missing-test-route",
      assertions: ["Page returns a stable response", "Body remains visible"],
    },
  ]);
}

function fallbackScript(testCase: TestCase): GeneratedScript {
  const route = testCase.targetRoute || "/";
  const name = slug(testCase.title);
  const script = `test(${JSON.stringify(testCase.title)}, async ({ page }) => {
  await page.goto(${JSON.stringify(route)});
  await expect(page.locator("body")).toBeVisible();
  await page.screenshot({ path: ${JSON.stringify(`${name}.png`)}, fullPage: true });
});`;

  return {
    title: testCase.title,
    framework: "playwright",
    script,
    steps: [
      { action: "goto", url: route },
      { action: "expectVisible", selector: "body" },
      { action: "screenshot", name },
    ],
  };
}

function inferRoutes(analysis: RepositoryAnalysis) {
  const routes = new Set<string>(["/"]);
  for (const file of analysis.selectedFiles) {
    const appMatch = file.path.match(/(?:^|\/)app\/(.+?)\/page\.(tsx|jsx|ts|js)$/);
    const pageMatch = file.path.match(/(?:^|\/)pages\/(.+?)\.(tsx|jsx|ts|js)$/);
    if (appMatch) routes.add(`/${appMatch[1].replace(/\/page$/, "")}`);
    if (pageMatch) routes.add(`/${pageMatch[1].replace(/\/index$/, "")}`);
  }
  return [...routes].map((route) => route.replace(/\/+/g, "/"));
}

function normalizeCases(items: Record<string, unknown>[]): TestCase[] {
  return items.slice(0, 8).map((item, index) => {
    const p = String(item.priority ?? "");
    return {
      id: `tc-${Date.now()}-${index}`,
      title: String(item.title || `Generated test ${index + 1}`),
      description: String(item.description || ""),
      priority: (p === "high" || p === "low" ? p : "medium") as TestCase["priority"],
      targetRoute: String(item.targetRoute || "/"),
      assertions: Array.isArray(item.assertions) ? (item.assertions as unknown[]).map(String).slice(0, 6) : [],
    };
  });
}


function normalizeSteps(items: TestStep[]) {
  if (!Array.isArray(items)) return [];
  return items.filter((step) => step && typeof step.action === "string").slice(0, 12);
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "test";
}

/* ── Natural Language Test Creation ────────────────────────── */

export type NLTestResult = {
  testCase: TestCase;
  aiConversation: AIConversationMeta[];
};

export async function generateTestFromPrompt(input: {
  prompt: string;
  analysis?: RepositoryAnalysis;
}): Promise<NLTestResult> {
  if (!process.env.OPENAI_API_KEY && !process.env.NVIDIA_API_KEY) {
    // Fallback: parse intent from prompt
    const tc: TestCase = {
      id: `tc-nl-${Date.now()}`,
      title: input.prompt.slice(0, 80),
      description: input.prompt,
      priority: "medium",
      targetRoute: "/",
      assertions: ["Page loads successfully", "Expected content is visible"],
    };
    return {
      testCase: tc,
      aiConversation: [{
        model: "fallback (no API key)",
        durationMs: 0,
        endpoint: "local",
        isFallback: true,
        turns: [
          { role: "system", content: "No AI API key configured. Created a basic test case from your description.", timestamp: new Date().toISOString() },
          { role: "assistant", content: JSON.stringify(tc, null, 2), timestamp: new Date().toISOString() },
        ],
      }],
    };
  }

  try {
    const { parsed, conversation } = await callOpenAI({
      instructions:
        "You are a QA test case generator. The user will describe a test in plain English. Convert it into a structured browser test case. Infer the target route, priority, and assertions from the description. Return JSON only.",
      schemaName: "single_test_case",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          targetRoute: { type: "string" },
          assertions: { type: "array", items: { type: "string" } },
        },
        required: ["title", "description", "priority", "targetRoute", "assertions"],
      },
      input: {
        userPrompt: input.prompt,
        ...(input.analysis
          ? {
              repository: input.analysis.repository,
              stack: input.analysis.stack,
              routes: input.analysis.selectedFiles
                .filter((f) => /page\.(tsx|jsx|ts|js)$/.test(f.path))
                .map((f) => f.path)
                .slice(0, 10),
            }
          : {}),
      },
    });

    const cases = normalizeCases([parsed]);
    return {
      testCase: cases[0],
      aiConversation: [conversation],
    };
  } catch (error) {
    // Fallback on error
    const tc: TestCase = {
      id: `tc-nl-${Date.now()}`,
      title: input.prompt.slice(0, 80),
      description: input.prompt,
      priority: "medium",
      targetRoute: "/",
      assertions: ["Page loads successfully"],
    };
    return {
      testCase: tc,
      aiConversation: [{
        model: "fallback (error)",
        durationMs: 0,
        endpoint: "local",
        isFallback: true,
        turns: [
          { role: "system", content: `AI call failed: ${error instanceof Error ? error.message : "Unknown error"}. Created basic test case from description.`, timestamp: new Date().toISOString() },
          { role: "assistant", content: JSON.stringify(tc, null, 2), timestamp: new Date().toISOString() },
        ],
      }],
    };
  }
}