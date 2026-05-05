import type { Metadata } from 'next';
import { Suspense } from 'react';
import IntegrationsClient from './IntegrationsClient';

export const metadata: Metadata = {
  title: 'Integrations — ContextMesh',
  description: 'Connect GitHub, Slack, Jira, and Linear to auto-ingest context.',
};

export default function IntegrationsPage() {
  return (
    <div className="page-enter">
      <Suspense fallback={null}>
        <IntegrationsClient />
      </Suspense>
    </div>
  );
}
