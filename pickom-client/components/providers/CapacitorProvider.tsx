'use client';

import { useEffect } from 'react';
import { initializeCapacitor, cleanupCapacitor, isNative } from '@/lib/capacitor-init';
import { testServerConnection } from '@/app/api/base';

/**
 * Capacitor Provider - initializes Capacitor plugins on app startup
 * This is a client component that should be added to root layout
 */
export function CapacitorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Capacitor plugins
    initializeCapacitor();

    // Test server connectivity on native platforms
    if (isNative()) {
      setTimeout(async () => {
        await testServerConnection();
      }, 2000); // Wait 2 seconds for app to fully load
    }

    // Cleanup on unmount (though root layout rarely unmounts)
    return () => {
      cleanupCapacitor();
    };
  }, []);

  return <>{children}</>;
}
