'use client';

import { useEffect, useState } from 'react';

export function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = scrollHeight > 0 ? (scrolled / scrollHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  return (
    <div className="flex justify-center mb-16">
      <div className="w-full max-w-md">
        {/* Progress Bar Container */}
        <div className="relative h-2 w-full bg-gray-200/60 dark:bg-gray-800/60 rounded-full overflow-hidden backdrop-blur-sm">
          {/* Progress Fill */}
          <div
            className="absolute left-0 top-0 h-full bg-linear-to-r from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-300 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
        
        {/* Progress Percentage */}
        <div className="mt-2 text-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {Math.round(scrollProgress)}% scrolled
          </span>
        </div>
      </div>
    </div>
  );
}
