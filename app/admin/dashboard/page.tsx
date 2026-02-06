'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { adminAPI } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  Shield, 
  Users, 
  MessageSquare, 
  Vote, 
  Ban,
  Database,
  LogOut,
  TrendingUp,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, verifyAdmin, logout, admin } = useAdminAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

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

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      if (isAuthenticated) {
        try {
          const data = await adminAPI.getStats();
          setStats(data);
        } catch (error: any) {
          toast.error('Failed to load statistics');
          console.error('Stats error:', error);
        } finally {
          setLoadingStats(false);
        }
      }
    };
    loadStats();
  }, [isAuthenticated]);

  if (isLoading || loadingStats) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users.total,
      icon: Users,
      color: 'from-blue-600 to-blue-700',
      textColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Active Users',
      value: stats.users.active,
      icon: CheckCircle,
      color: 'from-green-600 to-green-700',
      textColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Blocked Users',
      value: stats.users.blocked,
      icon: Ban,
      color: 'from-red-600 to-red-700',
      textColor: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      title: 'Total Rumors',
      value: stats.rumors.total,
      icon: MessageSquare,
      color: 'from-purple-600 to-purple-700',
      textColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Active Rumors',
      value: stats.rumors.active,
      icon: Activity,
      color: 'from-orange-600 to-orange-700',
      textColor: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      title: 'Finalized Rumors',
      value: stats.rumors.finalized,
      icon: CheckCircle,
      color: 'from-teal-600 to-teal-700',
      textColor: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    },
    {
      title: 'Active Votes',
      value: stats.votes.active,
      icon: Vote,
      color: 'from-indigo-600 to-indigo-700',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      title: 'Blockchain Blocks',
      value: stats.blockchain.totalBlocks,
      icon: Database,
      color: 'from-cyan-600 to-cyan-700',
      textColor: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Admin Mode Warning Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-red-600 text-white rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6" />
              <div>
                <p className="font-bold text-lg">Admin Mode Active</p>
                <p className="text-sm text-red-100">
                  Logged in since: {new Date(admin?.lastLogin || '').toLocaleString()}
                </p>
              </div>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            System overview and statistics
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card hover className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">
                    {stat.value.toLocaleString()}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/admin/blocked-users">
              <Card hover className="p-6 cursor-pointer transition-all hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
                    <Ban className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      Manage Blocked Users
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      View and unblock users ({stats.users.blocked} blocked)
                    </p>
                  </div>
                </div>
              </Card>
            </Link>

            <Card hover className="p-6 opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/20">
                  <TrendingUp className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    System Analytics
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Coming soon
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
