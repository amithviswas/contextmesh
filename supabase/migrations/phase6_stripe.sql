-- Phase 6 Migration: add stripe_customer_id to workspaces
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wxhjqhgelnimtwpphjoz/sql/new

ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT,
  ADD COLUMN IF NOT EXISTS plan_period_end TIMESTAMPTZ;
