'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import PasswordStrength from '@/components/ui/PasswordStrength';
import { SecurityBadgeGroup } from '@/components/ui/SecurityBadge';
import { UserPlus, Copy, CheckCircle, Shield, Info, AlertTriangle } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import type { AreaOfVote } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const [universityId, setUniversityId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setError('Password must meet all security requirements');
      return;
    }

    setIsLoading(true);

    try {
      await register(universityId, password, area);
      
      // Get the secret key from localStorage (set by AuthContext)
      const secretKey = localStorage.getItem('secret_key');
      if (secretKey) {
        setGeneratedSecretKey(secretKey);
        setShowSecretKeyModal(true);
      }
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
    router.push('/dashboard');
  };

  return (
    <>
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
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Create Account
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Join VeraNode and start discovering truth
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
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="University ID"
                type="text"
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                placeholder="e.g., 21i-1234"
                required
                disabled={isLoading}
                helperText="Enter your official university ID"
              />

              <Select
                label="School / Area"
                value={area}
                onChange={(e) => setArea(e.target.value as AreaOfVote)}
                options={areaOptions}
                disabled={isLoading}
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  disabled={isLoading}
                  showPasswordToggle={true}
                />
                {password && (
                  <div className="mt-3">
                    <PasswordStrength password={password} />
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
                showPasswordToggle={true}
                error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
              />

              {/* Terms and Privacy */}
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-900 dark:text-blue-300 font-medium mb-1">
                        How we protect you:
                      </p>
                      <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                        <li>• Zero-knowledge cryptography for anonymous voting</li>
                        <li>• Passwords hashed with bcrypt (industry standard)</li>
                        <li>• No personal data stored beyond university ID</li>
                        <li>• Blockchain ensures vote integrity and transparency</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I accept the{' '}
                    <button
                      type="button"
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      onClick={() => window.open('/terms', '_blank')}
                    >
                      Terms of Service
                    </button>
                    {' '}and{' '}
                    <button
                      type="button"
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      onClick={() => window.open('/privacy', '_blank')}
                    >
                      Privacy Policy
                    </button>
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
                disabled={!acceptedTerms}
              >
                <Shield className="w-4 h-4 mr-2" />
                Create Secure Account
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
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
        title="🔑 Your Secret Key"
        size="md"
        showCloseButton={false}
      >
        <div className="space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium mb-2">
              ⚠️ CRITICAL: Save this key now!
            </p>
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              This is your <strong>anonymous secret key</strong>. It's used to maintain your anonymity
              and reputation. You cannot recover this key if you lose it.
            </p>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
              SECRET KEY:
            </p>
            <div className="flex items-center space-x-2">
              <code className="flex-1 text-sm font-mono text-gray-900 dark:text-white break-all bg-white dark:bg-gray-900 p-3 rounded border border-gray-300 dark:border-gray-700">
                {generatedSecretKey}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopySecretKey}
                className="shrink-0"
              >
                {keyCopied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 <strong>Tip:</strong> Store this key in a password manager or write it down and keep it safe.
              You'll need it to maintain your reputation if you ever need to recover your account.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleCloseModal}
            className="w-full"
          >
            I've Saved My Secret Key
          </Button>
        </div>
      </Modal>
    </>
  );
}
