# Project Status

## Working Now

- GitHub repository analysis
- AI test-case generation with OpenAI when `OPENAI_API_KEY` is set
- Deterministic fallback test generation when no OpenAI key is set
- Playwright-style script generation
- Browserbase execution route
- Neon persistence hooks for repositories, generated test cases, generated scripts, and browser runs
- GitHub PR webhook skeleton at `/api/github/webhook`

## Requires API Keys

```env
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4.1-mini"
BROWSERBASE_API_KEY=""
BROWSERBASE_PROJECT_ID=""
TARGET_BASE_URL="https://your-deployed-app.com"
GITHUB_TOKEN=""
```

## Requires Install

Run after this update:

```powershell
npm.cmd install
```

This installs `playwright-core`, which Browserbase execution needs.
