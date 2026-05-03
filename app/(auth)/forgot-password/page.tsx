'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: FormValues) => {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
    });
    // Always show success (security: don't reveal if email exists)
    setSent(true);
  };

  if (sent) {
    return (
      <div className="w-full max-w-[420px] page-enter">
        <div className="card p-8 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'var(--color-accent-subtle)', border: '1px solid rgba(0, 212, 180, 0.3)' }}
          >
            <Mail size={20} color="var(--color-accent-primary)" />
          </div>
          <h1
            className="text-[22px] font-[var(--font-display)] font-700 mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Check your inbox
          </h1>
          <p className="text-[14px] mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            If an account exists for{' '}
            <span
              className="font-[var(--font-mono)] text-[13px]"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {getValues('email')}
            </span>
          </p>
          <p className="text-[14px] mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            you&apos;ll receive a password reset link shortly.
          </p>
          <Link href="/login">
            <Button variant="secondary" fullWidth>
              <ArrowLeft size={15} />
              Back to sign in
            </Button>
          </Link>
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
          Reset password
        </h1>
        <p className="text-[15px]" style={{ color: 'var(--color-text-secondary)' }}>
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <div className="card p-6 space-y-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            id="forgot-email"
            label="Email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button
            id="forgot-submit-btn"
            type="submit"
            fullWidth
            loading={isSubmitting}
          >
            Send reset link
          </Button>
        </form>
      </div>

      <p className="text-center mt-6 text-[14px]" style={{ color: 'var(--color-text-secondary)' }}>
        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 transition-colors hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
