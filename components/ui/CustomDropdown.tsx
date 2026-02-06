'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  className?: string;
  placeholder?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  className,
  placeholder = 'Select...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200',
          'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
          'hover:bg-gray-300 dark:hover:bg-gray-600',
          'flex items-center justify-between gap-2 min-w-35',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'dark:focus:ring-offset-gray-900 text-md'
        )}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'absolute top-full mt-2 left-0 z-50',
              'bg-white dark:bg-gray-800 rounded-xl shadow-xl',
              'border border-gray-200 dark:border-gray-700',
              'overflow-hidden min-w-35',
              'py-1'
            )}
          >
            {options.map((option, index) => (
              <motion.button
                key={option.value}
                type="button"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15, delay: index * 0.03 }}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full px-4 py-2.5 text-left text-sm transition-colors',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  value === option.value
                    ? 'bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300'
                )}
              >
                {option.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDropdown;
