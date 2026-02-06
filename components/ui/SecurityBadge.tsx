'use client';

import React from 'react';
import { Shield, Lock, Eye, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SecurityBadgeProps {
  variant?: 'encryption' | 'privacy' | 'verification' | 'blockchain';
  className?: string;
}

export default function SecurityBadge({ variant = 'encryption', className }: SecurityBadgeProps) {
  const badges = {
    encryption: {
      icon: Lock,
      label: '256-bit Encryption',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    privacy: {
      icon: Eye,
      label: 'Anonymous Voting',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    verification: {
      icon: CheckCircle2,
      label: 'Verified System',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
    blockchain: {
      icon: Shield,
      label: 'Blockchain Secured',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
    },
  };

  const badge = badges[variant];
  const Icon = badge.icon;

  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium',
      badge.bgColor,
      badge.borderColor,
      badge.color,
      className
    )}>
      <Icon className="w-3.5 h-3.5" />
      <span>{badge.label}</span>
    </div>
  );
}

export function SecurityBadgeGroup({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap gap-2 justify-center', className)}>
      <SecurityBadge variant="encryption" />
      <SecurityBadge variant="privacy" />
      <SecurityBadge variant="blockchain" />
    </div>
  );
}
