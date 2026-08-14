/**
 * AI Error Explainer
 * Takes a failed test run's context and returns a plain-English
 * explanation of what went wrong and how to fix it.
 */

import type { AIConversationMeta } from "@/lib/ai-testing";

export type FailureContext = {
  failingStep: string;        // e.g. 'expectVisible: #root'
  errorMessage: string;       // e.g. 'Assertion failed: "#root" is not visible.'
  targetUrl: string;          // e.g. 'https://example.com'
  logs: string[];             // all execution logs
  testTitle?: string;         // e.g. 'Homepage renders'
};

export type AIErrorExplanation = {
  reason: string;
  possibleCauses: string[];
  confidence: number;
};

export type ErrorExplanationResult = {
  explanation: AIErrorExplanation;
  aiConversation: AIConversationMeta[];
};

/**
 * Calls AI to explain a test failure in plain English.
 * Returns a fallback explanation if AI is not configured or times out.
 */
export async function explainTestFailure(
  ctx: FailureContext,
): Promise<ErrorExplanationResult> {
  const apiKey = process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY;

  // Always attempt a rule-based fallback first so we have something to show
  const fallback = buildFallbackExplanation(ctx);

  if (!apiKey) return {
    explanation: fallback,
    aiConversation: [{
      model: "fallback (no API key)",
      durationMs: 0,
      endpoint: "local",
      isFallback: true,
      turns: [
        { role: "system", content: "No AI API key configured. Using rule-based error analysis.", timestamp: new Date().toISOString() },
        { role: "assistant", content: `Diagnosis: ${fallback.reason}`, timestamp: new Date().toISOString() },
      ],
    }],
  };

  try {
    const isNvidia = Boolean(process.env.NVIDIA_API_KEY);
    const endpoint = isNvidia
      ? "https://integrate.api.nvidia.com/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";
    const model = isNvidia
      ? (process.env.NVIDIA_MODEL || "meta/llama-3.1-70b-instruct")
      : (process.env.OPENAI_MODEL || "gpt-4o-mini");

    const systemPrompt = `You are a browser test debugging assistant. 
A Playwright test has failed. Analyze the failure and respond with a JSON object with exactly these keys:
- "reason": A short sentence (max 10 words) stating the exact technical reason for failure (e.g., "Login button never became clickable.").
- "possibleCauses": An array of 3-4 likely technical causes (e.g., ["API failed", "CSS overlay blocking", "Wrong selector", "Slow backend"]). Keep each under 6 words.
- "confidence": An integer between 50 and 99 representing your confidence in this analysis.

Keep language simple and direct. Do not use markdown. Return only valid JSON.`;

    const userContent = `Test: "${ctx.testTitle || "Browser Test"}"
Target URL: ${ctx.targetUrl}
Failing Step: ${ctx.failingStep}
Error: ${ctx.errorMessage}
Execution Logs:
${ctx.logs.slice(-10).join("\n")}`;

    const callTimestamp = new Date().toISOString();
    const callStart = Date.now();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

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
        max_tokens: 300,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) return {
      explanation: fallback,
      aiConversation: [{
        model, durationMs: Date.now() - callStart, endpoint: isNvidia ? "NVIDIA NIM" : "OpenAI", isFallback: true,
        turns: [
          { role: "system", content: systemPrompt, timestamp: callTimestamp },
          { role: "user", content: userContent, timestamp: callTimestamp },
          { role: "assistant", content: `API returned error. Falling back to rule-based analysis.`, timestamp: new Date().toISOString() },
        ],
      }],
    };

    const json = await response.json();
    const text: string = json.choices?.[0]?.message?.content ?? "";
    const durationMs = Date.now() - callStart;
    if (!text) return {
      explanation: fallback,
      aiConversation: [{
        model, durationMs, endpoint: isNvidia ? "NVIDIA NIM" : "OpenAI", isFallback: true,
        turns: [
          { role: "system", content: systemPrompt, timestamp: callTimestamp },
          { role: "user", content: userContent, timestamp: callTimestamp },
          { role: "assistant", content: "No response content received.", timestamp: new Date().toISOString() },
        ],
      }],
    };

    let clean = text.trim();
    if (clean.startsWith("```")) {
      clean = clean.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    }

    const parsed = JSON.parse(clean) as Partial<AIErrorExplanation>;
    const explanation: AIErrorExplanation = {
      reason: String(parsed.reason || fallback.reason),
      possibleCauses: Array.isArray(parsed.possibleCauses) ? parsed.possibleCauses : fallback.possibleCauses,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : fallback.confidence,
    };

    return {
      explanation,
      aiConversation: [{
        model, durationMs, endpoint: isNvidia ? "NVIDIA NIM" : "OpenAI", isFallback: false,
        turns: [
          { role: "system", content: systemPrompt, timestamp: callTimestamp },
          { role: "user", content: userContent, timestamp: callTimestamp },
          { role: "assistant", content: clean, timestamp: new Date().toISOString() },
        ],
      }],
    };
  } catch {
    return {
      explanation: fallback,
      aiConversation: [{
        model: "fallback (error)", durationMs: 0, endpoint: "local", isFallback: true,
        turns: [
          { role: "system", content: "AI error explanation call failed.", timestamp: new Date().toISOString() },
          { role: "assistant", content: `Fell back to rule-based analysis: ${fallback.reason}`, timestamp: new Date().toISOString() },
        ],
      }],
    };
  }
}

// ── Rule-based fallback (no AI needed) ────────────────────────

function buildFallbackExplanation(ctx: FailureContext): AIErrorExplanation {
  const { failingStep, errorMessage, targetUrl } = ctx;

  if (failingStep.includes("expectVisible") || failingStep.includes("expectText")) {
    const selector = failingStep.split(":").slice(1).join(":").trim();

    if (selector === "#root" && !targetUrl.includes("localhost")) {
      return {
        reason: "Wrong target URL configured.",
        possibleCauses: [
          "Target URL is a static page",
          "React app is running elsewhere",
          "Missing 'localhost' base URL"
        ],
        confidence: 98,
      };
    }

    return {
      reason: `Element "${selector}" never became visible.`,
      possibleCauses: [
        "Selector does not exist in DOM",
        "Element is hidden via CSS",
        "Page didn't load in time",
        "Wrong URL targeted"
      ],
      confidence: 85,
    };
  }

  if (failingStep.includes("goto") || errorMessage.includes("ERR_CONNECTION_REFUSED")) {
    return {
      reason: "Could not reach the target URL.",
      possibleCauses: [
        "Server is not running",
        "Incorrect URL/Port",
        "Network connection blocked",
        "Localhost binding issue"
      ],
      confidence: 95,
    };
  }

  if (failingStep.includes("click")) {
    const selector = failingStep.split(":").slice(1).join(":").trim();
    return {
      reason: `Element "${selector}" could not be clicked.`,
      possibleCauses: [
        "Hidden behind modal/overlay",
        "Element is disabled",
        "Outside visible viewport",
        "Selector matched wrong element"
      ],
      confidence: 90,
    };
  }

  return {
    reason: "Test failed during execution.",
    possibleCauses: [
      "Unexpected JavaScript error",
      "Network timeout",
      "Browser crash",
      "Uncaught exception"
    ],
    confidence: 60,
  };
}
