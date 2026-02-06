'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ShieldOff, ArrowLeft } from 'lucide-react';

export default function RecoverPage() {
  // Recovery is not available due to enhanced anonymity

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
            <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <ShieldOff className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
              Recovery Not Available
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Secret keys cannot be recovered or regenerated
            </p>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-3 text-center">
              🔒 Why no recovery?
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-400 text-center leading-relaxed">
              To maintain complete anonymity and zero-knowledge authentication, 
              VeraNode does not store any personal information that could be used 
              for account recovery. Your secret key is the only way to access your account.
            </p>
          </div>

          {/* Warning Box */}
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl">
            <p className="text-sm text-yellow-900 dark:text-yellow-300 font-bold text-center">
              ⚠️ If you&apos;ve lost your secret key, you&apos;ll need to create a new account
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/auth/login">
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 text-base font-bold rounded-xl"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Login
              </Button>
            </Link>

            <Link href="/auth/register">
              <Button
                variant="primary"
                size="lg"
                className="w-full h-12 text-base font-bold rounded-xl"
              >
                Create New Account
              </Button>
            </Link>
          </div>
        </Card>

        {/* Privacy Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
        >
          <p className="text-sm text-center text-gray-700 dark:text-gray-300">
            💡 <strong>Tip:</strong> Store your secret key in a secure password manager to prevent loss
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
