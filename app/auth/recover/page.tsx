'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { KeyRound, Copy, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

export default function RecoverPage() {
  const router = useRouter();
  const { recover } = useAuth();
  const [universityId, setUniversityId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recoveredKey, setRecoveredKey] = useState('');
  const [keyCopied, setKeyCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await recover(universityId, password);
      setRecoveredKey(response.secretKey);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Recovery failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  const handleCopyKey = async () => {
    const success = await copyToClipboard(recoveredKey);
    if (success) {
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    }
  };

  const handleContinueToLogin = () => {
    router.push('/auth/login');
  };

  if (recoveredKey) {
    // Show recovered key
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg"
        >
          <Card hover={false} className="p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                Key Recovered!
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Your secret key has been successfully recovered
              </p>
            </div>

            {/* Warning */}
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl">
              <p className="text-sm text-yellow-900 dark:text-yellow-300 font-bold text-center">
                ⚠️ Save this key securely - you'll need it to login!
              </p>
            </div>

            {/* Secret Key Display */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border-2 border-gray-300 dark:border-gray-700 mb-6">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 font-bold uppercase tracking-wider text-center">
                Your Secret Key
              </p>
              <code className="block text-base font-mono font-bold text-gray-900 dark:text-white break-all bg-white dark:bg-gray-950 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-center">
                {recoveredKey}
              </code>
              <Button
                variant={keyCopied ? "success" : "primary"}
                size="lg"
                onClick={handleCopyKey}
                className="w-full mt-4 h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {keyCopied ? (
                  <>
                    <CheckCircle className="w-6 h-6 mr-2" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-6 h-6 mr-2" />
                    Copy Secret Key
                  </>
                )}
              </Button>
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={handleContinueToLogin}
              className="w-full h-12 text-base font-bold rounded-xl"
            >
              Continue to Login
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Show recovery form
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <Card hover={false} className="p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <KeyRound className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
              Recover Secret Key
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Enter your university credentials to recover your secret key
            </p>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-sm text-blue-900 dark:text-blue-300 text-center">
              💡 Use the university ID and password you registered with
            </p>
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

          {/* Recovery Form */}
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
              isLoading={isLoading}
              className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <KeyRound className="w-5 h-5 mr-2" />
              Recover Secret Key
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
