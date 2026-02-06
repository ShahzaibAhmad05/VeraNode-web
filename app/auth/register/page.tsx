'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import { ArrowLeft, ArrowRight, Copy, CheckCircle, AlertTriangle, Key, Loader2, Shield } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import type { Department } from '@/types';

type Step = 'email' | 'password' | 'verifying' | 'success';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState<Department>('SEECS');
  const [error, setError] = useState('');
  const [generatedSecretKey, setGeneratedSecretKey] = useState('');
  const [keyCopied, setKeyCopied] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const departmentOptions = [
    { value: 'SEECS', label: 'SEECS - School of Electrical Engineering & Computer Science' },
    { value: 'NBS', label: 'NBS - NUST Business School' },
    { value: 'ASAB', label: 'ASAB - Atta-ur-Rahman School of Applied Biosciences' },
    { value: 'SINES', label: 'SINES - School of Natural Sciences' },
    { value: 'SCME', label: 'SCME - School of Civil and Environmental Engineering' },
    { value: 'S3H', label: 'S3H - School of Social Sciences and Humanities' },
  ];

  const handleEmailNext = () => {
    setError('');
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Invalid email format');
      return;
    }

    if (!email.toLowerCase().endsWith('.edu.pk')) {
      setError('Email must end with .edu.pk');
      return;
    }

    setStep('password');
  };

  const handlePasswordNext = async () => {
    setError('');

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setStep('verifying');

    // Simulate verification delay for smooth UX
    setTimeout(async () => {
      try {
        const response = await register(email, password, department);
        setGeneratedSecretKey(response.secretKey);
        
        // Short delay before showing success
        setTimeout(() => {
          setStep('success');
        }, 800);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
        setStep('password');
      }
    }, 1500);
  };

  const handleCopySecretKey = async () => {
    const success = await copyToClipboard(generatedSecretKey);
    if (success) {
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    }
  };

  const handleGoToLogin = () => {
    router.push('/auth/login');
  };

  const handleBack = () => {
    setError('');
    if (step === 'password') setStep('email');
  };

  return (
    <div className="fixed inset-0 top-16 flex items-center justify-center px-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card hover={false} className="p-8">
          {/* Logo & Branding */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              VeraNode
            </h1>
          </div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Create account
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Let's get started with your university email
                </p>

                <div className="space-y-4">
                  <Input
                    label="University email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@nust.edu.pk"
                    onKeyDown={(e) => e.key === 'Enter' && handleEmailNext()}
                    autoFocus
                  />

                  <Select
                    label="Department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as Department)}
                    options={departmentOptions}
                  />

                  <Button
                    onClick={handleEmailNext}
                    variant="primary"
                    className="w-full mt-6"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    Sign in
                  </Link>
                </div>
              </motion.div>
            )}

            {step === 'password' && (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={handleBack}
                  className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </button>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Enter password
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">
                  Type your password for this email account:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {email}
                </p>

                <div className="space-y-4">
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter here"
                    showPasswordToggle
                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordNext()}
                    autoFocus
                    helperText="Minimum 8 characters"
                  />

                  <Button
                    onClick={handlePasswordNext}
                    variant="primary"
                    className="w-full mt-6"
                  >
                    Create account
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'verifying' && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-6"
                >
                  <Loader2 className="w-16 h-16 text-blue-600" />
                </motion.div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Creating your account
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Verifying your school email...
                </p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </motion.div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Account created successfully
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 px-4">
                    This secret key cannot be recovered later, save it right now!
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider">
                        Your Secret Key
                      </p>
                    </div>
                    <button
                      onClick={handleCopySecretKey}
                      className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title={keyCopied ? "Copied!" : "Copy to clipboard"}
                    >
                      {keyCopied ? (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                  <code className="block text-sm font-mono font-bold text-gray-900 dark:text-white break-all bg-white dark:bg-gray-900 p-3 rounded border border-gray-300 dark:border-gray-600">
                    {generatedSecretKey}
                  </code>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleGoToLogin}
                    variant="primary"
                    className="w-full"
                  >
                    Continue to login
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
