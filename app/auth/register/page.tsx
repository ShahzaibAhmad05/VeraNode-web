'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { UserPlus, Copy, CheckCircle, AlertTriangle, Shield, Key, Lightbulb } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import type { AreaOfVote } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const [area, setArea] = useState<AreaOfVote>('General');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSecretKeyModal, setShowSecretKeyModal] = useState(false);
  const [generatedSecretKey, setGeneratedSecretKey] = useState('');
  const [keyCopied, setKeyCopied] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const areaOptions = [
    { value: 'General', label: 'General' },
    { value: 'SEECS', label: 'SEECS - School of Electrical Engineering & Computer Science' },
    { value: 'NBS', label: 'NBS - NUST Business School' },
    { value: 'ASAB', label: 'ASAB - Atta-ur-Rahman School of Applied Biosciences' },
    { value: 'SINES', label: 'SINES - School of Natural Sciences' },
    { value: 'SCME', label: 'SCME - School of Civil and Environmental Engineering' },
    { value: 'S3H', label: 'S3H - School of Social Sciences and Humanities' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!acceptedTerms) {
      setError('You must accept the Terms of Service and Privacy Policy to continue');
      return;
    }

    setIsLoading(true);

    try {
      const response = await register(area);
      
      // Show the secret key modal
      setGeneratedSecretKey(response.secretKey);
      setShowSecretKeyModal(true);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleCopySecretKey = async () => {
    const success = await copyToClipboard(generatedSecretKey);
    if (success) {
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    }
  };

  const handleCloseModal = () => {
    setShowSecretKeyModal(false);
    // Navigate to login to use the secret key
    router.push('/auth/login');
  };

  return (
    <>
      <div className="fixed inset-0 top-16 flex items-center justify-center px-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg"
        >
          <Card hover={false} className="p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-linear-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <UserPlus className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                Create Account
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Join VeraNode and start discovering truth
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

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Select
                label="School / Area"
                value={area}
                onChange={(e) => setArea(e.target.value as AreaOfVote)}
                options={areaOptions}
                disabled={isLoading}
              />

              {/* Terms Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  required
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  I accept the{' '}
                  <button
                    type="button"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    onClick={() => window.open('/terms', '_blank')}
                  >
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    onClick={() => window.open('/privacy', '_blank')}
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                disabled={!acceptedTerms}
              >
                <Shield className="w-5 h-5 mr-2" />
                Create Secure Account
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Login here
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Secret Key Modal */}
      <Modal
        isOpen={showSecretKeyModal}
        onClose={handleCloseModal}
        title=""
        size="lg"
        showCloseButton={false}
      >
        <div className="space-y-6">
          {/* Icon and Title */}
          <div className="text-center">
            <div className="w-20 h-20 bg-linear-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Key className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              Save Your Secret Key!
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400">
              This is your ONLY way to login. Keep it safe!
            </p>
          </div>

          {/* Warning Box */}
          <div className="bg-linear-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-6">
            <div className="flex items-start justify-center space-x-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-lg text-yellow-900 dark:text-yellow-300 font-bold text-center">
                SAVE YOUR SECRET KEY - it cannot be recovered or regenerated!
              </p>
            </div>
            <ul className="text-sm text-yellow-800 dark:text-yellow-400 space-y-2 list-disc list-inside">
              <li>Your secret key maintains your anonymity</li>
              <li>This is your ONLY way to login</li>
              <li>Lost keys cannot be recovered</li>
            </ul>
          </div>

          {/* Secret Key Display */}
          <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border-2 border-gray-300 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 font-bold uppercase tracking-wider text-center">
              Your Secret Key
            </p>
            <code className="block text-base font-mono font-bold text-gray-900 dark:text-white break-all bg-white dark:bg-gray-950 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-center">
              {generatedSecretKey}
            </code>
            <Button
              variant={keyCopied ? "success" : "primary"}
              size="lg"
              onClick={handleCopySecretKey}
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

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start justify-center space-x-2">
              <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900 dark:text-blue-300 text-center">
                <strong>Tip:</strong> Store this in a password manager or save it in a secure place
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={handleCloseModal}
            className="w-full h-12 text-base font-bold rounded-xl"
          >
            I've Saved My Secret Key - Continue to Login
          </Button>
        </div>
      </Modal>
    </>
  );
}
