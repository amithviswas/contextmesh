'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    posthog?: {
      init: (key: string, options: Record<string, unknown>) => void;
      capture: (event: string, props?: Record<string, unknown>) => void;
      identify: (id: string, props?: Record<string, unknown>) => void;
    };
  }
}

function loadPostHog() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || typeof window === 'undefined' || window.posthog) return;
  import('posthog-js').then(({ default: posthog }) => {
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
      capture_pageview: false,
      capture_pageleave: true,
      session_recording: { maskAllInputs: true },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).posthog = posthog;
  }).catch(() => {});
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  useEffect(() => {
    // Init if already consented
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'accepted' && !initialized.current) {
      loadPostHog();
      initialized.current = true;
    }

    // Listen for consent being given
    const handleConsent = () => {
      if (!initialized.current) {
        loadPostHog();
        initialized.current = true;
      }
    };
    window.addEventListener('cookie-consent-accepted', handleConsent);
    return () => window.removeEventListener('cookie-consent-accepted', handleConsent);
  }, []);

  // Track pageviews
  useEffect(() => {
    window.posthog?.capture('$pageview');
  }, [pathname, searchParams]);

  return <>{children}</>;
}

// Utility function for capturing events anywhere in the app
export function track(event: string, props?: Record<string, unknown>) {
  window.posthog?.capture(event, props);
}
