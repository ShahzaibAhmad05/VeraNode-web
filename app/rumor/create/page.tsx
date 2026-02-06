'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { PlusCircle, AlertCircle, CheckCircle, Sparkles, Check, X, BookOpen, FileText } from 'lucide-react';
import { rumorAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import type { AreaOfVote, AIValidation } from '@/types';

export default function CreateRumorPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'post' | 'instructions'>('post');
  const [content, setContent] = useState('');
  const [areaOfVote, setAreaOfVote] = useState<AreaOfVote>('General');
  const [votingDuration, setVotingDuration] = useState<number>(48); // hours
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationResult, setValidationResult] = useState<AIValidation | null>(null);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const areaOptions = [
    { value: 'General', label: 'General' },
    { value: 'SEECS', label: 'SEECS' },
    { value: 'NBS', label: 'NBS' },
    { value: 'ASAB', label: 'ASAB' },
    { value: 'SINES', label: 'SINES' },
    { value: 'SCME', label: 'SCME' },
    { value: 'S3H', label: 'S3H' },
  ];

  const durationOptions = [
    { value: '12', label: '12 hours' },
    { value: '24', label: '24 hours' },
    { value: '48', label: '48 hours (Recommended)' },
    { value: '72', label: '72 hours' },
  ];

  const calculateVotingEndsAt = (hours: number): string => {
    const now = new Date();
    const endsAt = new Date(now.getTime() + hours * 60 * 60 * 1000);
    return endsAt.toISOString();
  };

  const handlePreValidate = async () => {
    if (!content.trim()) {
      toast.error('Please enter rumor content');
      return;
    }

    setIsValidating(true);

    try {
      const votingEndsAt = calculateVotingEndsAt(votingDuration);
      const validation = await rumorAPI.validateWithAI(content, votingEndsAt);
      setValidationResult(validation);
      setShowValidationModal(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Please enter rumor content');
      return;
    }

    setIsSubmitting(true);

    try {
      const votingEndsAt = calculateVotingEndsAt(votingDuration);
      const rumor = await rumorAPI.create(content, areaOfVote, votingEndsAt);
      
      toast.success('Rumor posted successfully!');
      router.push(`/rumor/${rumor.id}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to post rumor';
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  const handleProceedAfterValidation = () => {
    setShowValidationModal(false);
    if (validationResult?.isValid) {
      handleSubmit(new Event('submit') as any);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-[calc(100vh-4rem)] px-4 py-12">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Tab Switch */}
            <div className="mb-8 flex items-center justify-center">
              <div className="relative bg-gray-200 dark:bg-gray-800 p-1.5 rounded-2xl inline-flex">
                <motion.div
                  className="absolute top-1.5 bottom-1.5 bg-white dark:bg-gray-700 rounded-xl shadow-md"
                  animate={{
                    left: activeTab === 'post' ? '6px' : '50%',
                    right: activeTab === 'post' ? '50%' : '6px',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
                <button
                  onClick={() => setActiveTab('post')}
                  className={`relative z-10 px-8 py-4 rounded-xl text-base font-semibold transition-colors duration-200 ${
                    activeTab === 'post'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5" />
                    <span>Post Rumor</span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('instructions')}
                  className={`relative z-10 px-8 py-4 rounded-xl text-base font-semibold transition-colors duration-200 ${
                    activeTab === 'instructions'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-5 h-5" />
                    <span>Instructions</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'post' ? (
                <motion.div
                  key="post-tab"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  {/* Form */}
                  <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <Textarea
                        label="Rumor Content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="E.g., I heard that the campus cafeteria will be renovated next month..."
                        rows={6}
                        required
                        disabled={isSubmitting || isValidating}
                        helperText={`${content.length} characters`}
                        className="resize-none"
                      />

                      <Select
                        label="Area of Vote"
                        value={areaOfVote}
                        onChange={(e) => setAreaOfVote(e.target.value as AreaOfVote)}
                        options={areaOptions}
                        disabled={isSubmitting || isValidating}
                      />

                      <div>
                        <Select
                          label="Voting Duration"
                          value={votingDuration.toString()}
                          onChange={(e) => setVotingDuration(Number(e.target.value))}
                          options={durationOptions}
                          disabled={isSubmitting || isValidating}
                        />
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          How long should the community have to vote on this rumor?
                        </p>
                      </div>

                      {user?.area !== areaOfVote && areaOfVote !== 'General' && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 flex items-center space-x-2">
                          <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" />
                          <p className="text-sm text-orange-800 dark:text-orange-300">
                            You're posting outside your area ({user?.area}). This is allowed, but votes from
                            within the selected area will have more weight.
                          </p>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={handlePreValidate}
                          isLoading={isValidating}
                          disabled={isSubmitting}
                          className="flex-1"
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          Validate with AI
                        </Button>

                        <Button
                          type="submit"
                          variant="primary"
                          size="lg"
                          isLoading={isSubmitting}
                          disabled={isValidating}
                          className="flex-1"
                        >
                          <PlusCircle className="w-5 h-5 mr-2" />
                          Post Rumor
                        </Button>
                      </div>
                    </form>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="instructions-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <Card>
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                          Posting Guidelines
                        </h2>
                      </div>

                      <div className="space-y-3 text-gray-700 dark:text-gray-300">
                        <p>
                          <strong>What is a rumor?</strong><br />
                          Unverified information that hasn't been confirmed. Post something you've heard but aren't sure about.
                        </p>

                        <p>
                          <strong>Choose the right area:</strong><br />
                          Select the most relevant area. Votes from people in that area carry more weight.
                        </p>

                        <p>
                          <strong>Use AI validation:</strong><br />
                          Optional but recommended. Checks if your content qualifies as a rumor and suggests improvements.
                        </p>

                        <p>
                          <strong>Voting duration:</strong><br />
                          48 hours is recommended for most rumors. Use shorter durations for time-sensitive content.
                        </p>

                        <p className="text-red-600 dark:text-red-400">
                          <strong>Warning:</strong><br />
                          False rumors result in point deductions and may affect your reputation score.
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={() => setActiveTab('post')}
                          className="w-full"
                        >
                          Got It! Let's Post a Rumor
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Validation Result Modal */}
      <Modal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        title="AI Validation Result"
        size="md"
      >
        {validationResult && (
          <div className="space-y-4">
            {/* Status */}
            <div
              className={`p-4 rounded-lg border ${
                validationResult.isValid
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {validationResult.isValid ? (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
                <h3
                  className={`font-semibold ${
                    validationResult.isValid
                      ? 'text-green-800 dark:text-green-300'
                      : 'text-red-800 dark:text-red-300'
                  }`}
                >
                  {validationResult.isValid ? 'Validation Passed' : 'Validation Failed'}
                </h3>
              </div>
              {validationResult.reason && (
                <p
                  className={`text-sm ${
                    validationResult.isValid
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}
                >
                  {validationResult.reason}
                </p>
              )}
            </div>

            {/* Details */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <strong>Is Rumor:</strong>{' '}
                {validationResult.isRumor ? (
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                    Yes <Check className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                    No <X className="w-4 h-4" />
                  </span>
                )}
              </p>
              {validationResult.suggestedArea && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  <strong>Suggested Area:</strong> {validationResult.suggestedArea}
                </p>
              )}
            </div>

            {/* Actions */}
            {validationResult.isValid ? (
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowValidationModal(false)}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button
                  variant="primary"
                  onClick={handleProceedAfterValidation}
                  isLoading={isSubmitting}
                  className="flex-1"
                >
                  Post Anyway
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                onClick={() => setShowValidationModal(false)}
                className="w-full"
              >
                Edit Rumor
              </Button>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
