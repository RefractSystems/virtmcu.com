'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getAnalyticsInstance } from '@/lib/client/firebase';
import { logEvent, type Analytics } from 'firebase/analytics';

export function FirebaseAnalyticsWatcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State to hold the analytics instance
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  // Effect to initialize Analytics once on component mount
  useEffect(() => {
    const initialize = async () => {
      const instance = await getAnalyticsInstance();
      setAnalytics(instance);
    };

    initialize();
  }, []); // Empty dependency array ensures this runs only once

  // Effect to log page_view when path or analytics instance changes
  useEffect(() => {
    // Don't log until analytics is initialized
    if (!analytics) {
      return;
    }

    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : '');

    logEvent(analytics, 'page_view', {
      page_location: url,
    });
  }, [pathname, searchParams, analytics]); // Re-run when these change

  return null;
}
