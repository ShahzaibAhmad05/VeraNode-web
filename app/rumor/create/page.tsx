'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import CustomDropdown from '@/components/ui/CustomDropdown';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { PlusCircle, AlertCircle, BookOpen, FileText, HelpCircle, XCircle, CheckCircle } from 'lucide-react';
import { rumorAPI, voteAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import type { AreaOfVote } from '@/types';

export default function CreateRumorPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'post' | 'instructions'>('post');
  const [content, setContent] = useState('');
  const [areaOfVote, setAreaOfVote] = useState<AreaOfVote>('General');
  const [votingDuration, setVotingDuration] = useState<number>(48); // hours
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Please enter rumor content');
      return;
    }

    setIsSubmitting(true);

    try {
      const votingEndsAt = calculateVotingEndsAt(votingDuration);
      const result = await rumorAPI.create(content, areaOfVote, votingEndsAt);
      
      // Automatically vote in favor of the rumor created
      try {
        await voteAPI.submitVote(result.rumor.id, 'FACT');
      } catch (voteError) {
        console.warn('Auto-vote failed:', voteError);
        // Continue even if auto-vote fails
      }
      
      // Show success toast with green checkmark icon
      toast.success('Rumor posted successfully!', {
        duration: 4000,
        icon: '✓',
        style: {
          borderRadius: '8px',
          fontSize: '14px',
        },
        iconTheme: {
          primary: '#10b981',
          secondary: '#fff',
        },
      });
      router.push(`/rumor/${result.rumor.id}`);
    } catch (error: any) {
      const errorCode = error.response?.data?.code;
      const message = error.response?.data?.message || 'Failed to post rumor';
      
      if (errorCode === 'INVALID_RUMOR') {
        // Show toast for failed post
        toast.error('Failed to post rumor');
        // Show detailed error in modal
        setErrorModal({ isOpen: true, message });
      } else {
        // For other errors, just show toast
        toast.error(message);
      }
      
      setIsSubmitting(false);
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
                {activeTab === 'post' ? (
                  <motion.div
                    layoutId="tabSlider"
                    className="absolute top-1.5 bottom-1.5 left-1.5 right-[50%] bg-white dark:bg-gray-700 rounded-xl shadow-md"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                ) : (
                  <motion.div
                    layoutId="tabSlider"
                    className="absolute top-1.5 bottom-1.5 left-[50%] right-1.5 bg-white dark:bg-gray-700 rounded-xl shadow-md"
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rumor Content</label>
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="E.g., I heard that the campus cafeteria will be renovated next month..."
                        rows={6}
                        required
                        disabled={isSubmitting}
                        helperText={`${content.length} characters`}
                        className="resize-none"
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Area of Vote
                        </label>
                        <CustomDropdown
                          value={areaOfVote}
                          onChange={(value) => setAreaOfVote(value as AreaOfVote)}
                          options={areaOptions}
                          placeholder="Select area"
                        />
                      </div>

                      <div className="mb-8">
                        <div className="flex items-center gap-1.5 mb-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Voting Duration
                          </label>
                          <div className="relative group">
                            <HelpCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50">
                              <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                                How long should the community have to vote on this rumor?
                                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <CustomDropdown
                          value={votingDuration.toString()}
                          onChange={(value) => setVotingDuration(Number(value))}
                          options={durationOptions}
                          placeholder="Select duration"
                        />
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

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isSubmitting}
                        className="w-full"
                      >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Post Rumor
                      </Button>
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
                          <strong>What, what is this?</strong><br />
                          Unverified information that hasn't been confirmed. Post something you've heard but aren't sure about.
                        </p>

                        <p>
                          <strong>Choose the right area:</strong><br />
                          Select the most relevant area. Votes from people in that area carry more weight.
                        </p>

                        <p>
                          <strong>AI validation:</strong><br />
                          Your rumor will be automatically validated by AI when you submit. If it doesn't qualify as a rumor, you'll be notified.
                        </p>

                        <p>
                          <strong>Voting duration:</strong><br />
                          48 hours is recommended for most rumors. Use shorter durations for time-sensitive content.
                        </p>

                        <p className="text-red-600 dark:text-red-400">
                          <strong>Warning:</strong><br />
                          False rumors result in HUGE point deductions and will affect your reputation score.
                        </p>
                      </div>

                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={() => setActiveTab('post')}
                          className="w-full"
                        >
                          Let's continue to post
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

      {/* Error Modal */}
      <Modal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        title="Validation Failed"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 dark:text-gray-300">
                {errorModal.message}
              </p>
            </div>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setErrorModal({ isOpen: false, message: '' })}
              className="w-full"
            >
              OK
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
