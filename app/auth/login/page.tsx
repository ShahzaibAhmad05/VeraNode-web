'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { LogIn, Key, AlertTriangle, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [secretKey, setSecretKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
      await login(secretKey);
      // Navigation is handled in AuthContext after successful login
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your secret key.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 top-16 flex items-center justify-center px-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <Card hover={false} className="p-10">
          {/* Header */}
          <div className="flex items-center gap-6 mb-8">
            {/* Key Icon - Left */}
            <div className="w-20 h-20 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
              <Key className="w-10 h-10 text-white" />
            </div>
            
            {/* Welcome Text - Right */}
            <div className="flex-1">
              <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                Welcome Back!
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Login using Zero-Knowledge Authentication
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Secret Key"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Enter your secret key"
              required
              disabled={isLoading}
              showPasswordToggle={true}
              className="text-base"
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Login
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              New to VeraNode?{' '}
              <Link href="/auth/register" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                Create Account
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
