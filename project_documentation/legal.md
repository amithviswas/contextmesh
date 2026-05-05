# ⚖️ ContextMesh — Legal Pages

> These pages must exist before public launch. Create them as actual routes in Next.js.

---

## Pages Required

| Page | Route | Priority |
|------|-------|----------|
| Privacy Policy | `/privacy` | 🔴 Required before launch |
| Terms of Service | `/terms` | 🔴 Required before launch |
| Cookie Policy | `/cookies` | 🟡 Required if targeting EU |
| Data Processing Agreement | `/dpa` | 🟡 Required for business customers |

---

## Privacy Policy — Key Sections to Include

```
Last updated: [Date of launch]

1. What data we collect
   - Account information (email, name)
   - Usage data (queries made, integrations connected)
   - Integration data (GitHub commits, Slack messages you choose to sync)
   - Payment information (processed by Stripe — we never see card numbers)
   - Log data (IP address, browser, pages visited)

2. How we use your data
   - To provide and improve the service
   - To send transactional emails (verify email, billing)
   - To analyze usage patterns (aggregated, anonymized)
   - We NEVER sell your data to third parties
   - We NEVER use your project context to train AI models

3. Data storage
   - Data stored on Supabase (hosted on AWS/GCP)
   - Servers located in: [Supabase region you choose]
   - Encrypted at rest and in transit

4. Third-party services we use
   - Supabase (database and auth)
   - Vercel (hosting)
   - Stripe (payments)
   - Anthropic (AI queries — your context is sent to Claude API)
   - Resend (emails)
   - PostHog (analytics)
   - Sentry (error tracking)

5. Your rights (GDPR if EU users)
   - Access your data
   - Delete your account and all data
   - Export your data
   - Opt out of analytics

6. Data retention
   - Active accounts: retained indefinitely while active
   - Deleted accounts: all data purged within 30 days

7. Contact
   - privacy@contextmesh.com
```

---

## Terms of Service — Key Sections

```
1. Acceptance
   By using ContextMesh, you agree to these terms.

2. Account
   - You must be 18+ to use this service
   - You are responsible for your account security
   - One account per person

3. Acceptable Use
   You may NOT:
   - Use to store illegal content
   - Attempt to reverse engineer or scrape the service
   - Share accounts between organizations
   - Use the API to build a competing product

4. Service Availability
   - We aim for 99.5% uptime but don't guarantee it
   - Free plan has no SLA
   - Pro/Team plan: we'll try to notify of downtime

5. Payments
   - Subscriptions billed monthly or annually
   - Cancel anytime — access until end of period
   - No refunds for partial months
   - Prices may change with 30 days notice

6. Data Ownership
   - You own all data you put into ContextMesh
   - You grant us license to process it to provide the service
   - We don't claim ownership of your code, decisions, or context

7. Termination
   - We can terminate accounts that violate these terms
   - You can delete your account anytime from Settings

8. Limitation of Liability
   - Service provided "as is"
   - Not liable for data loss (back up important data)
   - Maximum liability: amount paid in last 3 months

9. Changes
   - We'll notify users of material changes via email
   - Continued use = acceptance
```

---

## Cookie Policy

```
Cookies we use:
- supabase-auth-token: Authentication (essential, cannot opt out)
- ph_*: PostHog analytics (optional, can opt out)
- stripe_*: Stripe payment processing (essential for paying customers)

Cookie banner required for EU users.
Use a simple banner: "We use cookies for auth and analytics. [Accept] [Manage]"
```

---

## Cookie Consent Banner (Component)

```typescript
// components/ui/CookieBanner.tsx
'use client';
import { useState, useEffect } from 'react';

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShow(false);
    // Initialize PostHog analytics
  };

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShow(false);
    // Don't initialize PostHog
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[var(--color-bg-elevated)] border-t border-[var(--color-bg-border)]">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm text-[var(--color-text-secondary)]">
          We use cookies for authentication and anonymous analytics.{' '}
          <a href="/cookies" className="text-[var(--color-accent-primary)] underline">Learn more</a>
        </p>
        <div className="flex gap-2 shrink-0">
          <button onClick={decline} className="px-3 py-1.5 text-sm border border-[var(--color-bg-border)] rounded-lg">
            Decline
          </button>
          <button onClick={accept} className="px-3 py-1.5 text-sm bg-[var(--color-accent-primary)] text-[#0A0A0F] rounded-lg font-medium">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Legal Checklist

- [ ] Privacy Policy page live at `/privacy`
- [ ] Terms of Service live at `/terms`
- [ ] Cookie Policy live at `/cookies`
- [ ] Cookie consent banner implemented (EU targeting)
- [ ] Footer links to all legal pages on every page
- [ ] Privacy Policy linked in signup form ("By signing up, you agree to our [Terms] and [Privacy Policy]")
- [ ] Contact email `privacy@contextmesh.com` set up (use Resend or forward)
- [ ] Data deletion works (Settings → Delete Account wipes all user data)
