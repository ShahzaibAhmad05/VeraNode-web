'use client';

import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { adminAPI } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Users, FileText, Vote, Box, RefreshCw, UserCheck, UserX, Unlock, AlertTriangle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminStats {
  users: {
    total: number;
    totalProfiles: number;
    active: number;
    blocked: number;
  };
  rumors: {
    total: number;
    active: number;
    finalized: number;
  };
  votes: {
    active: number;
  };
  blockchain: {
    totalBlocks: number;
  };
}

interface BlockedProfile {
  secretKey: string;
  isBlocked: boolean;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<BlockedProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BlockedProfile | null>(null);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [isUnblocking, setIsUnblocking] = useState(false);

  const fetchData = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      const [statsData, blockedData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getBlockedUsers(),
      ]);
      setStats(statsData);
      setBlockedUsers(blockedData.blockedProfiles);
      if (showToast) {
        toast.success('Data refreshed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleUnblock = async () => {
    if (!selectedUser) return;

    setIsUnblocking(true);
    try {
      await adminAPI.unblockUser(selectedUser.secretKey);
      toast.success('User unblocked successfully');
      setShowUnblockModal(false);
      setSelectedUser(null);
      fetchData();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to unblock user';
      toast.error(message);
    } finally {
      setIsUnblocking(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateKey = (key: string) => {
    return `${key.substring(0, 16)}...${key.substring(key.length - 8)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users.total || 0,
      icon: Users,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      subtitle: `${stats?.users.totalProfiles || 0} profiles`,
    },
    {
      title: 'Active Users',
      value: stats?.users.active || 0,
      icon: UserCheck,
      color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      subtitle: 'Currently active',
    },
    {
      title: 'Blocked Users',
      value: stats?.users.blocked || 0,
      icon: UserX,
      color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      subtitle: 'Restricted accounts',
    },
    {
      title: 'Total Rumors',
      value: stats?.rumors.total || 0,
      icon: FileText,
      color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      subtitle: `${stats?.rumors.active || 0} active, ${stats?.rumors.finalized || 0} finalized`,
    },
    {
      title: 'Active Votes',
      value: stats?.votes.active || 0,
      icon: Vote,
      color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      subtitle: 'Ongoing voting',
    },
    {
      title: 'Blockchain Blocks',
      value: stats?.blockchain.totalBlocks || 0,
      icon: Box,
      color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      subtitle: 'Immutable records',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            System statistics and user management
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {stat.subtitle}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Blocked Users Section */}
      {blockedUsers.length > 0 && (
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Blocked Users ({blockedUsers.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Secret Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {blockedUsers.map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        {truncateKey(user.secretKey)}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUnblockModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border-blue-600 hover:border-blue-700 dark:border-blue-400"
                      >
                        <Unlock className="w-4 h-4 mr-1" />
                        Unblock
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Unblock Confirmation Modal */}
      <Modal
        isOpen={showUnblockModal}
        onClose={() => !isUnblocking && setShowUnblockModal(false)}
        title="Confirm Unblock User"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Are you sure you want to unblock this user account?
              </p>
              {selectedUser && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Secret Key:</p>
                  <code className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                    {truncateKey(selectedUser.secretKey)}
                  </code>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowUnblockModal(false)}
              disabled={isUnblocking}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleUnblock}
              isLoading={isUnblocking}
              className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Unblock User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Auto-refresh indicator */}
      <p className="text-xs text-gray-500 dark:text-gray-600 text-center">
        Auto-refreshes every 30 seconds
      </p>
    </div>
  );
}
