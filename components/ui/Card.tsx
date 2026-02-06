'use client';

import React, { HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = true, children, ...props }, ref) => {
    if (!hover) {
      return (
        <div
          ref={ref}
          className={cn(
            'bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6',
            'border border-gray-200 dark:border-gray-800',
            'transition-shadow duration-200',
            className
          )}
          {...props}
        >
          {children}
        </div>
      );
    }

    const MotionDiv = motion.div as any;

    return (
      <MotionDiv
        ref={ref}
        className={cn(
          'bg-white dark:bg-gray-900 rounded-xl shadow-md p-6',
          'border border-gray-200 dark:border-gray-800',
          'transition-all duration-150',
          'hover:shadow-lg',
          className
        )}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </MotionDiv>
    );
  }
);

Card.displayName = 'Card';

export default Card;
