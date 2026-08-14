import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const testRunStatus = pgEnum("test_run_status", [
  "queued",
  "running",
  "passed",
  "failed",
  "cancelled",
]);

export const testPriority = pgEnum("test_priority", ["low", "medium", "high"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const repositories = pgTable("repositories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  githubOwner: text("github_owner").notNull(),
  githubRepo: text("github_repo").notNull(),
  defaultBranch: text("default_branch"),
  selectedBranch: text("selected_branch").default("main").notNull(),
  installationId: text("installation_id"),
  lastAnalyzedCommit: text("last_analyzed_commit"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const repositoryFiles = pgTable("repository_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  repositoryId: uuid("repository_id")
    .references(() => repositories.id, { onDelete: "cascade" })
    .notNull(),
  path: text("path").notNull(),
  language: text("language"),
  sizeBytes: integer("size_bytes"),
  contentHash: text("content_hash"),
  selectedForAnalysis: boolean("selected_for_analysis").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const testCases = pgTable("test_cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  repositoryId: uuid("repository_id")
    .references(() => repositories.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: testPriority("priority").default("medium").notNull(),
  targetRoute: text("target_route"),
  generatedByAi: boolean("generated_by_ai").default(true).notNull(),
  sourceMetadata: jsonb("source_metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const testScripts = pgTable("test_scripts", {
  id: uuid("id").primaryKey().defaultRandom(),
  testCaseId: uuid("test_case_id")
    .references(() => testCases.id, { onDelete: "cascade" })
    .notNull(),
  framework: text("framework").default("playwright").notNull(),
  script: text("script").notNull(),
  approved: boolean("approved").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const testRuns = pgTable("test_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  repositoryId: uuid("repository_id")
    .references(() => repositories.id, { onDelete: "cascade" })
    .notNull(),
  status: testRunStatus("status").default("queued").notNull(),
  summary: text("summary"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const browserSessions = pgTable("browser_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  testRunId: uuid("test_run_id")
    .references(() => testRuns.id, { onDelete: "cascade" })
    .notNull(),
  provider: text("provider").default("browserbase").notNull(),
  providerSessionId: text("provider_session_id"),
  status: testRunStatus("status").default("queued").notNull(),
  logsUrl: text("logs_url"),
  recordingUrl: text("recording_url"),
  screenshotUrl: text("screenshot_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const aiMessages = pgTable("ai_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  repositoryId: uuid("repository_id").references(() => repositories.id, {
    onDelete: "cascade",
  }),
  testRunId: uuid("test_run_id").references(() => testRuns.id, {
    onDelete: "set null",
  }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
