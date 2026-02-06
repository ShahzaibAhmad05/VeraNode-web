'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import VotingInterface from '@/components/features/VotingInterface';
import { Clock, Users, TrendingUp, Lock, CheckCircle, XCircle, Shield } from 'lucide-react';
import { rumorAPI, voteAPI } from '@/lib/api';
import type { Rumor } from '@/types';
import { formatRelativeTime, formatTimeRemaining, calculateTimeRemaining, calculatePercentage } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function RumorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const rumorId = params.id as string;

  const [rumor, setRumor] = useState<Rumor | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [existingVote, setExistingVote] = useState<'FACT' | 'LIE' | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Load rumor data
  const loadRumorData = async () => {
    try {
      const [rumorData, voteStatus] = await Promise.all([
        rumorAPI.getById(rumorId),
        voteAPI.checkVoted(rumorId),
      ]);

      setRumor(rumorData);
      setHasVoted(voteStatus.hasVoted);
      setExistingVote(voteStatus.voteType || undefined);
    } catch (error: any) {
      toast.error('Failed to load rumor');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadRumorData();
    }
  }, [rumorId, isAuthenticated, authLoading]);

  // Update timer
  useEffect(() => {
    if (!rumor || rumor.isLocked) return;

    const updateTimer = () => {
      setTimeRemaining(calculateTimeRemaining(rumor.votingEndsAt));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [rumor]);

  const handleVoteSuccess = () => {
    loadRumorData();
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!rumor) {
    return null;
  }

  const stats = rumor.stats;
  const factPercentage = calculatePercentage(stats.factWeight, stats.factWeight + stats.lieWeight);
  const underAreaProgress = calculatePercentage(stats.underAreaVotes, stats.totalVotes);
  const notUnderAreaProgress = stats.notUnderAreaVotes ? calculatePercentage(stats.notUnderAreaVotes, stats.totalVotes) : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-12">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Main Rumor Card */}
          <Card>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  {rumor.isFinal ? (
                    rumor.finalDecision === 'FACT' ? (
                      <Badge variant="success" className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Verified Fact</span>
                      </Badge>
                    ) : (
                      <Badge variant="danger" className="flex items-center space-x-1">
                        <XCircle className="w-3 h-3" />
                        <span>Confirmed Lie</span>
                      </Badge>
                    )
                  ) : rumor.isLocked ? (
                    <Badge variant="warning" className="flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>Voting Locked</span>
                    </Badge>
                  ) : (
                    <Badge variant="info" className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Active</span>
                    </Badge>
                  )}
                  <Badge variant="default">{rumor.areaOfVote}</Badge>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {rumor.content}
                </h1>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Posted {formatRelativeTime(rumor.postedAt)}
                </p>
              </div>
            </div>

            {/* Voting Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Fact: {factPercentage}%</span>
                <span>Lie: {100 - factPercentage}%</span>
              </div>
              <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${factPercentage}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="absolute h-full bg-linear-to-r from-green-500 to-green-600"
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">Total Votes</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalVotes}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">Fact Votes</span>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.factVotes}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
                  <XCircle className="w-4 h-4" />
                  <span className="text-xs">Lie Votes</span>
                </div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.lieVotes}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-1">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs">Under Area</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.underAreaVotes}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {underAreaProgress}%
                </p>
              </div>
            </div>

            {/* Additional stats row for not under area votes if available */}
            {stats.notUnderAreaVotes !== undefined && stats.notUnderAreaVotes > 0 && (
              <div className="mb-6">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Not Under Area Votes</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {stats.notUnderAreaVotes}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {notUnderAreaProgress}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timer */}
            {!rumor.isLocked && !rumor.isFinal && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Voting ends in:
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-900 dark:text-blue-200">
                    {formatTimeRemaining(timeRemaining)}
                  </span>
                </div>
              </div>
            )}

            {/* Voting Interface */}
            <VotingInterface
              rumor={rumor}
              onVoteSuccess={handleVoteSuccess}
              hasVoted={hasVoted}
              existingVote={existingVote}
            />
          </Card>

          {/* Blockchain Info */}
          {rumor.isFinal && (
            <Card className="bg-gray-50 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Lock className="w-5 h-5" />
                <span>Blockchain Record</span>
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Previous Hash:</span>
                  <code className="ml-2 text-xs font-mono text-gray-900 dark:text-white break-all">
                    {rumor.previousHash}
                  </code>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Current Hash:</span>
                  <code className="ml-2 text-xs font-mono text-gray-900 dark:text-white break-all">
                    {rumor.currentHash}
                  </code>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                This decision is immutable and secured through blockchain-style hash chaining.
              </p>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
