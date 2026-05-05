-- Phase 5 Migration: invites table + onboarding column
-- Run in Supabase SQL editor:
-- https://supabase.com/dashboard/project/wxhjqhgelnimtwpphjoz/sql/new

CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace members manage invites"
  ON invites FOR ALL
  USING (workspace_id IN (
    SELECT workspace_id FROM memberships WHERE user_id = auth.uid()
  ));

ALTER TABLE memberships
  ADD COLUMN IF NOT EXISTS onboarding_completed_steps TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS display_name TEXT;
