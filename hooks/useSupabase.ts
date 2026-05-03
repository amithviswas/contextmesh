'use client';

import { useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Returns the Supabase client, memoized for the component lifecycle.
 * Safe to call at component top level.
 */
export function useSupabase() {
  return useMemo(() => createClient(), []);
}
