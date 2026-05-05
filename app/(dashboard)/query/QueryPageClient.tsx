'use client';

import { useState, useCallback, useEffect } from 'react';
import QueryInput from '@/components/query/QueryInput';
import AnswerStream from '@/components/query/AnswerStream';
import { projectsApi, queryApi } from '@/lib/api';
import { getQueryUsage } from '@/lib/context/usage';
import type { Project, Query, SearchResult } from '@/types';

export default function QueryPage() {
  // ── State ────────────────────────────────────────────────────────────────
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [question, setQuestion] = useState('');
  const [recentQueries, setRecentQueries] = useState<Query[]>([]);

  // SSE state
  const [isLoading, setIsLoading] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<SearchResult[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [usage, setUsage] = useState<{ used: number; limit: number; plan: string } | null>(null);

  // ── Load projects on mount ───────────────────────────────────────────────
  useEffect(() => {
    projectsApi.list().then((res) => {
      if (!res.error && res.data) {
        setProjects(res.data);
        if (res.data.length > 0) setSelectedProjectId(res.data[0].id);
      }
    });
  }, []);

  // ── Load recent queries when project changes ─────────────────────────────
  useEffect(() => {
    if (!selectedProjectId) return;
    queryApi.list(selectedProjectId, 5).then((res) => {
      if (!res.error && res.data) setRecentQueries(res.data);
    });
    // Usage is a server-only call, approximate client-side by calling list count
  }, [selectedProjectId]);

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!question.trim() || !selectedProjectId || isLoading) return;

    const q = question.trim();
    setActiveQuestion(q);
    setAnswer('');
    setSources([]);
    setIsDone(false);
    setErrorMessage(null);
    setTokensUsed(0);
    setIsLoading(true);
    setQuestion('');

    try {
      const response = await queryApi.ask({ project_id: selectedProjectId, question: q });

      if (!response.ok) {
        const json = await response.json();
        if (json.error === 'QUERY_LIMIT_REACHED') {
          setErrorMessage(`Query limit reached (${json.used}/${json.limit}). Upgrade to continue.`);
        } else if (json.error === 'ANTHROPIC_NOT_CONFIGURED') {
          setErrorMessage('ANTHROPIC_NOT_CONFIGURED');
        } else if (json.answer) {
          // Graceful no-context response (200 with answer, no stream)
          setAnswer(json.answer);
          setIsDone(true);
        } else {
          setErrorMessage(json.message ?? json.error ?? 'Something went wrong');
        }
        setIsLoading(false);
        return;
      }

      // Handle non-streaming JSON response (no context case)
      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('text/event-stream')) {
        const json = await response.json();
        if (json.answer) {
          setAnswer(json.answer);
          setSources(json.sources ?? []);
          setIsDone(true);
        }
        setIsLoading(false);
        return;
      }

      // ── Read SSE stream ────────────────────────────────────────────────
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'sources') setSources(event.sources);
            if (event.type === 'token') setAnswer((prev) => prev + event.token);
            if (event.type === 'done') {
              setIsDone(true);
              setTokensUsed(event.tokens_used ?? 0);
              // Refresh recent queries
              queryApi.list(selectedProjectId, 5).then((res) => {
                if (!res.error && res.data) setRecentQueries(res.data);
              });
            }
            if (event.type === 'error') setErrorMessage(event.message);
          } catch { /* malformed SSE line, skip */ }
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [question, selectedProjectId, isLoading]);

  // ── Load a past query ─────────────────────────────────────────────────────
  function handleSelectQuery(q: Query) {
    setActiveQuestion(q.question);
    setAnswer(q.answer ?? '');
    setSources([]);
    setIsDone(true);
    setErrorMessage(null);
    setTokensUsed(q.tokens_used);
    setQuestion(q.question);
  }

  return (
    <div className="page-enter">
      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          AI Query
        </p>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
          Ask ContextMesh
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Natural language questions, answered from your real project context.
        </p>
      </div>

      {/* Two-panel layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.5fr',
          gap: '20px',
          alignItems: 'start',
        }}
        className="query-grid"
      >
        {/* Left panel — Input */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <QueryInput
            projects={projects}
            selectedProjectId={selectedProjectId}
            onProjectChange={setSelectedProjectId}
            question={question}
            onQuestionChange={setQuestion}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            usage={usage}
            recentQueries={recentQueries}
            onSelectQuery={handleSelectQuery}
          />
        </div>

        {/* Right panel — Answer */}
        <div className="card" style={{ padding: '20px 22px', minHeight: '500px' }}>
          <AnswerStream
            isLoading={isLoading}
            question={activeQuestion}
            answer={answer}
            sources={sources}
            isDone={isDone}
            errorMessage={errorMessage}
            tokensUsed={tokensUsed}
          />
        </div>
      </div>
    </div>
  );
}
