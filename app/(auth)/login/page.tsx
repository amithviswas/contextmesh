'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GitBranch } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [oauthLoading, setOauthLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }: FormValues) => {
    setServerError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Don't reveal if email exists — generic error
      setServerError('Invalid email or password. Please try again.');
    } else {
      router.push('/dashboard');
      router.refresh();
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

  return (
    <div className="w-full max-w-[420px] page-enter">
      <div className="mb-8 text-center">
        <h1
          className="text-[32px] font-[var(--font-display)] font-700 mb-2"
          style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}
        >
          Welcome back
        </h1>
        <p className="text-[15px]" style={{ color: 'var(--color-text-secondary)' }}>
          Sign in to your ContextMesh workspace
        </p>
      </div>

      <div className="card p-6 space-y-5">
        {/* GitHub OAuth */}
        <Button
          id="github-login-btn"
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
            id="login-email"
            label="Email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="text-[13px] font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[12px] transition-colors"
                style={{ color: 'var(--color-text-tertiary)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className={[
                'h-10 w-full px-3',
                'bg-[var(--color-bg-elevated)]',
                'border border-[var(--color-bg-border)]',
                'rounded-[8px]',
                'text-[15px] text-[var(--color-text-primary)]',
                'placeholder:text-[var(--color-text-tertiary)]',
                'outline-none',
                'transition-colors duration-150',
                'focus:border-[var(--color-accent-primary)]',
                'focus:ring-2 focus:ring-[var(--color-accent-primary)]/20',
                errors.password ? 'border-[var(--color-error)]' : '',
              ].join(' ')}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-[12px] leading-none" style={{ color: 'var(--color-error)' }}>
                {errors.password.message}
              </p>
            )}
          </div>

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
            id="login-submit-btn"
            type="submit"
            fullWidth
            loading={isSubmitting}
          >
            Sign in
          </Button>
        </form>
      </div>

      <p className="text-center mt-6 text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-medium transition-colors"
          style={{ color: 'var(--color-accent-primary)' }}
        >
          Get started free
        </Link>
      </p>
    </div>
  );
}
