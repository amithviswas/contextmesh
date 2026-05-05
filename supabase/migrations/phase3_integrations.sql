-- Phase 3 Migration: integrations table
-- Run this in your Supabase SQL editor:
-- https://supabase.com/dashboard/project/wxhjqhgelnimtwpphjoz/sql/new

CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('github', 'slack', 'jira', 'linear')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'error', 'disconnected')),
  access_token_encrypted TEXT,
  config JSONB DEFAULT '{}',
  items_synced INT DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, provider)
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace members can manage integrations"
  ON integrations FOR ALL
  USING (workspace_id IN (
    SELECT workspace_id FROM memberships WHERE user_id = auth.uid()
  ));
