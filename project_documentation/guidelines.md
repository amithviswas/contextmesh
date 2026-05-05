# 🎨 ContextMesh — Brand Guidelines

> **AI Instruction:** Read this file completely before writing any UI, component, or styling code. Every visual decision must align with this system. Do not deviate.

---

## 🌐 Brand Identity

**Product Name:** ContextMesh  
**Tagline:** *Shared memory for AI-powered teams*  
**Brand Personality:** Intelligent. Dense. Trustworthy. Like a senior engineer who remembers everything.  
**Tone of Voice:** Direct. No fluff. Technical but human. Like Stripe docs met Linear's UI.

---

## 🎭 Emotive Narrative

ContextMesh exists because great software dies from amnesia. Every agent, every dev, every tool starts from zero — rebuilding context that already exists somewhere. ContextMesh is the quiet infrastructure layer that remembers: every decision, every blocker, every architectural choice. It's not a chatbot. It's not a dashboard. It's the connective tissue of modern AI development teams.

---

## 🎨 Color System

```css
:root {
  /* Backgrounds */
  --color-bg-primary:     #0A0A0F;   /* Near-black, deep space */
  --color-bg-secondary:   #111118;   /* Card backgrounds */
  --color-bg-elevated:    #1A1A24;   /* Elevated surfaces */
  --color-bg-border:      #2A2A3A;   /* Subtle borders */

  /* Text */
  --color-text-primary:   #F0EEE8;   /* Main text — warm white */
  --color-text-secondary: #8A8A9A;   /* Muted text */
  --color-text-tertiary:  #4A4A5A;   /* Disabled/placeholder */

  /* Accent — Electric Teal */
  --color-accent-primary: #00D4B4;   /* Primary CTA, highlights */
  --color-accent-glow:    rgba(0, 212, 180, 0.15); /* Glow effect */
  --color-accent-subtle:  rgba(0, 212, 180, 0.08); /* Hover backgrounds */

  /* Semantic */
  --color-success:        #4ADE80;
  --color-warning:        #FBBF24;
  --color-error:          #F87171;
  --color-info:           #60A5FA;

  /* Gradients */
  --gradient-mesh:        linear-gradient(135deg, #00D4B4 0%, #7B61FF 50%, #FF6B6B 100%);
  --gradient-card:        linear-gradient(145deg, #1A1A24 0%, #111118 100%);
  --gradient-glow:        radial-gradient(circle at 50% 0%, rgba(0,212,180,0.15) 0%, transparent 70%);
}
```

**Color Rules:**
- Background is always near-black — never white or light gray
- Accent teal is used sparingly — CTAs, active states, data highlights only
- Never use purple gradients on white (anti-slop rule)
- Text hierarchy: primary → secondary → tertiary — always three levels

---

## ✍️ Typography

```css
/* Import in global CSS */
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&family=Inter:wght@400;500&display=swap');

:root {
  --font-display:  'Syne', sans-serif;      /* Headlines, hero text */
  --font-body:     'Inter', sans-serif;     /* Body, paragraphs */
  --font-mono:     'DM Mono', monospace;    /* Code, technical data, IDs */
}
```

**Usage Rules:**
- `Syne` — all H1, H2, marketing headlines. Bold, geometric, memorable.
- `Inter` — body copy, UI labels, descriptions. Clean, readable.
- `DM Mono` — all code snippets, API keys, context IDs, technical values.
- **Never use Inter for headlines** — that's the generic AI-slop move.

**Type Scale:**
```
Hero:       72px / Syne 800 / -2px letter-spacing
H1:         48px / Syne 700
H2:         32px / Syne 600
H3:         24px / Syne 600
Body Large: 18px / Inter 400
Body:       16px / Inter 400
Small:      14px / Inter 400
Mono:       13px / DM Mono 400
```

---

## 📐 Spacing & Layout

```
Base unit: 4px
Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px

Max content width:  1280px
Dashboard sidebar:  260px fixed
Card border-radius: 12px
Button radius:      8px
Input radius:       8px
```

**Layout Principles:**
- Asymmetric layouts preferred over centered grids
- Use generous negative space — data-heavy product, let it breathe
- Sidebar navigation for dashboard (not top nav)
- Always a persistent sidebar on desktop, bottom nav on mobile

---

## 🎬 Motion & Animation

```css
/* Timing functions */
--ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out:    cubic-bezier(0.4, 0, 0.2, 1);

/* Durations */
--duration-fast:   150ms;
--duration-normal: 250ms;
--duration-slow:   400ms;
```

**Animation Rules:**
- Page transitions: fade + slight upward translate (y: 8px → 0)
- Cards on hover: subtle glow border + scale(1.01)
- Data appearing: staggered fade-in with 50ms delay per item
- Loading states: skeleton shimmer (NOT spinning circles)
- Teal accent elements get a subtle pulse glow on active state

---

## 🧩 Component Aesthetic

**Cards:**
```
Background: var(--color-bg-secondary)
Border: 1px solid var(--color-bg-border)
Border-radius: 12px
Hover: border-color shifts to var(--color-accent-primary) at 40% opacity
Shadow: 0 4px 24px rgba(0,0,0,0.4)
```

**Primary Button:**
```
Background: var(--color-accent-primary)
Color: #0A0A0F (dark text on teal)
Font: Inter 500, 15px
Padding: 10px 20px
Radius: 8px
Hover: brightness(1.1) + subtle glow
```

**Inputs:**
```
Background: var(--color-bg-elevated)
Border: 1px solid var(--color-bg-border)
Focus: border-color var(--color-accent-primary)
Font: Inter 400, 15px
Placeholder: var(--color-text-tertiary)
```

---

## 🚫 Brand Anti-Patterns (Never Do These)

- ❌ White or light backgrounds on any dashboard page
- ❌ Purple-to-pink gradients
- ❌ Rounded pill buttons everywhere
- ❌ Generic hero with person smiling at laptop
- ❌ Card grids as primary layout pattern
- ❌ Emoji in UI components (only in marketing copy)
- ❌ Animated blob shapes
- ❌ Glassmorphism overdone (one subtle use max)

---

## ✅ Signature Visual Elements

- **Mesh gradient background** on hero — radial teal glow from top center
- **Monospace text** for all context IDs, tokens, technical values
- **Data density** — show real information, not empty states
- **Teal accent line** as active state indicator in sidebar
- **Noise texture overlay** (5% opacity) on hero section for depth

---

*Every screen you build should feel like it was made by a team that ships Linear, Vercel, and Raycast. Intentional. Dense. Precise.*
