'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { User, Key, Copy, CheckCircle, Shield, TrendingUp, Award, AlertCircle, AlertTriangle } from 'lucide-react';
import { userAPI } from '@/lib/api';
import type { Rumor, UserStats } from '@/types';
import { copyToClipboard, formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, secretKey, isAuthenticated, isLoading: authLoading } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [myRumors, setMyRumors] = useState<Rumor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSecretKeyModal, setShowSecretKeyModal] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);

  // Prevent auto-scroll and ensure page starts at top
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  // Calculate days until expiration
  const getDaysUntilExpiration = () => {
    if (!user?.keyExpiresAt) return null;
    const expiresAt = new Date(user.keyExpiresAt);
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiration = getDaysUntilExpiration();
  const showExpirationWarning = daysUntilExpiration !== null && daysUntilExpiration <= 7 && daysUntilExpiration > 0;

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const statsData = await userAPI.getStats();
        setUserStats(statsData);
      } catch {
        setUserStats({
          rumorsPosted: 0,
          rumorsVoted: 0,
          correctVotes: 0,
          incorrectVotes: 0,
          accountStatus: 'ACTIVE' as const,
        });
      }
      
      try {
        const rumorsData = await userAPI.getMyRumors();
        setMyRumors(Array.isArray(rumorsData) ? rumorsData : []);
      } catch {
        setMyRumors([]);
      }
      
      setIsLoading(false);
    };

    if (isAuthenticated && !authLoading) {
      loadData();
    } else if (!authLoading) {
      // If not authenticated and auth loading is done, stop loading
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const handleCopySecretKey = async () => {
    if (secretKey) {
      const success = await copyToClipboard(secretKey);
      if (success) {
        setKeyCopied(true);
        toast.success('Secret key copied!', {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        });
        setTimeout(() => setKeyCopied(false), 2000);
      }
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const accuracy = userStats && userStats.rumorsVoted > 0
    ? Math.round((userStats.correctVotes / userStats.rumorsVoted) * 100)
    : 0;

  return (
    <>
      <div className="min-h-[calc(100vh-4rem)] px-4 py-8">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Profile
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Manage your account and view your statistics
              </p>
            </div>

            {/* Key Expiration Warning */}
            {showExpirationWarning && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                      Key Expiring Soon
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      Your secret key will expire in {daysUntilExpiration} {daysUntilExpiration === 1 ? 'day' : 'days'}. 
                      After expiration, you can recover your account by registering again with your expired key.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {user?.isKeyExpired && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                      Key Expired
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-400">
                      Your secret key has expired. Please register again to recover your account and preserve your data.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Profile Info Card */}
            <Card className="mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      Anonymous User
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {secretKey ? `Key: ${secretKey.substring(0, 16)}...` : 'No key available'}
                    </p>
                    {user?.keyExpiresAt && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Key expires: {new Date(user.keyExpiresAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                    <div className="flex items-center space-x-2">
                      <Badge variant="info">{user?.area}</Badge>
                      <Badge
                        variant={
                          userStats?.accountStatus === 'ACTIVE'
                            ? 'success'
                            : userStats?.accountStatus === 'WARNING'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {userStats?.accountStatus}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSecretKeyModal(true)}
                >
                  <Key className="w-4 h-4 mr-2" />
                  View Secret Key
                </Button>
              </div>
            </Card>

            {/* Stats Grid */}
            {userStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card hover={false}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Activity</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userStats.rumorsPosted + userStats.rumorsVoted}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Rumors Posted</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {userStats.rumorsPosted}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Votes Cast</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {userStats.rumorsVoted}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card hover={false}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {accuracy}%
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Correct</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {userStats.correctVotes}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Incorrect</span>
                      <span className="font-medium text-red-600 dark:text-red-400">
                        {userStats.incorrectVotes}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card hover={false}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Reputation</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {accuracy >= 80 ? 'High' : accuracy >= 50 ? 'Medium' : 'Low'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your reputation affects vote weight. Keep accuracy high to increase influence.
                  </p>
                </Card>
              </div>
            )}

            {/* My Rumors */}
            <Card>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                My Rumors ({myRumors.length})
              </h3>
              
              {myRumors.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    You haven't posted any rumors yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myRumors.map((rumor) => (
                    <div
                      key={rumor.id}
                      onClick={() => router.push(`/rumor/${rumor.id}`)}
                      className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white line-clamp-2">
                            {rumor.content}
                          </p>
                        </div>
                        <div className="ml-4 shrink-0">
                          {rumor.isFinal && (
                            <Badge
                              variant={rumor.finalDecision === 'FACT' ? 'success' : 'danger'}
                            >
                              {rumor.finalDecision}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{rumor.areaOfVote}</span>
                        <span>•</span>
                        <span>
                          {rumor.stats.totalVotes === 'hidden' 
                            ? 'Voting in progress' 
                            : `${rumor.stats.totalVotes} votes`}
                        </span>
                        <span>•</span>
                        <span>{formatRelativeTime(rumor.postedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Secret Key Modal */}
      <Modal
        isOpen={showSecretKeyModal}
        onClose={() => setShowSecretKeyModal(false)}
        title="Your Secret Key"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium mb-2">
                  Keep this key safe!
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  This key is used to maintain your anonymity and reputation. Do not share it with anyone.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
              SECRET KEY:
            </p>
            <div className="flex items-center space-x-2">
              <code className="flex-1 text-sm font-mono text-gray-900 dark:text-white break-all bg-white dark:bg-gray-900 p-3 rounded border border-gray-300 dark:border-gray-700">
                {secretKey || 'Not available'}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopySecretKey}
                disabled={!secretKey}
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

          <Button
            variant="primary"
            onClick={() => setShowSecretKeyModal(false)}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
}
