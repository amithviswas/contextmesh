'use client';

import { useState } from 'react';
import OnboardingChecklist from '@/components/onboarding/OnboardingChecklist';

interface Props {
  completedSteps: string[];
}

export default function DashboardClient({ completedSteps }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <OnboardingChecklist
      completedSteps={completedSteps}
      onDismiss={() => setDismissed(true)}
    />
  );
}
