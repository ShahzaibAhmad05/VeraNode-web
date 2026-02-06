'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import type { Rumor } from '@/types';
import { formatRelativeTime, formatTimeRemaining, calculateTimeRemaining } from '@/lib/utils';
import { Clock, TrendingUp, Users, Lock, CheckCircle, XCircle } from 'lucide-react';

interface RumorCardProps {
  rumor: Rumor;
}

const RumorCard: React.FC<RumorCardProps> = ({ rumor }) => {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(rumor.votingEndsAt));

  useEffect(() => {
    if (rumor.isLocked) return;

    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(rumor.votingEndsAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [rumor.votingEndsAt, rumor.isLocked]);

  const getStatusBadge = () => {
    if (rumor.isFinal) {
      if (rumor.finalDecision === 'FACT') {
        return (
          <Badge variant="success" className="flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Verified Fact</span>
          </Badge>
        );
      } else if (rumor.finalDecision === 'LIE') {
        return (
          <Badge variant="danger" className="flex items-center space-x-1">
            <XCircle className="w-3 h-3" />
            <span>Confirmed Lie</span>
          </Badge>
        );
      }
    }

    if (rumor.isLocked) {
      return (
        <Badge variant="warning" className="flex items-center space-x-1">
          <Lock className="w-3 h-3" />
          <span>Voting Locked</span>
        </Badge>
      );
    }

    return (
      <Badge variant="info" className="flex items-center space-x-1">
        <TrendingUp className="w-3 h-3" />
        <span>Active</span>
      </Badge>
    );
  };

  const totalVotesWeight = rumor.votesWeight.fact + rumor.votesWeight.lie;
  const factPercentage = totalVotesWeight > 0 
    ? Math.round((rumor.votesWeight.fact / totalVotesWeight) * 100) 
    : 50;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => router.push(`/rumor/${rumor.id}`)}
      className="cursor-pointer"
    >
      <Card>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {getStatusBadge()}
              <Badge variant="default">{rumor.areaOfVote}</Badge>
            </div>
            <p className="text-gray-900 dark:text-white text-lg font-medium line-clamp-3">
              {rumor.content}
            </p>
          </div>
        </div>

        {/* Voting Progress */}
        {!rumor.isFinal && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Fact: {factPercentage}%</span>
              <span>Lie: {100 - factPercentage}%</span>
            </div>
            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${factPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute h-full bg-linear-to-r from-green-500 to-green-600"
              />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{rumor.totalVotes} votes</span>
            </div>
            {!rumor.isLocked && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatTimeRemaining(timeRemaining)}</span>
              </div>
            )}
          </div>
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            {formatRelativeTime(rumor.postedAt)}
          </span>
        </div>

        {/* Final Decision Banner */}
        {rumor.isFinal && rumor.finalDecision && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              rumor.finalDecision === 'FACT'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}
          >
            <p
              className={`text-sm font-medium ${
                rumor.finalDecision === 'FACT'
                  ? 'text-green-800 dark:text-green-300'
                  : 'text-red-800 dark:text-red-300'
              }`}
            >
              {rumor.finalDecision === 'FACT'
                ? '✓ Community verified this as a FACT'
                : '✗ Community confirmed this as a LIE'}
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default RumorCard;
