'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
}

interface Requirement {
  label: string;
  met: boolean;
}

export default function PasswordStrength({ password, showRequirements = true }: PasswordStrengthProps) {
  const requirements: Requirement[] = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = requirements.filter(r => r.met).length;
  const strengthPercentage = (metCount / requirements.length) * 100;

  const getStrength = () => {
    if (metCount === 0) return { label: '', color: '' };
    if (metCount <= 2) return { label: 'Weak', color: 'bg-red-500' };
    if (metCount === 3) return { label: 'Fair', color: 'bg-yellow-500' };
    if (metCount === 4) return { label: 'Good', color: 'bg-blue-500' };
    return { label: 'Strong', color: 'bg-green-500' };
  };

  const strength = getStrength();

  if (!password) return null;

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Password Strength
          </span>
          {strength.label && (
            <span className={cn(
              'text-xs font-semibold',
              metCount <= 2 && 'text-red-600 dark:text-red-400',
              metCount === 3 && 'text-yellow-600 dark:text-yellow-400',
              metCount === 4 && 'text-blue-600 dark:text-blue-400',
              metCount === 5 && 'text-green-600 dark:text-green-400'
            )}>
              {strength.label}
            </span>
          )}
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-300', strength.color)}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Shield className="w-3.5 h-3.5" />
            Password Requirements
          </div>
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center gap-2">
              {req.met ? (
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-400 dark:text-gray-600 shrink-0" />
              )}
              <span className={cn(
                'text-xs',
                req.met 
                  ? 'text-green-700 dark:text-green-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-400'
              )}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
