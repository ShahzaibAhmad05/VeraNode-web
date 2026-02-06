'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { adminAPI } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { 
  Shield, 
  Ban, 
  Unlock,
  Copy,
  Check,
  ArrowLeft,
  AlertTriangle,
  Users,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BlockedProfile {
  secretKey: string;
  isBlocked: boolean;
  createdAt: string;
}

export default function BlockedUsersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, verifyAdmin } = useAdminAuth();
  const [blockedUsers, setBlockedUsers] = useState<BlockedProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [unblockingKey, setUnblockingKey] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Verify admin on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push('/admin/login');
        } else {
          const valid = await verifyAdmin();
          if (!valid) {
            router.push('/admin/login');
          }
        }
      }
    };
    checkAuth();
  }, [isLoading, isAuthenticated, router, verifyAdmin]);

  // Load blocked users
  const loadBlockedUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await adminAPI.getBlockedUsers();
      setBlockedUsers(data.blockedProfiles);
    } catch (error: any) {
      toast.error('Failed to load blocked users');
      console.error('Load blocked users error:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadBlockedUsers();
    }
  }, [isAuthenticated]);

  const handleCopyKey = async (secretKey: string) => {
    try {
      await navigator.clipboard.writeText(secretKey);
      setCopiedKey(secretKey);
      toast.success('Secret key copied to clipboard');
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      toast.error('Failed to copy key');
    }
  };

  const handleUnblockClick = (secretKey: string) => {
    setSelectedKey(secretKey);
    setShowConfirmModal(true);
  };

  const handleConfirmUnblock = async () => {
    setUnblockingKey(selectedKey);
    setShowConfirmModal(false);
    
    try {
      await adminAPI.unblockUser(selectedKey);
      toast.success('User unblocked successfully');
      await loadBlockedUsers(); // Refresh list
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to unblock user';
      toast.error(message);
      console.error('Unblock error:', error);
    } finally {
      setUnblockingKey(null);
      setSelectedKey('');
    }
  };

  if (isLoading || loadingUsers) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading blocked users...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Admin Mode Warning Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-red-600 text-white rounded-xl shadow-lg"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6" />
            <div>
              <p className="font-bold text-lg">Admin Mode Active</p>
              <p className="text-sm text-red-100">Blocked Users Management</p>
            </div>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <Link href="/admin/dashboard">
                <Button variant="outline" className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                Blocked Users
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Manage and unblock users
              </p>
            </div>
            <Button
              onClick={loadBlockedUsers}
              variant="outline"
              disabled={loadingUsers}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingUsers ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-red-100 dark:bg-red-900/40">
                <Ban className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                  {blockedUsers.length}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Total Blocked Users
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Blocked Users List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {blockedUsers.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No Blocked Users
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                All users are currently active. Blocked users will appear here.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {blockedUsers.map((user, index) => (
                <motion.div
                  key={user.secretKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card hover className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Ban className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Blocked User
                          </h3>
                        </div>
                        
                        <div className="mb-4">
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                            Secret Key (Full)
                          </label>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-mono break-all text-gray-900 dark:text-white">
                              {user.secretKey}
                            </code>
                            <Button
                              variant="outline"
                              onClick={() => handleCopyKey(user.secretKey)}
                              className="shrink-0"
                            >
                              {copiedKey === user.secretKey ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Created:</span>{' '}
                          {new Date(user.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="shrink-0">
                        <Button
                          variant="primary"
                          onClick={() => handleUnblockClick(user.secretKey)}
                          disabled={unblockingKey === user.secretKey}
                          isLoading={unblockingKey === user.secretKey}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Unlock className="w-4 h-4 mr-2" />
                          Unblock
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Unblock User"
      >
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-yellow-800 dark:text-yellow-300 mb-2">
                  Are you sure you want to unblock this user?
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  This will restore the user&apos;s access to the platform. They will be able to create rumors and vote again.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Secret Key:
            </p>
            <code className="text-xs font-mono break-all text-gray-900 dark:text-white">
              {selectedKey}
            </code>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmUnblock}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Unblock User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
