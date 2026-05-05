-- Phase 4 Migration: queries table
-- Run in Supabase SQL editor:
-- https://supabase.com/dashboard/project/wxhjqhgelnimtwpphjoz/sql/new

CREATE TABLE IF NOT EXISTS queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  question TEXT NOT NULL,
  answer TEXT,
  context_used UUID[] DEFAULT '{}',
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own workspace queries"
  ON queries FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "users can insert own queries"
  ON queries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users can update own queries"
  ON queries FOR UPDATE
  USING (user_id = auth.uid());
