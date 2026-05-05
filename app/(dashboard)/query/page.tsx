import type { Metadata } from 'next';
import QueryPageClient from './QueryPageClient';

export const metadata: Metadata = {
  title: 'AI Query — ContextMesh',
  description: 'Ask natural language questions about your project, answered by AI grounded in real context.',
};

export default function QueryPage() {
  return <QueryPageClient />;
}
