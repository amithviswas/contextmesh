// ── Core domain types for ContextMesh ──────────────────

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  description?: string | null;
  created_at: string;
  // joined count from query
  context_item_count?: number;
}

export interface ContextItem {
  id: string;
  project_id: string;
  source: 'github' | 'slack' | 'jira' | 'linear' | 'manual';
  type: 'decision' | 'architecture' | 'blocker' | 'meeting_note' | 'note';
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
  indexed_at?: string | null;
  // joined
  project_name?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'team';
  created_at: string;
}

export interface Membership {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

// ── API response shapes ───────────────────────────────

export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ── Search result ─────────────────────────────────────

export interface SearchResult extends ContextItem {
  similarity: number;
}

// ── Context type labels ───────────────────────────────

export const CONTEXT_TYPE_LABELS: Record<ContextItem['type'], string> = {
  decision:     'Decision',
  architecture: 'Architecture',
  blocker:      'Blocker',
  meeting_note: 'Meeting Note',
  note:         'Note',
};

export const SOURCE_LABELS: Record<ContextItem['source'], string> = {
  manual:  'Manual',
  github:  'GitHub',
  slack:   'Slack',
  jira:    'Jira',
  linear:  'Linear',
};

export const SOURCE_COLORS: Record<ContextItem['source'], string> = {
  manual:  '#00D4B4',
  github:  '#6e40c9',
  slack:   '#E01E5A',
  jira:    '#0052CC',
  linear:  '#5E6AD2',
};
