'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, X } from 'lucide-react';

const STEPS = [
  { id: 'account',   label: 'Create account',        href: null,           alwaysDone: true },
  { id: 'project',   label: 'Create first project',  href: '/projects',    alwaysDone: false },
  { id: 'context',   label: 'Add context',           href: '/projects',    alwaysDone: false },
  { id: 'github',    label: 'Connect GitHub',        href: '/integrations', alwaysDone: false },
  { id: 'query',     label: 'Make first AI query',   href: '/query',       alwaysDone: false },
];

interface Props {
  completedSteps: string[];
  onDismiss: () => void;
  onStepComplete?: (step: string) => void;
}

export default function OnboardingChecklist({ completedSteps, onDismiss, onStepComplete }: Props) {
  const [localCompleted, setLocalCompleted] = useState<string[]>(completedSteps);

  const doneCount = STEPS.filter(s => s.alwaysDone || localCompleted.includes(s.id)).length;
  const allDone = doneCount === STEPS.length;
  const canDismiss = doneCount >= 3;

  function markDone(stepId: string) {
    if (localCompleted.includes(stepId)) return;
    const updated = [...localCompleted, stepId];
    setLocalCompleted(updated);
    onStepComplete?.(stepId);
    fetch('/api/onboarding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ step: stepId }),
    }).catch(console.error);
  }

  return (
    <div className="card" style={{ padding: '20px 22px', position: 'relative', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(0,212,180,0.04) 100%)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {allDone ? '🎉 You\'re all set!' : 'Getting Started'}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            {doneCount} / {STEPS.length} steps complete
          </p>
        </div>
        {canDismiss && (
          <button
            onClick={onDismiss}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px' }}
            title="Dismiss"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ height: '3px', borderRadius: '2px', background: 'var(--bg-border)', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(doneCount / STEPS.length) * 100}%`, background: 'var(--accent)', borderRadius: '2px', transition: 'width 0.4s ease' }} />
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {STEPS.map((step) => {
          const done = step.alwaysDone || localCompleted.includes(step.id);
          return (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {done
                ? <CheckCircle2 size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                : <Circle size={15} style={{ color: 'var(--bg-border)', flexShrink: 0 }} />
              }
              {step.href && !done ? (
                <Link
                  href={step.href}
                  onClick={() => markDone(step.id)}
                  style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
                >
                  {step.label} →
                </Link>
              ) : (
                <span style={{ fontSize: '13px', color: done ? 'var(--text-tertiary)' : 'var(--text-secondary)', textDecoration: done ? 'line-through' : 'none' }}>
                  {step.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
