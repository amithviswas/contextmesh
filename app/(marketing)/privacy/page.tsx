import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — ContextMesh',
  description: 'How ContextMesh collects, uses, and protects your data.',
};

const UPDATED = 'May 16, 2025';

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px' }}>
      <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Legal</p>
      <h1 style={{ fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.025em' }}>Privacy Policy</h1>
      <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginBottom: '48px', fontFamily: 'var(--font-mono)' }}>Last updated: {UPDATED}</p>

      <Legal sections={[
        {
          title: '1. What Data We Collect',
          content: [
            'Account information: your email address and display name when you sign up.',
            'Usage data: queries made, projects created, integrations connected, context items added.',
            'Integration data: GitHub commits, Slack messages, and other content you explicitly choose to sync into ContextMesh.',
            'Payment information: processed entirely by Stripe — we never see or store your card number.',
            'Log data: IP address, browser type, pages visited, and error logs for debugging.',
          ],
        },
        {
          title: '2. How We Use Your Data',
          content: [
            'To provide, operate, and improve the ContextMesh service.',
            'To send transactional emails (email verification, billing receipts).',
            'To analyze aggregate, anonymized usage patterns to improve the product.',
            'We never sell your data to third parties — ever.',
            'We never use your project context or code to train AI models.',
          ],
        },
        {
          title: '3. Data Storage & Security',
          content: [
            'All data is stored on Supabase (hosted on AWS). Servers are located in the US East region.',
            'Data is encrypted at rest (AES-256) and in transit (TLS 1.3).',
            'Row-level security (RLS) ensures your workspace data is strictly isolated from other users.',
          ],
        },
        {
          title: '4. Third-Party Services',
          content: [
            'Supabase — database, vector search, and authentication.',
            'Vercel — hosting and edge delivery.',
            'Stripe — payment processing (PCI compliant).',
            'Groq / Llama 3.3 — AI inference for query responses. Your context is sent to Groq\'s API to generate answers.',
            'Resend — transactional email delivery.',
            'PostHog — product analytics (only after cookie consent).',
            'Sentry — error tracking and performance monitoring.',
          ],
        },
        {
          title: '5. Your Rights (GDPR)',
          content: [
            'Access: request a copy of all data we hold about you.',
            'Delete: delete your account from Settings → Danger Zone. All data is purged within 30 days.',
            'Export: contact us to receive a JSON export of your data.',
            'Opt out: decline analytics cookies from the cookie banner at any time.',
            'For any data requests, email: privacy@contextmesh.app',
          ],
        },
        {
          title: '6. Data Retention',
          content: [
            'Active accounts: data retained while your account is active.',
            'Deleted accounts: all personal data and project context is permanently deleted within 30 days of account deletion.',
          ],
        },
        {
          title: '7. Contact',
          content: [
            'For privacy questions or data requests, email: privacy@contextmesh.app',
          ],
        },
      ]} />

      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--bg-border)', display: 'flex', gap: '24px' }}>
        <Link href="/terms" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none' }}>Terms of Service →</Link>
        <Link href="/cookies" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none' }}>Cookie Policy →</Link>
      </div>
    </div>
  );
}

function Legal({ sections }: { sections: { title: string; content: string[] }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      {sections.map(({ title, content }) => (
        <div key={title}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: '12px' }}>{title}</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {content.map((c, i) => (
              <li key={i} style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: '16px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--accent)' }}>·</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
