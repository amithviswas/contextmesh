'use client';

import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, FolderKanban, Loader2 } from 'lucide-react';
import { projectsApi } from '@/lib/api';
import type { Project } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Project name is required').max(80, 'Max 80 characters'),
  description: z.string().max(500, 'Max 500 characters').optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export default function CreateProjectModal({ open, onClose, onCreated }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  function handleClose() {
    reset();
    onClose();
  }

  async function onSubmit(values: FormValues) {
    const result = await projectsApi.create({
      name: values.name,
      description: values.description || undefined,
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
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}
        aria-modal="true"
        role="dialog"
        aria-label="Create project"
      >
        {/* Modal panel */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: '480px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--bg-border)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '20px 24px',
            borderBottom: '1px solid var(--bg-border)',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)',
            }}>
              <FolderKanban size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Create project
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '1px' }}>
                Group your context by team or codebase
              </p>
            </div>
            <button
              id="create-project-modal-close"
              onClick={handleClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-tertiary)', padding: '4px', borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Project name */}
            <div>
              <label htmlFor="project-name" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Project name <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                id="project-name"
                autoFocus
                className="input-base"
                placeholder="e.g. Backend API, Mobile App, Design System"
                {...register('name')}
                style={errors.name ? { borderColor: 'var(--color-error)' } : {}}
              />
              {errors.name && (
                <p style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '5px' }}>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="project-description" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Description <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-tertiary)' }}>(optional)</span>
              </label>
              <textarea
                id="project-description"
                rows={3}
                className="input-base"
                placeholder="What is this project about?"
                {...register('description')}
                style={{
                  height: 'auto', padding: '10px 12px',
                  resize: 'vertical', minHeight: '80px',
                  ...(errors.description ? { borderColor: 'var(--color-error)' } : {}),
                }}
              />
              {errors.description && (
                <p style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '5px' }}>
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Root error */}
            {errors.root && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px',
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                fontSize: '13px', color: 'var(--color-error)',
              }}>
                {errors.root.message}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                id="create-project-submit"
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <><Loader2 size={14} className="animate-spin" /> Creating…</>
                ) : (
                  'Create project'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
