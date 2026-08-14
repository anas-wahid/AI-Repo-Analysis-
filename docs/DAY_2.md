# Day 2: GitHub Repository Layer

This layer connects the app to GitHub repository analysis.

## Completed

- GitHub repository URL form on the dashboard
- `POST /api/repos/analyze`
- GitHub URL validation for HTTPS and SSH-style GitHub URLs
- Repository metadata fetch
- Recursive file tree fetch
- Stack detection signals for Next.js, React, Playwright, and Drizzle
- Relevant file selection for config, routes, source, components, and tests
- File content previews for small selected files
- Optional Neon persistence for repositories and selected files

## Optional Environment

Public repositories work without a token. For private repositories or higher API limits:

```env
GITHUB_TOKEN="github_pat_..."
```

For persistence:

```env
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
```

## API

```http
POST /api/repos/analyze
Content-Type: application/json

{
  "repoUrl": "https://github.com/vercel/next.js",
  "branch": "canary"
}
```

## Acceptance Criteria

- A GitHub URL can be submitted from the dashboard
- Repo metadata is displayed
- File tree count is displayed
- Relevant source/config/test files are selected
- Small file previews are shown
- Neon save is attempted when `DATABASE_URL` is configured

## Day 3 Input

Day 3 will send `selectedFiles` to AI to generate structured test cases.
