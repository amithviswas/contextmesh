// Client-side fetch helpers that call our API routes

import type { Project, ContextItem, SearchResult, ApiResponse } from '@/types';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) {
    return { data: null, error: json.error ?? 'Unknown error', code: String(res.status) };
  }
  return { data: json.data, error: null };
}

// ── Projects ──────────────────────────────────────────

export const projectsApi = {
  list: () => apiFetch<Project[]>('/api/projects'),

  create: (body: { name: string; description?: string }) =>
    apiFetch<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  get: (id: string) => apiFetch<Project>(`/api/projects/${id}`),

  delete: (id: string) =>
    apiFetch<{ id: string }>(`/api/projects/${id}`, { method: 'DELETE' }),
};

// ── Context items ─────────────────────────────────────

export const contextApi = {
  ingest: (body: {
    project_id: string;
    source?: ContextItem['source'];
    type: ContextItem['type'];
    title: string;
    content: string;
    metadata?: Record<string, unknown>;
  }) =>
    apiFetch<ContextItem>('/api/context/ingest', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  get: (id: string) => apiFetch<ContextItem>(`/api/context/${id}`),

  delete: (id: string) =>
    apiFetch<{ id: string }>(`/api/context/${id}`, { method: 'DELETE' }),

  search: (body: { project_id: string; query: string; limit?: number }) =>
    apiFetch<SearchResult[]>('/api/context/search', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

// ── Integrations ───────────────────────────────────────

import type { Integration } from '@/types';

export const integrationsApi = {
  list: () => apiFetch<Integration[]>('/api/integrations'),

  disconnect: (provider: 'github' | 'slack') =>
    apiFetch<{ disconnected: boolean }>(
      `/api/integrations/${provider}/disconnect`,
      { method: 'POST' }
    ),
};

// ── Queries ─────────────────────────────────────────────

import type { Query } from '@/types';

export const queryApi = {
  /** Returns raw Response — caller reads the SSE stream */
  ask: (body: { project_id: string; question: string }): Promise<Response> =>
    fetch('/api/context/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  list: (projectId?: string, limit = 10) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (projectId) params.set('project_id', projectId);
    return apiFetch<Query[]>(`/api/context/queries?${params}`);
  },
};


