'use client';

import { useEffect, useState } from 'react';

export function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / scrollHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress();

    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  return (
    <div className="fixed left-1/2 top-20 -translate-x-1/2 z-50 hidden lg:flex flex-col items-center">
      {/* Progress Bar Container */}
      <div className="relative h-64 w-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        {/* Progress Fill */}
        <div
          className="absolute bottom-0 w-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 ease-out"
          style={{ height: `${scrollProgress}%` }}
        />
      </div>
      
      {/* Progress Percentage */}
      <div className="mt-2 px-2 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {Math.round(scrollProgress)}%
        </span>
      </div>
    </div>
  );
}
