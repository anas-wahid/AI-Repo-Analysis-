export const env = {
  databaseUrl: process.env.DATABASE_URL,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  githubToken: process.env.GITHUB_TOKEN,
  githubClientId: process.env.GITHUB_CLIENT_ID,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
  githubRedirectUri: process.env.GITHUB_REDIRECT_URI ?? "http://localhost:3000/api/auth/github/callback",
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  browserbaseApiKey: process.env.BROWSERBASE_API_KEY,
  browserbaseProjectId: process.env.BROWSERBASE_PROJECT_ID,
  targetBaseUrl: process.env.TARGET_BASE_URL || "http://localhost:3000",
};


export type IntegrationStatus = {
  name: string;
  key: string;
  configured: boolean;
  required: boolean;
};

export function getIntegrationStatuses(): IntegrationStatus[] {
  return [
    { name: "Neon Database", key: "DATABASE_URL", configured: Boolean(env.databaseUrl), required: true },
    { name: "GitHub Token", key: "GITHUB_TOKEN", configured: Boolean(env.githubToken), required: false },
    { name: "OpenAI API", key: "OPENAI_API_KEY", configured: Boolean(env.openaiApiKey), required: false },
    { name: "Browserbase", key: "BROWSERBASE_API_KEY", configured: Boolean(env.browserbaseApiKey && env.browserbaseProjectId), required: false },
  ];
}

export function getMissingServerEnv() {
  return [["DATABASE_URL", env.databaseUrl]]
    .filter(([, value]) => !value)
    .map(([key]) => key);
}
