import type { Metadata } from 'next';
import Link from 'next/link';
import { Brain, Bot, Users, Plug, ArrowRight, GitPullRequest, MessageSquare, FileText, Sparkles, Check } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ContextMesh — Shared Memory for AI-Powered Teams',
  description: 'Stop repeating context to every AI. ContextMesh remembers your codebase, decisions, and architecture — queryable in seconds.',
};

const FEATURES = [
  {
    icon: Brain,
    title: 'Semantic Context Search',
    desc: 'Vector-powered search across all your commits, PRs, Slack messages, and docs. Find anything instantly.',
    tone: '#A78BFA',
  },
  {
    icon: Bot,
    title: 'AI Answers with Sources',
    desc: 'Ask natural language questions and get precise answers grounded in your actual project context — not hallucinations.',
    tone: '#22D3EE',
  },
  {
    icon: Users,
    title: 'Multiplayer by Default',
    desc: 'Your whole team shares the same context layer. One engineer connects GitHub, everyone benefits.',
    tone: '#34D399',
  },
  {
    icon: Plug,
    title: 'Connects to Your Stack',
    desc: 'GitHub, Slack, Jira, Linear — or add context manually. ContextMesh meets you where you work.',
    tone: '#FBBF24',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Connect Your Tools', desc: 'Link GitHub, Slack, or Jira with one click. ContextMesh automatically syncs new context.' },
  { step: '02', title: 'Context Syncs Automatically', desc: 'Commits, PRs, messages, and decisions are embedded into a shared semantic knowledge base.' },
  { step: '03', title: 'Ask Anything', desc: 'Query in plain English. Get instant, cited answers powered by your real project history.' },
];

/* Decorative mesh graph behind the hero */
function MeshGraph() {
  const nodes: [number, number][] = [
    [80, 120], [220, 60], [360, 150], [140, 260], [300, 300], [460, 80],
    [540, 240], [680, 120], [780, 280], [900, 90], [1000, 220], [1120, 130],
    [620, 360], [420, 400], [860, 400], [1060, 360],
  ];
  const edges: [number, number][] = [
    [0, 1], [1, 2], [0, 3], [3, 4], [2, 4], [1, 5], [5, 6], [2, 6], [6, 7], [5, 7],
    [7, 8], [7, 9], [9, 10], [8, 10], [10, 11], [9, 11], [6, 12], [4, 13], [12, 13],
    [8, 14], [12, 14], [14, 15], [10, 15],
  ];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 460"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full opacity-[0.55]"
      style={{ maskImage: 'radial-gradient(ellipse 75% 70% at 50% 35%, #000 25%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 35%, #000 25%, transparent 80%)' }}
    >
      <defs>
        <linearGradient id="mesh-edge" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6C5CE7" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="#A78BFA" stopOpacity="0.45" />
          <stop offset="1" stopColor="#22D3EE" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke="url(#mesh-edge)" strokeWidth="1" />
      ))}
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i % 4 === 0 ? 9 : 6} fill={i % 3 === 0 ? '#22D3EE' : '#A78BFA'} opacity="0.12" />
          <circle cx={x} cy={y} r={i % 4 === 0 ? 3 : 2.2} fill={i % 3 === 0 ? '#22D3EE' : '#A78BFA'} opacity="0.85" />
        </g>
      ))}
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center px-5 pt-24 pb-20 text-center sm:px-6 sm:pt-32 sm:pb-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 mesh-glow" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 line-grid" />
        <MeshGraph />

        <div className="relative max-w-[820px] page-enter">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-2 pr-3.5 backdrop-blur">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(34,211,238,0.12)] px-2 py-0.5 text-[11px] font-medium text-[#22D3EE]">
              <span className="teal-pulse inline-block h-1.5 w-1.5 rounded-full bg-[#22D3EE]" />
              Beta
            </span>
            <span className="text-[12.5px] text-[var(--text-secondary)]">Now in public beta — free for solo devs</span>
          </div>

          <h1 className="mb-6 text-[clamp(40px,7vw,76px)] font-semibold leading-[1.02] tracking-[-0.045em] text-[var(--text-primary)]">
            Shared memory for{' '}
            <span className="text-gradient">AI&#8209;powered</span>{' '}
            teams
          </h1>

          <p className="mx-auto mb-10 max-w-[580px] text-[17px] leading-relaxed text-[var(--text-secondary)] sm:text-[19px]">
            Stop repeating context to every AI. ContextMesh remembers your codebase, decisions, and architecture — queryable in seconds.
          </p>

          <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link href="/login" className="btn btn-primary h-12 px-7 text-[15px]">
              Start Free — No Credit Card
              <ArrowRight size={16} />
            </Link>
            <Link href="#how-it-works" className="btn btn-secondary h-12 px-7 text-[15px]">
              See How It Works
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] text-[var(--text-tertiary)]">
            {['GitHub', 'Slack', 'Jira', 'Linear'].map((name) => (
              <span key={name} className="inline-flex items-center gap-1.5">
                <Check size={13} className="text-[#34D399]" /> {name}
              </span>
            ))}
          </div>
        </div>

        {/* Hero query mockup */}
        <div className="page-enter page-enter-delay-2 relative mt-16 w-full max-w-[760px] sm:mt-20">
          <div aria-hidden="true" className="absolute -inset-x-10 -top-10 -bottom-16 rounded-[40px] bg-[radial-gradient(ellipse_at_center,rgba(108,92,231,0.35),transparent_65%)] blur-2xl" />
          <div className="gradient-border relative overflow-hidden rounded-2xl bg-[#10132A]/90 text-left shadow-[0_40px_120px_-30px_rgba(108,92,231,0.55)] backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-white/[0.07] bg-white/[0.02] px-4 py-3">
              {['#F87171', '#FBBF24', '#34D399'].map((c) => (
                <span key={c} className="h-2.5 w-2.5 rounded-full opacity-80" style={{ background: c }} />
              ))}
              <span className="ml-2 font-mono text-[12px] text-[var(--text-tertiary)]">contextmesh — query</span>
              <span className="tag ml-auto hidden sm:inline-flex">
                <Sparkles size={11} className="mr-1" /> 3 sources
              </span>
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 font-mono text-[13px] text-[#22D3EE]">❯</span>
                <p className="font-mono text-[13.5px] text-[var(--text-primary)]">
                  Why did we switch from PostgreSQL to MongoDB in Q3?
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 sm:p-5">
                <p className="mb-4 text-[14px] leading-7 text-[#C5C9E6]">
                  Based on <span className="font-medium text-[#C4B5FD]">3 sources</span>, the switch was driven by schema flexibility requirements from the new feature spec (PR #247) and performance concerns raised in the Slack thread on Aug 14...
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'PR #247', icon: GitPullRequest },
                    { label: 'Slack Aug 14', icon: MessageSquare },
                    { label: 'ADR-012', icon: FileText },
                  ].map(({ label, icon: Icon }) => (
                    <span key={label} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11.5px] text-[var(--text-secondary)]">
                      <Icon size={12} className="text-[#A78BFA]" /> {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative border-y border-white/[0.06] bg-[var(--bg-secondary)]/60 px-5 py-24 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-[1040px]">
          <div className="mb-14 text-center">
            <p className="eyebrow mb-4">How it works</p>
            <h2 className="mx-auto max-w-[640px] text-[clamp(28px,4vw,42px)] font-semibold tracking-[-0.035em]">
              From context chaos to clarity in 3 steps
            </h2>
          </div>
          <div className="marketing-how relative grid grid-cols-3 gap-5">
            <div aria-hidden="true" className="pointer-events-none absolute left-[16%] right-[16%] top-[38px] hidden h-px bg-gradient-to-r from-transparent via-[#A78BFA]/40 to-transparent md:block" />
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="card relative p-7">
                <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#A78BFA]/30 bg-[rgba(108,92,231,0.14)] font-mono text-[13px] font-medium text-[#C4B5FD] shadow-[0_0_24px_-6px_rgba(108,92,231,0.8)]">
                  {step}
                </span>
                <h3 className="mb-2 text-[17px] font-semibold tracking-[-0.02em]">{title}</h3>
                <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section id="features" className="relative px-5 py-24 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-[1040px]">
          <div className="mb-14 text-center">
            <p className="eyebrow mb-4">Features</p>
            <h2 className="text-[clamp(28px,4vw,42px)] font-semibold tracking-[-0.035em]">
              Everything your team needs
            </h2>
          </div>
          <div className="marketing-features grid grid-cols-2 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, tone }) => (
              <div key={title} className="card group relative overflow-hidden p-7 sm:p-8">
                <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-[0.12] blur-3xl transition-opacity duration-300 group-hover:opacity-25" style={{ background: tone }} />
                <span
                  className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border"
                  style={{ background: `${tone}14`, borderColor: `${tone}40`, color: tone }}
                >
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <h3 className="mb-2 text-[17px] font-semibold tracking-[-0.02em]">{title}</h3>
                <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────────── */}
      <section className="px-5 pb-24 sm:px-6 sm:pb-28">
        <div className="gradient-border relative mx-auto max-w-[1040px] overflow-hidden rounded-3xl bg-[#11142B] px-6 py-16 text-center sm:px-12 sm:py-20">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 mesh-glow" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 mesh-grid opacity-60" />
          <div className="relative mx-auto max-w-[560px]">
            <h2 className="mb-4 text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.035em]">
              Ready to give your team a <span className="text-gradient">memory</span>?
            </h2>
            <p className="mb-8 text-[16px] text-[var(--text-secondary)]">
              Free forever for solo developers. Upgrade when your team grows.
            </p>
            <Link href="/login" className="btn btn-primary h-12 px-8 text-[15px]">
              Start for Free <ArrowRight size={16} />
            </Link>
            <p className="mt-4 text-[12.5px] text-[var(--text-tertiary)]">
              No credit card required · Setup in 2 minutes
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
