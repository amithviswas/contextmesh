-- ContextMesh — Initial Database Schema
-- Run this in Supabase SQL Editor

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

-- ─── Workspaces ───────────────────────────────────────────────────────────────
CREATE TABLE workspaces (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  plan       TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Memberships (Users ↔ Workspaces) ─────────────────────────────────────────
CREATE TABLE memberships (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, workspace_id)
);

-- ─── Projects ─────────────────────────────────────────────────────────────────
CREATE TABLE projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Context Items (the core data) ────────────────────────────────────────────
CREATE TABLE context_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  source     TEXT NOT NULL CHECK (source IN ('github', 'slack', 'jira', 'linear', 'manual')),
  type       TEXT NOT NULL CHECK (type IN ('commit', 'pr', 'message', 'issue', 'decision', 'architecture', 'blocker')),
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  metadata   JSONB NOT NULL DEFAULT '{}',
  embedding  VECTOR(384),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  indexed_at TIMESTAMPTZ
);

-- Similarity search index (IVFFlat for ANN)
CREATE INDEX ON context_items USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ─── Integrations ─────────────────────────────────────────────────────────────
CREATE TABLE integrations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider     TEXT NOT NULL CHECK (provider IN ('github', 'slack', 'jira', 'linear')),
  config       JSONB NOT NULL DEFAULT '{}',
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, provider)
);

-- ─── Queries (history + analytics) ───────────────────────────────────────────
CREATE TABLE queries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID REFERENCES projects(id) ON DELETE SET NULL,
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  question     TEXT NOT NULL,
  answer       TEXT,
  context_used JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE workspaces    ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships   ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects      ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries       ENABLE ROW LEVEL SECURITY;

-- Workspaces: users see only their own workspaces
CREATE POLICY "users_see_own_workspaces" ON workspaces
  FOR ALL USING (
    id IN (SELECT workspace_id FROM memberships WHERE user_id = auth.uid())
  );

-- Memberships: members see their own memberships
CREATE POLICY "users_see_own_memberships" ON memberships
  FOR ALL USING (user_id = auth.uid());

-- Projects: workspace members see workspace projects
CREATE POLICY "members_see_workspace_projects" ON projects
  FOR ALL USING (
    workspace_id IN (SELECT workspace_id FROM memberships WHERE user_id = auth.uid())
  );

-- Context items: workspace members see project items
CREATE POLICY "members_see_context_items" ON context_items
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE workspace_id IN (
        SELECT workspace_id FROM memberships WHERE user_id = auth.uid()
      )
    )
  );

-- Integrations: workspace members see integrations
CREATE POLICY "members_see_integrations" ON integrations
  FOR ALL USING (
    workspace_id IN (SELECT workspace_id FROM memberships WHERE user_id = auth.uid())
  );

-- Queries: user sees their own queries
CREATE POLICY "users_see_own_queries" ON queries
  FOR ALL USING (user_id = auth.uid());

-- ─── Semantic Search RPC ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION search_context(
  query_embedding VECTOR(384),
  match_project_id UUID,
  match_count INT DEFAULT 8
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  source TEXT,
  type TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ci.id,
    ci.title,
    ci.content,
    ci.source,
    ci.type,
    1 - (ci.embedding <=> query_embedding) AS similarity
  FROM context_items ci
  WHERE ci.project_id = match_project_id
    AND ci.embedding IS NOT NULL
  ORDER BY ci.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
