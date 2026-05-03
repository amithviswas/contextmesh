'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { GitBranch } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[0-9]/, 'Include at least one number'),
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const supabase = createClient();
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [serverError, setServerError] = useState('');
  const [oauthLoading, setOauthLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }: FormValues) => {
    setServerError('');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      setServerError(error.message);
    } else {
      setStatus('sent');
    }
  };

  const signInWithGitHub = async () => {
    setOauthLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${location.origin}/api/auth/callback`,
      },
    });
  };

  if (status === 'sent') {
    return (
      <div className="w-full max-w-[420px] page-enter">
        <div className="card p-8 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'var(--color-accent-subtle)', border: '1px solid var(--color-accent-primary)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 6L12 13L2 6" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1
            className="text-[22px] font-[var(--font-display)] font-700 mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Check your email
          </h1>
          <p className="text-[14px] mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            We sent a verification link to your inbox. Click it to activate your account.
          </p>
          <p className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
            Didn&apos;t receive it?{' '}
            <button
              onClick={() => setStatus('idle')}
              className="text-[var(--color-accent-primary)] hover:underline"
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px] page-enter">
      <div className="mb-8 text-center">
        <h1
          className="text-[32px] font-[var(--font-display)] font-700 mb-2"
          style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}
        >
          Create your account
        </h1>
        <p className="text-[15px]" style={{ color: 'var(--color-text-secondary)' }}>
          Shared memory for AI-powered teams
        </p>
      </div>

      <div className="card p-6 space-y-5">
        {/* GitHub OAuth */}
        <Button
          id="github-signup-btn"
          variant="secondary"
          fullWidth
          loading={oauthLoading}
          onClick={signInWithGitHub}
        >
          <GitBranch size={16} />
          Continue with GitHub
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--color-bg-border)' }} />
          <span className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
            or continue with email
          </span>
          <div className="flex-1 h-px" style={{ background: 'var(--color-bg-border)' }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            id="signup-email"
            label="Email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            id="signup-password"
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />

          {serverError && (
            <div
              className="rounded-[8px] p-3 text-[13px]"
              style={{
                background: 'rgba(248, 113, 113, 0.08)',
                border: '1px solid rgba(248, 113, 113, 0.2)',
                color: 'var(--color-error)',
              }}
            >
              {serverError}
            </div>
          )}

          <Button
            id="signup-submit-btn"
            type="submit"
            fullWidth
            loading={isSubmitting}
          >
            Create account
          </Button>
        </form>

        {/* Legal */}
        <p className="text-[11px] text-center" style={{ color: 'var(--color-text-tertiary)' }}>
          By signing up, you agree to our{' '}
          <a href="/legal/terms" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
            Terms
          </a>{' '}
          and{' '}
          <a href="/legal/privacy" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>

      <p className="text-center mt-6 text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium transition-colors"
          style={{ color: 'var(--color-accent-primary)' }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
