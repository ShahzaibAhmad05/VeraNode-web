'use client';

import { useEffect } from 'react';

export default function AuthDebugLoader() {
  useEffect(() => {
    // Dynamically import the debug utility in the browser
    import('@/lib/authDebug').catch((err) => {
      console.error('Failed to load auth debug utility:', err);
    });
  }, []);

  return null;
}
