'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { SecurityBadgeGroup } from '@/components/ui/SecurityBadge';
import { LogIn, Shield, Lock, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [universityId, setUniversityId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(universityId, password);
      // Navigation is handled in AuthContext after successful login
    } catch (err: any) {
      setLoginAttempts(prev => prev + 1);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card hover={false} className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Login to your VeraNode account
            </p>
          </div>

          {/* Security Badges */}
          <div className="mb-6">
            <SecurityBadgeGroup />
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                  {loginAttempts >= 3 && (
                    <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                      Multiple failed attempts detected. Please verify your credentials.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="University ID"
              type="text"
              value={universityId}
              onChange={(e) => setUniversityId(e.target.value)}
              placeholder="e.g., 21i-1234"
              required
              disabled={isLoading}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              showPasswordToggle={true}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Login
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              href="/auth/register"
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Register here
            </Link>
          </div>
        </Card>

        {/* Security Info Boxes */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 space-y-3"
        >
          <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                  🔐 Your Privacy is Protected
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-400">
                  All data is encrypted end-to-end. Your votes are anonymous and cannot be traced back to you.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700 dark:text-gray-300">
                <strong>Secure Connection:</strong> This site uses bank-level encryption (TLS 1.3) to protect your data.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
