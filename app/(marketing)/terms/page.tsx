import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service — ContextMesh',
  description: 'Terms governing your use of ContextMesh.',
};

const UPDATED = 'May 16, 2025';

export default function TermsPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px' }}>
      <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Legal</p>
      <h1 style={{ fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.025em' }}>Terms of Service</h1>
      <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '48px', fontFamily: 'var(--font-mono)' }}>Last updated: {UPDATED}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
        {[
          { title: '1. Acceptance', body: 'By accessing or using ContextMesh, you agree to these Terms of Service. If you do not agree, do not use the service.' },
          { title: '2. Account', body: 'You must be at least 18 years old to use ContextMesh. You are responsible for maintaining the security of your account credentials. One account per person — do not share accounts between organizations.' },
          { title: '3. Acceptable Use', body: 'You agree NOT to: store illegal, harmful, or infringing content; attempt to reverse-engineer or scrape the service; share accounts between separate organizations; or use the ContextMesh API to build a directly competing product.' },
          { title: '4. Service Availability', body: 'We aim for 99.5% uptime but do not guarantee it. The Free plan has no SLA. Pro and Team plans: we will make reasonable efforts to provide advance notice of planned downtime.' },
          { title: '5. Payments & Billing', body: 'Subscriptions are billed monthly. You may cancel at any time — your plan remains active until the end of the current billing period. No refunds are issued for partial months. Prices may change with 30 days\' email notice.' },
          { title: '6. Data Ownership', body: 'You own all data, code, decisions, and context you put into ContextMesh. You grant us a limited license to process this data solely to provide the service to you. We claim no ownership over your intellectual property.' },
          { title: '7. Termination', body: 'We reserve the right to suspend or terminate accounts that violate these Terms. You may delete your account at any time from Settings → Danger Zone.' },
          { title: '8. Limitation of Liability', body: 'ContextMesh is provided "as is" without warranties of any kind. We are not liable for data loss — back up important data independently. Our maximum liability is limited to the amount you paid in the last 3 months.' },
          { title: '9. Changes to Terms', body: 'We will notify users of material changes to these Terms via email. Continued use of the service after notification constitutes acceptance of the updated Terms.' },
          { title: '10. Contact', body: 'For legal inquiries, contact: hello@contextmesh.app' },
        ].map(({ title, body }) => (
          <div key={title}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: '10px' }}>{title}</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.75 }}>{body}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--bg-border)', display: 'flex', gap: '24px' }}>
        <Link href="/privacy" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none' }}>Privacy Policy →</Link>
        <Link href="/cookies" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none' }}>Cookie Policy →</Link>
      </div>
    </div>
  );
}
