# Day 1: Foundation Layer

This layer creates the base Next.js application and database foundation for the AI Testing Automation Agent.

## Completed

- Next.js App Router project with TypeScript
- Day 1 dashboard
- Neon database environment template
- Drizzle ORM config
- Initial schema for users, repositories, files, test cases, scripts, runs, Browserbase sessions, and AI messages
- Health route at `/api/health`

## Environment

Create `.env.local` from `.env.example`:

```env
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Commands

```powershell
npm.cmd install
npm.cmd run db:generate
npm.cmd run db:migrate
npm.cmd run dev
```

Open:

```text
http://localhost:3000
```

## Day 1 Acceptance Criteria

- App starts with `npm.cmd run dev`
- Dashboard renders the five build layers
- `/api/health` returns app and environment status
- Drizzle can generate migrations from `src/db/schema.ts`
- Neon migration runs after `DATABASE_URL` is configured
