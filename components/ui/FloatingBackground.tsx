'use client';

import { useEffect, useState } from 'react';

export function FloatingBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-linear-to-br from-white via-gray-50 to-blue-50 dark:from-black dark:via-gray-950 dark:to-gray-900">
      {/* Animated gradient orbs */}
      <div 
        className="absolute top-20 left-20 w-72 h-72 bg-blue-200/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: '0s', animationDuration: '8s' }}
      />
      <div 
        className="absolute top-1/3 right-32 w-96 h-96 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: '2s', animationDuration: '10s' }}
      />
      <div 
        className="absolute bottom-32 left-1/4 w-80 h-80 bg-blue-100/20 dark:bg-blue-700/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: '4s', animationDuration: '12s' }}
      />
      <div 
        className="absolute bottom-20 right-1/3 w-64 h-64 bg-blue-400/20 dark:bg-blue-400/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: '1s', animationDuration: '9s' }}
      />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" 
        style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
}
