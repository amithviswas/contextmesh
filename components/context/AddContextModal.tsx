'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2, Brain } from 'lucide-react';
import { contextApi } from '@/lib/api';
import type { ContextItem } from '@/types';
import { CONTEXT_TYPE_LABELS } from '@/types';

const schema = z.object({
  type: z.enum(['decision', 'architecture', 'blocker', 'meeting_note', 'note']),
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required').max(10000),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  projectId: string;
  onClose: () => void;
  onCreated: (item: ContextItem) => void;
}

const TYPE_OPTIONS: Array<{ value: ContextItem['type']; label: string; desc: string; emoji: string }> = [
  { value: 'decision',     label: 'Decision',       desc: 'A key choice made by the team',      emoji: '⚡' },
  { value: 'architecture', label: 'Architecture',   desc: 'System design or technical choice',   emoji: '🏗️' },
  { value: 'blocker',      label: 'Blocker',        desc: 'Something blocking progress',         emoji: '🚧' },
  { value: 'meeting_note', label: 'Meeting Note',   desc: 'Key takeaways from a meeting',        emoji: '📝' },
  { value: 'note',         label: 'Note',           desc: 'General knowledge or reference',      emoji: '💡' },
];

export default function AddContextModal({ open, projectId, onClose, onCreated }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'decision' },
  });

  const selectedType = watch('type');

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  function handleClose() { reset(); onClose(); }

  async function onSubmit(values: FormValues) {
    const result = await contextApi.ingest({
      project_id: projectId,
      source: 'manual',
      type: values.type,
      title: values.title,
      content: values.content,
    });

    if (result.error) {
      setError('root', { message: result.error });
      return;
    }

    reset();
    onCreated(result.data!);
    onClose();
  }

  if (!open) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      aria-modal="true" role="dialog" aria-label="Add context"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '560px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--bg-border)',
          borderRadius: '16px', overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          maxHeight: '90dvh', overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '20px 24px', borderBottom: '1px solid var(--bg-border)',
          position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1,
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
          }}>
            <Brain size={16} style={{ color: 'var(--accent)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Add context
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '1px' }}>
              This will be embedded and stored for semantic search
            </p>
          </div>
          <button
            id="add-context-modal-close"
            onClick={handleClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px', borderRadius: '6px', display: 'flex' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Type selector */}
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Type <span style={{ color: 'var(--color-error)' }}>*</span>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {TYPE_OPTIONS.slice(0, 3).map((opt) => (
                <TypeButton key={opt.value} opt={opt} selected={selectedType === opt.value} onClick={() => setValue('type', opt.value)} />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginTop: '6px' }}>
              {TYPE_OPTIONS.slice(3).map((opt) => (
                <TypeButton key={opt.value} opt={opt} selected={selectedType === opt.value} onClick={() => setValue('type', opt.value)} />
              ))}
            </div>
            <input type="hidden" {...register('type')} />
          </div>

          {/* Title */}
          <div>
            <label htmlFor="context-title" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Title <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              id="context-title"
              autoFocus
              className="input-base"
              placeholder="e.g. Chose PostgreSQL over MongoDB for…"
              {...register('title')}
              style={errors.title ? { borderColor: 'var(--color-error)' } : {}}
            />
            {errors.title && <p style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '5px' }}>{errors.title.message}</p>}
          </div>

          {/* Content */}
          <div>
            <label htmlFor="context-content" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Content <span style={{ color: 'var(--color-error)' }}>*</span>
              <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: '6px' }}>Markdown supported</span>
            </label>
            <textarea
              id="context-content"
              rows={6}
              className="input-base"
              placeholder="Explain the full context, reasoning, and any relevant links…"
              {...register('content')}
              style={{
                height: 'auto', padding: '10px 12px',
                resize: 'vertical', minHeight: '120px', lineHeight: 1.6,
                fontFamily: 'var(--font-mono)', fontSize: '13px',
                ...(errors.content ? { borderColor: 'var(--color-error)' } : {}),
              }}
            />
            {errors.content && <p style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '5px' }}>{errors.content.message}</p>}
          </div>

          {/* Root error */}
          {errors.root && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', fontSize: '13px', color: 'var(--color-error)' }}>
              {errors.root.message}
            </div>
          )}

          {/* Embedding note */}
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', fontSize: '12px', color: 'var(--text-secondary)' }}>
            🧠 An embedding will be generated locally and stored with this item for semantic search.
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={handleClose} className="btn btn-secondary">Cancel</button>
            <button
              id="add-context-submit"
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Embedding…</>
              ) : (
                '+ Add context'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TypeButton({
  opt, selected, onClick,
}: {
  opt: { value: string; label: string; emoji: string };
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
        border: `1px solid ${selected ? 'var(--accent-border)' : 'var(--bg-border)'}`,
        background: selected ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
        color: selected ? 'var(--accent)' : 'var(--text-secondary)',
        fontSize: '12px', fontWeight: selected ? 600 : 400, fontFamily: 'inherit',
        transition: 'all 0.15s',
      }}
    >
      <span>{opt.emoji}</span>
      <span>{opt.label}</span>
    </button>
  );
}
