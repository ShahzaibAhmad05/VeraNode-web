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
import CustomDropdown from '@/components/ui/CustomDropdown';
import { Filter, PlusCircle, AlertCircle } from 'lucide-react';
import { rumorAPI, voteAPI } from '@/lib/api';
import type { Rumor } from '@/types';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [rumors, setRumors] = useState<Rumor[]>([]);
  const [filteredRumors, setFilteredRumors] = useState<Rumor[]>([]);
  const [votedRumorIds, setVotedRumorIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'new' | 'voted' | 'final'>('new');
  const [areaFilter, setAreaFilter] = useState<string>('all');

  // Scroll to top on mount to prevent auto-scroll issue
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        // Fetch all rumors without status filter for client-side filtering
        const [rumorsData, userVotes] = await Promise.all([
          rumorAPI.getAll(),
          voteAPI.getUserVotes(),
        ]);

        setRumors(Array.isArray(rumorsData) ? rumorsData : []);
        setFilteredRumors(Array.isArray(rumorsData) ? rumorsData : []);
        
        // Store voted rumor IDs
        const votedIds = new Set(
          Array.isArray(userVotes) 
            ? userVotes.map(vote => vote.rumorId)
            : []
        );
        setVotedRumorIds(votedIds);
      } catch (error: any) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load dashboard data');
        setRumors([]);
        setFilteredRumors([]);
        setVotedRumorIds(new Set());
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && !authLoading) {
      loadData();
    }
  }, [isAuthenticated, authLoading]);

  // Auto-select filter on initial load
  useEffect(() => {
    if (!Array.isArray(rumors) || rumors.length === 0) return;

    const newCount = rumors.filter((r) => !r.isFinal && !votedRumorIds.has(r.id)).length;
    const votedCount = rumors.filter((r) => !r.isFinal && votedRumorIds.has(r.id)).length;
    const lockCount = rumors.filter((r) => r.isFinal).length;

    // Auto-select appropriate filter
    if (newCount === 0 && votedCount > 0) {
      setActiveFilter('voted');
    } else if (newCount === 0 && votedCount === 0 && lockCount > 0) {
      setActiveFilter('final');
    }
  }, [rumors, votedRumorIds]);

  // Apply filters
  useEffect(() => {
    if (!Array.isArray(rumors)) {
      setFilteredRumors([]);
      return;
    }

    let filtered = [...rumors];

    // Status filter
    if (activeFilter === 'new') {
      // New: active rumors that user hasn't voted on
      filtered = filtered.filter((r) => !r.isFinal && !votedRumorIds.has(r.id));
    } else if (activeFilter === 'voted') {
      // Voted: rumors user has voted on (not yet final)
      filtered = filtered.filter((r) => !r.isFinal && votedRumorIds.has(r.id));
    } else if (activeFilter === 'final') {
      // Lock: finalized rumors
      filtered = filtered.filter((r) => r.isFinal);
    }

    // Area filter
    if (areaFilter !== 'all') {
      filtered = filtered.filter((r) => r.areaOfVote === areaFilter);
    }

    setFilteredRumors(filtered);
  }, [activeFilter, areaFilter, rumors, votedRumorIds]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filters = [
    { value: 'new', label: 'New', count: Array.isArray(rumors) ? rumors.filter((r) => !r.isFinal && !votedRumorIds.has(r.id)).length : 0 },
    { value: 'voted', label: 'Voted', count: Array.isArray(rumors) ? rumors.filter((r) => !r.isFinal && votedRumorIds.has(r.id)).length : 0 },
    { value: 'final', label: 'Lock', count: Array.isArray(rumors) ? rumors.filter((r) => r.isFinal).length : 0 },
  ];

  const areaOptions = [
    { value: 'all', label: 'All Areas' },
    { value: 'General', label: 'General' },
    { value: 'SEECS', label: 'SEECS' },
    { value: 'NBS', label: 'NBS' },
    { value: 'ASAB', label: 'ASAB' },
    { value: 'SINES', label: 'SINES' },
    { value: 'SCME', label: 'SCME' },
    { value: 'S3H', label: 'S3H' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] px-8 py-8">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >

          {/* Action Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 mt-3 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-1 flex-wrap gap-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-lg font-semibold pr-2 text-gray-700 dark:text-gray-300">Filter:</span>
              <div className="flex space-x-3">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value as any)}
                    className={`px-4 py-2 rounded-2xl text-md font-medium transition-colors ${
                      activeFilter === filter.value
                        ? 'bg-blue-600 dark:bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
                <CustomDropdown
                  value={areaFilter}
                  onChange={setAreaFilter}
                  options={areaOptions}
                  placeholder="All Areas"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/rumor/create">
                <Button variant="primary" size="md" className="flex items-center px-4 py-3 rounded-2xl">
                  <PlusCircle className="w-6 h-6 mr-2" />
                  Post Rumor
                </Button>
              </Link>
            </div>
          </div>

          {/* Rumors Feed */}
          {filteredRumors.length === 0 ? (
            <Card hover={false} className="text-center py-12 mx-4">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No rumors found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {activeFilter === 'new'
                  ? 'No new rumors to vote on. Check back later!'
                  : activeFilter === 'voted'
                  ? "You haven't voted on any active rumors yet."
                  : 'Try adjusting your filters'}
              </p>
              {activeFilter === 'new' && (
                <Link href="/rumor/create">
                  <Button variant="primary" size="lg">
                    Post One?
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
                  triggerOnce={true}
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
