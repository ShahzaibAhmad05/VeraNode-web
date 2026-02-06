'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { LogIn, Shield, AlertTriangle, Lock } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAdminAuth();
  const [adminKey, setAdminKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate admin key format (64 character hex string)
    if (!/^[a-fA-F0-9]{64}$/.test(adminKey)) {
      setError('Invalid admin key format. Must be a 64-character hexadecimal string.');
      setIsLoading(false);
      return;
    }

    try {
      await login(adminKey);
      // Navigation is handled in AdminAuthContext after successful login
    } catch (err: any) {
      setError(err.response?.data?.message || 'Admin login failed. Please check your admin key.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <Card hover={false} className="p-10 border-2 border-red-500/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-linear-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
              Admin Login
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Authorized access only
            </p>
          </div>

          {/* Warning Banner */}
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-800 dark:text-red-300 mb-1">
                  High Security Area
                </p>
                <p className="text-xs text-red-700 dark:text-red-400">
                  All admin actions are logged and monitored
                </p>
              </div>
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
              label="Admin Private Key"
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter your 64-character admin key"
              required
              disabled={isLoading}
              showPasswordToggle={true}
              className="text-base font-mono"
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all bg-linear-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Admin Login
            </Button>
          </form>

          {/* Footer Info */}
          <div className="mt-8 space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
              <div className="flex items-start justify-center space-x-2">
                <Lock className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-xs text-center text-yellow-900 dark:text-yellow-300 font-medium">
                  <strong>Key Format:</strong> 64-character hexadecimal string (0-9, a-f)
                  <br />
                  <strong>Security:</strong> Admin sessions auto-expire when browser closes
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
        >
          <div className="flex items-start justify-center space-x-2">
            <Shield className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-center text-red-900 dark:text-red-300">
              <strong>Admin Key Security</strong> - Never share or expose your admin key. Sessions are browser-specific.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
