# 🧠 ContextMesh — Master Build Prompt

> **To any AI building this project:** Go to the `brand/guidelines.md` file in this project and follow the brand guidelines exactly for every UI decision. Then read this file thoroughly and follow every instruction step-by-step, phase by phase, without skipping anything. After completing each phase, trigger the full QA testing protocol defined in `testing/QA_PROTOCOL.md`. Do not proceed to the next phase until all tests pass.

---

## 📌 What Is ContextMesh?

**ContextMesh** is a multiplayer AI context synchronization SaaS. It gives development teams a shared memory layer — a single source of truth that any AI agent, developer, or tool can query to understand the current state of a project.

**Core Value Prop:**
> "Stop repeating yourself to every AI. ContextMesh remembers so you don't have to."

When multiple AI agents or developers work on the same codebase, each agent starts blind — no shared memory of decisions, architecture choices, progress, or blockers. ContextMesh fixes this by ingesting data from GitHub, Jira, Slack, and Linear — then making it instantly queryable.

---

## 🗂️ Project File Map

```
contextmesh/
├── MASTER_PROMPT.md          ← You are here
├── brand/
│   └── guidelines.md         ← Read this before writing ANY UI
├── docs/
│   ├── architecture.md       ← Full system architecture
│   ├── api.md                ← All API endpoints
│   ├── tech_stack.md         ← Every tool, why it was chosen
│   ├── integrations.md       ← GitHub, Slack, Jira, Linear setup
│   ├── payments.md           ← Stripe setup (free until revenue)
│   ├── auth.md               ← Supabase Auth full flow
│   ├── legal.md              ← Privacy Policy, ToS, Cookie Policy
│   ├── analytics.md          ← PostHog setup
│   ├── seo.md                ← SEO + Search Console setup
│   └── deployment.md         ← Vercel + Supabase deployment
├── phases/
│   ├── phase_1.md            ← Foundation & Auth
│   ├── phase_2.md            ← Core Context Engine
│   ├── phase_3.md            ← Integrations (GitHub/Slack)
│   ├── phase_4.md            ← Query Interface (AI-powered)
│   ├── phase_5.md            ← Dashboard & Multi-user
│   ├── phase_6.md            ← Payments & Plans
│   └── phase_7.md            ← Launch & Marketing
└── testing/
    └── QA_PROTOCOL.md        ← Full human-grade testing protocol
```

---

## ⚙️ Build Rules (Non-Negotiable)

1. **Always read `brand/guidelines.md` before writing any UI code**
2. **Complete phases in order** — no skipping
3. **Run full QA after each phase** — defined in `testing/QA_PROTOCOL.md`
4. **Never use placeholder data in final builds** — wire real APIs
5. **Every component must be responsive** — mobile-first
6. **All secrets go in `.env`** — never hardcoded
7. **Commit after every phase** with message: `feat: phase-X complete`

---

## 🚫 What NOT To Build (Anti-Slop Rules)

- No generic purple gradient hero sections
- No card-grid-only layouts
- No Inter font (use brand fonts from guidelines.md)
- No fake "loading" spinners without actual async operations
- No lorem ipsum in any delivered output
- No copy-pasted Tailwind component library dumps

---

*Start with Phase 1. Read brand guidelines first. Test after every phase.*
