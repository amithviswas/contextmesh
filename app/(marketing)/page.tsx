import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ContextMesh — Shared Memory for AI-Powered Teams',
  description: 'Stop repeating context to every AI. ContextMesh remembers your codebase, decisions, and architecture — queryable in seconds.',
};

const FEATURES = [
  {
    emoji: '🧠',
    title: 'Semantic Context Search',
    desc: 'Vector-powered search across all your commits, PRs, Slack messages, and docs. Find anything instantly.',
  },
  {
    emoji: '🤖',
    title: 'AI Answers with Sources',
    desc: 'Ask natural language questions and get precise answers grounded in your actual project context — not hallucinations.',
  },
  {
    emoji: '👥',
    title: 'Multiplayer by Default',
    desc: 'Your whole team shares the same context layer. One engineer connects GitHub, everyone benefits.',
  },
  {
    emoji: '🔌',
    title: 'Connects to Your Stack',
    desc: 'GitHub, Slack, Jira, Linear — or add context manually. ContextMesh meets you where you work.',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Connect Your Tools', desc: 'Link GitHub, Slack, or Jira with one click. ContextMesh automatically syncs new context.' },
  { step: '02', title: 'Context Syncs Automatically', desc: 'Commits, PRs, messages, and decisions are embedded into a shared semantic knowledge base.' },
  { step: '03', title: 'Ask Anything', desc: 'Query in plain English. Get instant, cited answers powered by your real project history.' },
];

export default function LandingPage() {
  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '92vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '80px 24px 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
          width: '800px', height: '600px',
          background: 'radial-gradient(ellipse at center, rgba(0,212,180,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: '780px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '20px', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', marginBottom: '28px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} className="teal-pulse" />
            <span style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
              Now in public beta
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            marginBottom: '24px',
          }}>
            Shared memory for{' '}
            <span style={{ color: 'var(--accent)' }}>AI-powered</span>{' '}
            teams
          </h1>

          <p style={{ fontSize: '20px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '40px', maxWidth: '560px', margin: '0 auto 40px' }}>
            Stop repeating context to every AI. ContextMesh remembers your codebase, decisions, and architecture — queryable in seconds.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" className="btn btn-primary" style={{ fontSize: '15px', padding: '12px 28px', textDecoration: 'none' }}>
              Start Free — No Credit Card
            </Link>
            <Link href="#how-it-works" style={{ fontSize: '15px', padding: '12px 28px', borderRadius: '9px', border: '1px solid var(--bg-border)', color: 'var(--text-secondary)', textDecoration: 'none', background: 'var(--bg-elevated)' }}>
              See How It Works →
            </Link>
          </div>
        </div>

        {/* Hero terminal mockup */}
        <div style={{
          marginTop: '72px',
          maxWidth: '700px', width: '100%',
          borderRadius: '14px',
          border: '1px solid var(--bg-border)',
          background: 'var(--bg-secondary)',
          overflow: 'hidden',
          boxShadow: '0 40px 120px rgba(0,212,180,0.08)',
          position: 'relative',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--bg-border)', display: 'flex', gap: '6px', alignItems: 'center', background: 'var(--bg-elevated)' }}>
            {['#FF5F56', '#FFBD2E', '#27C93F'].map((c, i) => (
              <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
            ))}
            <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              ContextMesh Query
            </span>
          </div>
          <div style={{ padding: '20px 24px', textAlign: 'left' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
              &gt; Why did we switch from PostgreSQL to MongoDB in Q3?
            </p>
            <div style={{ padding: '14px 16px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--bg-border)' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '10px' }}>
                Based on <span style={{ color: 'var(--accent)' }}>3 sources</span>, the switch was driven by schema flexibility requirements from the new feature spec (PR #247) and performance concerns raised in the Slack thread on Aug 14...
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['PR #247', 'Slack Aug 14', 'ADR-012'].map((src) => (
                  <span key={src} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                    {src}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '100px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--bg-border)', borderBottom: '1px solid var(--bg-border)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>How It Works</p>
          <h2 style={{ textAlign: 'center', fontSize: '38px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '60px' }}>
            From context chaos to clarity in 3 steps
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step}>
                <p style={{ fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent)', opacity: 0.4, marginBottom: '12px' }}>{step}</p>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>Features</p>
          <h2 style={{ textAlign: 'center', fontSize: '38px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '60px' }}>
            Everything your team needs
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {FEATURES.map(({ emoji, title, desc }) => (
              <div key={title} className="card" style={{ padding: '28px 30px' }}>
                <p style={{ fontSize: '28px', marginBottom: '14px' }}>{emoji}</p>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--bg-border)' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '14px' }}>
            Ready to give your team a memory?
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
            Free forever for solo developers. Upgrade when your team grows.
          </p>
          <Link href="/login" className="btn btn-primary" style={{ fontSize: '15px', padding: '13px 32px', textDecoration: 'none' }}>
            Start for Free →
          </Link>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '14px' }}>
            No credit card required · Setup in 2 minutes
          </p>
        </div>
      </section>
    </div>
  );
}
