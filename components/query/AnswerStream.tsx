'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import SourceCard from './SourceCard';
import type { SearchResult } from '@/types';

interface Props {
  isLoading: boolean;
  question: string;
  answer: string;
  sources: SearchResult[];
  isDone: boolean;
  errorMessage: string | null;
  tokensUsed: number;
}

export default function AnswerStream({
  isLoading,
  question,
  answer,
  sources,
  isDone,
  errorMessage,
  tokensUsed,
}: Props) {
  const answerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as tokens arrive
  useEffect(() => {
    if (answerRef.current && !isDone) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [answer, isDone]);

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!isLoading && !question) {
    return (
      <div
        style={{
          height: '100%',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '40px',
        }}
      >
        {/* Mesh SVG pattern */}
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style={{ opacity: 0.15 }}>
          <circle cx="20" cy="20" r="3" fill="var(--accent)" />
          <circle cx="60" cy="20" r="3" fill="var(--accent)" />
          <circle cx="100" cy="20" r="3" fill="var(--accent)" />
          <circle cx="20" cy="60" r="3" fill="var(--accent)" />
          <circle cx="60" cy="60" r="5" fill="var(--accent)" />
          <circle cx="100" cy="60" r="3" fill="var(--accent)" />
          <circle cx="20" cy="100" r="3" fill="var(--accent)" />
          <circle cx="60" cy="100" r="3" fill="var(--accent)" />
          <circle cx="100" cy="100" r="3" fill="var(--accent)" />
          <line x1="20" y1="20" x2="60" y2="20" stroke="var(--accent)" strokeWidth="0.5" />
          <line x1="60" y1="20" x2="100" y2="20" stroke="var(--accent)" strokeWidth="0.5" />
          <line x1="20" y1="60" x2="60" y2="60" stroke="var(--accent)" strokeWidth="0.5" />
          <line x1="60" y1="60" x2="100" y2="60" stroke="var(--accent)" strokeWidth="0.5" />
          <line x1="20" y1="100" x2="60" y2="100" stroke="var(--accent)" strokeWidth="0.5" />
          <line x1="60" y1="100" x2="100" y2="100" stroke="var(--accent)" strokeWidth="0.5" />
          <line x1="20" y1="20" x2="20" y2="60" stroke="var(--accent)" strokeWidth="0.5" />
          <line x1="20" y1="60" x2="20" y2="100" stroke="var(--accent)" strokeWidth="0.5" />
          <line x1="60" y1="20" x2="60" y2="60" stroke="var(--accent)" strokeWidth="0.5" />
          <line x1="60" y1="60" x2="60" y2="100" stroke="var(--accent)" strokeWidth="0.5" />
          <line x1="100" y1="20" x2="100" y2="60" stroke="var(--accent)" strokeWidth="0.5" />
          <line x1="100" y1="60" x2="100" y2="100" stroke="var(--accent)" strokeWidth="0.5" />
          <line x1="20" y1="20" x2="60" y2="60" stroke="var(--accent)" strokeWidth="0.5" opacity="0.5" />
          <line x1="60" y1="20" x2="100" y2="60" stroke="var(--accent)" strokeWidth="0.5" opacity="0.5" />
          <line x1="20" y1="60" x2="60" y2="100" stroke="var(--accent)" strokeWidth="0.5" opacity="0.5" />
          <line x1="60" y1="60" x2="100" y2="100" stroke="var(--accent)" strokeWidth="0.5" opacity="0.5" />
        </svg>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
            Ask anything about your project
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
            Answers are grounded in your real context — commits, decisions, notes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={answerRef} style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto', padding: '4px' }}>

      {/* Question */}
      {question && (
        <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)' }}>
          <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Question
          </p>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: 1.4 }}>
            {question}
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && !answer && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
          <Loader2 size={16} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Searching context and generating answer…</span>
        </div>
      )}

      {/* Error state */}
      {errorMessage && (
        <div style={{ padding: '14px 16px', borderRadius: '10px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', fontSize: '13px', color: '#F87171', lineHeight: 1.5 }}>
          {errorMessage.includes('AI_NOT_CONFIGURED') || errorMessage.includes('ANTHROPIC_NOT_CONFIGURED')
            ? '⚠️ AI not configured. Add a free GROQ_API_KEY to .env.local — get one in 30 seconds at console.groq.com'
            : errorMessage.includes('credit') || errorMessage.includes('balance')
            ? '💳 Groq account issue. Check your API key at console.groq.com'
            : errorMessage}
        </div>
      )}

      {/* Streaming answer */}
      {answer && (
        <div
          style={{
            fontSize: '14px',
            color: 'var(--text-primary)',
            lineHeight: 1.7,
          }}
          className="answer-markdown"
        >
          <ReactMarkdown>{answer}</ReactMarkdown>
          {/* Blinking cursor while streaming */}
          {!isDone && (
            <span style={{ display: 'inline-block', width: '2px', height: '16px', background: 'var(--accent)', marginLeft: '2px', animation: 'blink 1s step-end infinite', verticalAlign: 'middle' }} />
          )}
        </div>
      )}

      {/* Sources */}
      {isDone && sources.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
              Based on {sources.length} source{sources.length !== 1 ? 's' : ''}
            </p>
            {tokensUsed > 0 && (
              <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                {tokensUsed} tokens
              </span>
            )}
          </div>
          {sources.map((src, i) => (
            <SourceCard key={src.id} source={src} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
