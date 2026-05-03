import type { Metadata } from 'next';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export const metadata: Metadata = {
  title: 'ContextMesh — Shared memory for AI-powered teams',
  description: 'Stop repeating yourself to every AI. ContextMesh gives your team a shared memory layer — sync context from GitHub, Slack, Jira, and query it instantly with AI.',
};

const features = [
  { id: 'feat-ingest', title: 'Ingest from everywhere', desc: 'GitHub commits, Slack decisions, Jira tickets — all automatically captured into a searchable context layer.', tag: 'Ingestion' },
  { id: 'feat-query', title: 'Query in plain English', desc: 'Ask "what database did we choose and why?" and get a sourced answer from your actual project history.', tag: 'AI Query' },
  { id: 'feat-sync', title: 'Every AI starts informed', desc: 'Share a context token with any agent. It immediately knows your architecture, decisions, and blockers.', tag: 'Multi-agent' },
];

const plans = [
  { id: 'plan-free', name: 'Free', price: '$0', desc: '1 project, 1 integration, 100 queries/mo', cta: 'Get started', href: '/signup', highlight: false },
  { id: 'plan-pro', name: 'Pro', price: '$19', desc: '5 projects, all integrations, 2,000 queries/mo', cta: 'Get Pro', href: '/signup', highlight: true },
  { id: 'plan-team', name: 'Team', price: '$49', desc: 'Unlimited projects, priority support, SSO', cta: 'Contact us', href: '/signup', highlight: false },
];

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>

      {/* ── Nav ───────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50" style={{ borderBottom: '1px solid rgba(42,42,58,0.6)', backdropFilter: 'blur(12px)', background: 'rgba(10,10,15,0.85)' }}>
        <nav className="max-w-[1280px] mx-auto px-6 h-14 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-6">
            <Link href="#features" id="nav-features" className="text-[13px] transition-colors hover:text-[var(--color-text-primary)]" style={{ color: 'var(--color-text-secondary)' }}>
              Features
            </Link>
            <Link href="#pricing" id="nav-pricing" className="text-[13px] transition-colors hover:text-[var(--color-text-primary)]" style={{ color: 'var(--color-text-secondary)' }}>
              Pricing
            </Link>
            <Link href="/login" id="nav-signin" className="text-[13px] transition-colors hover:text-[var(--color-text-primary)]" style={{ color: 'var(--color-text-secondary)' }}>
              Sign in
            </Link>
            <Link
              href="/signup"
              id="hero-cta-nav"
              className="h-8 px-4 rounded-[8px] text-[13px] font-medium flex items-center transition-all duration-150"
              style={{ background: 'var(--color-accent-primary)', color: '#0A0A0F' }}
            >
              Get started free
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="noise-overlay relative pt-32 pb-24 px-6 text-center overflow-hidden">
        {/* Background glow */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[600px]" style={{ background: 'var(--gradient-glow)' }} />

        {/* Mesh grid lines (decorative) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(var(--color-accent-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-accent-primary) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        <div className="relative max-w-[860px] mx-auto page-enter">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-[12px] font-[var(--font-mono)]"
            style={{ background: 'var(--color-accent-subtle)', border: '1px solid rgba(0,212,180,0.2)', color: 'var(--color-accent-primary)' }}>
            <span className="w-1.5 h-1.5 rounded-full teal-pulse" style={{ background: 'var(--color-accent-primary)', display: 'inline-block' }} />
            Open beta — Phase 1 live
          </div>

          <h1 className="text-[64px] md:text-[80px] font-[var(--font-display)] font-800 leading-[1.0] mb-6"
            style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.04em' }}>
            Shared memory for<br />
            <span style={{ color: 'var(--color-accent-primary)' }}>AI-powered teams</span>
          </h1>

          <p className="text-[18px] max-w-[600px] mx-auto mb-10" style={{ color: 'var(--color-text-secondary)', lineHeight: '1.65' }}>
            Stop repeating yourself to every AI. ContextMesh gives your team a single source of truth — instantly queryable by any agent, developer, or tool.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/signup"
              id="hero-cta-primary"
              className="h-12 px-6 rounded-[8px] text-[15px] font-medium flex items-center gap-2 transition-all duration-150"
              style={{ background: 'var(--color-accent-primary)', color: '#0A0A0F', boxShadow: '0 0 32px rgba(0,212,180,0.25)' }}
            >
              Start for free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link
              href="#features"
              id="hero-cta-secondary"
              className="h-12 px-6 rounded-[8px] text-[15px] font-medium flex items-center gap-2 transition-all duration-150"
              style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)', border: '1px solid var(--color-bg-border)' }}
            >
              See how it works
            </Link>
          </div>
        </div>

        {/* Terminal preview */}
        <div className="relative max-w-[760px] mx-auto mt-16 page-enter page-enter-delay-2">
          <div className="card rounded-[14px] overflow-hidden" style={{ background: 'var(--color-bg-secondary)' }}>
            {/* Terminal chrome */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--color-bg-border)', background: 'var(--color-bg-elevated)' }}>
              <span className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
              <span className="ml-3 text-[12px] font-[var(--font-mono)]" style={{ color: 'var(--color-text-tertiary)' }}>ContextMesh Query</span>
            </div>
            <div className="p-6 text-left space-y-4 font-[var(--font-mono)] text-[13px]">
              <div>
                <span style={{ color: 'var(--color-accent-primary)' }}>❯ </span>
                <span style={{ color: 'var(--color-text-secondary)' }}>query</span>
                <span style={{ color: 'var(--color-text-primary)' }}> &quot;What database did we choose and why?&quot;</span>
              </div>
              <div className="pl-4 space-y-1" style={{ borderLeft: '2px solid rgba(0,212,180,0.2)' }}>
                <p style={{ color: 'var(--color-text-primary)' }}>We chose <span style={{ color: 'var(--color-accent-primary)' }}>Supabase PostgreSQL</span> with pgvector.</p>
                <p style={{ color: 'var(--color-text-secondary)' }}>Reasons: Already running for auth, pgvector handles embeddings</p>
                <p style={{ color: 'var(--color-text-secondary)' }}>natively, no extra cost vs Pinecone at our scale.</p>
              </div>
              <div className="pt-1">
                <span style={{ color: 'var(--color-text-tertiary)' }}>Sources: </span>
                <span style={{ color: 'var(--color-info)' }}>arch-decision-003.md</span>
                <span style={{ color: 'var(--color-text-tertiary)' }}>, </span>
                <span style={{ color: 'var(--color-info)' }}>slack:#eng 2024-03-12</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 max-w-[1280px] mx-auto">
        <div className="mb-14">
          <p className="text-[12px] font-[var(--font-mono)] mb-3" style={{ color: 'var(--color-accent-primary)' }}>HOW IT WORKS</p>
          <h2 className="text-[40px] font-[var(--font-display)] font-700 mb-4" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>
            Context that sticks
          </h2>
          <p className="text-[16px] max-w-[520px]" style={{ color: 'var(--color-text-secondary)' }}>
            Every decision, blocker, and architecture choice — automatically captured, semantically indexed, instantly retrievable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feat, i) => (
            <div key={feat.id} id={feat.id} className="card p-6 space-y-4" style={{ animationDelay: `${i * 80}ms` }}>
              <span className="inline-block text-[11px] font-[var(--font-mono)] px-2 py-1 rounded-[5px]"
                style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent-primary)', border: '1px solid rgba(0,212,180,0.15)' }}>
                {feat.tag}
              </span>
              <h3 className="text-[18px] font-[var(--font-display)] font-600" style={{ color: 'var(--color-text-primary)' }}>
                {feat.title}
              </h3>
              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="mb-14 text-center">
            <p className="text-[12px] font-[var(--font-mono)] mb-3" style={{ color: 'var(--color-accent-primary)' }}>PRICING</p>
            <h2 className="text-[40px] font-[var(--font-display)] font-700 mb-4" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>
              Free until you need more
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[900px] mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                id={plan.id}
                className="card p-6 flex flex-col gap-5"
                style={plan.highlight ? { borderColor: 'rgba(0,212,180,0.4)', boxShadow: '0 0 40px rgba(0,212,180,0.08)' } : {}}
              >
                {plan.highlight && (
                  <span className="text-[11px] font-[var(--font-mono)] px-2 py-0.5 rounded-[4px] self-start"
                    style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent-primary)', border: '1px solid rgba(0,212,180,0.2)' }}>
                    Most popular
                  </span>
                )}
                <div>
                  <p className="text-[14px] font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>{plan.name}</p>
                  <p className="text-[40px] font-[var(--font-display)] font-800 leading-none" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>
                    {plan.price}<span className="text-[16px] font-[var(--font-body)] font-400" style={{ color: 'var(--color-text-tertiary)' }}>/mo</span>
                  </p>
                </div>
                <p className="text-[13px] flex-1" style={{ color: 'var(--color-text-secondary)' }}>{plan.desc}</p>
                <Link
                  href={plan.href}
                  className="h-10 flex items-center justify-center rounded-[8px] text-[14px] font-medium transition-all duration-150"
                  style={plan.highlight
                    ? { background: 'var(--color-accent-primary)', color: '#0A0A0F' }
                    : { background: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)', border: '1px solid var(--color-bg-border)' }
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="py-10 px-6" style={{ borderTop: '1px solid var(--color-bg-border)' }}>
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="flex items-center gap-6">
            <Link href="/legal/privacy" className="text-[12px] transition-colors" style={{ color: 'var(--color-text-tertiary)' }}>Privacy Policy</Link>
            <Link href="/legal/terms" className="text-[12px] transition-colors" style={{ color: 'var(--color-text-tertiary)' }}>Terms of Service</Link>
          </div>
          <p className="text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
            © {new Date().getFullYear()} ContextMesh
          </p>
        </div>
      </footer>
    </div>
  );
}
