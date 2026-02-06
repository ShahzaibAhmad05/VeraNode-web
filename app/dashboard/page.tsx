'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import RumorCard from '@/components/features/RumorCard';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Filter, PlusCircle, AlertCircle } from 'lucide-react';
import { rumorAPI } from '@/lib/api';
import type { Rumor } from '@/types';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [rumors, setRumors] = useState<Rumor[]>([]);
  const [filteredRumors, setFilteredRumors] = useState<Rumor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'locked' | 'final'>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');

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
        const rumorsData = await rumorAPI.getAll();

        setRumors(Array.isArray(rumorsData) ? rumorsData : []);
        setFilteredRumors(Array.isArray(rumorsData) ? rumorsData : []);
      } catch (error: any) {
        toast.error('Failed to load dashboard data');
        setRumors([]);
        setFilteredRumors([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && !authLoading) {
      loadData();
    }
  }, [isAuthenticated, authLoading]);

  // Apply filters
  useEffect(() => {
    if (!Array.isArray(rumors)) {
      setFilteredRumors([]);
      return;
    }

    let filtered = [...rumors];

    // Status filter
    if (activeFilter === 'active') {
      filtered = filtered.filter((r) => !r.isLocked && !r.isFinal);
    } else if (activeFilter === 'locked') {
      filtered = filtered.filter((r) => r.isLocked && !r.isFinal);
    } else if (activeFilter === 'final') {
      filtered = filtered.filter((r) => r.isFinal);
    }

    // Area filter
    if (areaFilter !== 'all') {
      filtered = filtered.filter((r) => r.areaOfVote === areaFilter);
    }

    setFilteredRumors(filtered);
  }, [activeFilter, areaFilter, rumors]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filters = [
    { value: 'all', label: 'All', count: Array.isArray(rumors) ? rumors.length : 0 },
    { value: 'active', label: 'Active', count: Array.isArray(rumors) ? rumors.filter((r) => !r.isLocked && !r.isFinal).length : 0 },
    { value: 'locked', label: 'Locked', count: Array.isArray(rumors) ? rumors.filter((r) => r.isLocked && !r.isFinal).length : 0 },
    { value: 'final', label: 'Final', count: Array.isArray(rumors) ? rumors.filter((r) => r.isFinal).length : 0 },
  ];

  const areaOptions = ['all', 'General', 'SEECS', 'NBS', 'ASAB', 'SINES', 'SCME', 'S3H'];

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Discover truth with complete anonymity
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
              <div className="flex space-x-2">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value as any)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === filter.value
                        ? 'bg-blue-600 dark:bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                {areaOptions.map((area) => (
                  <option key={area} value={area}>
                    {area === 'all' ? 'All Areas' : area}
                  </option>
                ))}
              </select>

              <Link href="/rumor/create">
                <Button variant="primary" size="md">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Post Rumor
                </Button>
              </Link>
            </div>
          </div>

          {/* Rumors Feed */}
          {filteredRumors.length === 0 ? (
            <Card hover={false} className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No rumors found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {activeFilter === 'all'
                  ? 'Be the first to post a rumor!'
                  : 'Try adjusting your filters'}
              </p>
              {activeFilter === 'all' && (
                <Link href="/rumor/create">
                  <Button variant="primary" size="lg">
                    Post Your First Rumor
                  </Button>
                </Link>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredRumors.map((rumor, index) => (
                <ScrollReveal
                  key={rumor.id}
                  delay={0.05 * (index % 4)}
                  direction="up"
                  triggerOnce={false}
                >
                  <RumorCard rumor={rumor} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
