# 📊 ContextMesh — Analytics, SEO & Marketing Setup

---

## Analytics: PostHog

**Why PostHog:** Free up to 1M events/month. Self-hostable. Has session replay, feature flags, and funnels.

### Setup
1. Create account at https://posthog.com
2. Get Project API Key
3. Add to `.env`:
```env
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Installation
```bash
npm install posthog-js
```

```typescript
// lib/analytics/posthog.ts
import posthog from 'posthog-js';

export function initPostHog() {
  const consent = localStorage.getItem('cookie-consent');
  if (consent !== 'accepted') return;

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false,         // We handle this manually
    capture_pageleave: true,
    session_recording: { maskAllInputs: true },
  });
}
```

```typescript
// Provider wrapping app/layout.tsx
// app/providers.tsx
'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import posthog from 'posthog-js';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    posthog.capture('$pageview');
  }, [pathname, searchParams]);

  return <>{children}</>;
}
```

### Events to Track

```typescript
// Track these events throughout the app:

// Auth
posthog.capture('signed_up', { method: 'email' | 'github' });
posthog.capture('signed_in', { method: 'email' | 'github' });

// Onboarding
posthog.capture('workspace_created');
posthog.capture('first_project_created');
posthog.capture('first_integration_connected', { provider: 'github' });
posthog.capture('first_query_made');

// Core usage
posthog.capture('context_queried', { project_id, tokens_used });
posthog.capture('context_ingested', { source, type });
posthog.capture('integration_connected', { provider });
posthog.capture('integration_disconnected', { provider });

// Conversion
posthog.capture('pricing_page_viewed');
posthog.capture('upgrade_clicked', { from_plan: 'free', to_plan: 'pro' });
posthog.capture('subscription_started', { plan });
posthog.capture('subscription_canceled', { plan, reason });

// Engagement
posthog.capture('query_limit_hit');                 // Key conversion trigger
posthog.capture('invite_sent');
posthog.capture('team_member_joined');
```

### Key Funnels to Monitor
1. **Signup → First Query** (activation)
2. **First Query → Query Limit Hit** (conversion pressure)
3. **Query Limit Hit → Upgrade** (conversion rate)
4. **Signup → Integration Connected** (engagement)

---

## Error Tracking: Sentry

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,          // 10% of transactions
  replaysOnErrorSampleRate: 1.0,  // 100% of errors get replay
  replaysSessionSampleRate: 0.01, // 1% of sessions
});
```

```env
NEXT_PUBLIC_SENTRY_DSN=https://your@sentry.io/project
SENTRY_ORG=contextmesh
SENTRY_PROJECT=contextmesh-web
```

---

## SEO Setup

### Meta Tags (app/layout.tsx)
```typescript
export const metadata: Metadata = {
  title: {
    default: 'ContextMesh — Shared Memory for AI-Powered Teams',
    template: '%s | ContextMesh',
  },
  description: 'Stop repeating yourself to every AI. ContextMesh gives your team a shared memory layer — queryable by any agent, developer, or tool.',
  keywords: ['AI context', 'shared memory', 'AI agents', 'developer tools', 'GitHub integration'],
  openGraph: {
    type: 'website',
    url: 'https://contextmesh.vercel.app',
    title: 'ContextMesh — Shared Memory for AI-Powered Teams',
    description: 'Stop repeating yourself to every AI.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ContextMesh',
    description: 'Shared memory for AI-powered teams',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  metadataBase: new URL('https://contextmesh.vercel.app'),
};
```

### Sitemap (app/sitemap.ts)
```typescript
export default function sitemap() {
  return [
    { url: 'https://contextmesh.vercel.app', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://contextmesh.vercel.app/pricing', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://contextmesh.vercel.app/docs', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://contextmesh.vercel.app/privacy', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: 'https://contextmesh.vercel.app/terms', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];
}
```

### robots.txt (public/robots.txt)
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /settings/

Sitemap: https://contextmesh.vercel.app/sitemap.xml
```

### Google Search Console
1. Go to https://search.google.com/search-console
2. Add property → URL prefix: `https://contextmesh.vercel.app`
3. Verify via HTML tag in `<head>`:
   ```typescript
   // app/layout.tsx metadata
   verification: { google: 'your-verification-code' }
   ```
4. Submit sitemap: `https://contextmesh.vercel.app/sitemap.xml`
5. Check for crawl errors after 48 hours

### Other Search Engines
- **Bing Webmaster Tools:** https://www.bing.com/webmasters
- **Yandex Webmaster:** https://webmaster.yandex.com (if targeting Russian market)

---

## Marketing Checklist

### Pre-Launch
- [ ] OG image created (1200x630px, matches brand)
- [ ] Favicon set (32x32, 16x16, SVG)
- [ ] Meta description under 160 characters
- [ ] Title under 60 characters
- [ ] Sitemap submitted to Google Search Console
- [ ] robots.txt in place
- [ ] Page load speed < 3s (check with PageSpeed Insights)

### Launch Day
- [ ] Post on Product Hunt (prepare 3 days ahead)
- [ ] Post on Hacker News (Show HN)
- [ ] Post on Reddit: r/SideProject, r/webdev, r/artificial
- [ ] Post on IndieHackers
- [ ] Tweet/X thread with demo video
- [ ] Post on LinkedIn

### Feedback Loop
- [ ] Contact email: `hello@contextmesh.com`
- [ ] Bug report link in app footer (opens GitHub Issues or email)
- [ ] In-app feedback button (bottom-right corner)
- [ ] NPS survey after 14 days of usage (PostHog survey feature)

---

## Vercel Analytics

Already included with Vercel Hobby plan:
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```
