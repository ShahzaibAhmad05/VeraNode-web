'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { voteAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import type { Rumor } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface VotingInterfaceProps {
  rumor: Rumor;
  onVoteSuccess: () => void;
  hasVoted: boolean;
}

const VotingInterface: React.FC<VotingInterfaceProps> = ({
  rumor,
  onVoteSuccess,
  hasVoted,
}) => {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedVote, setSelectedVote] = useState<'FACT' | 'LIE' | null>(null);

  const isOutsideArea = user?.area !== rumor.areaOfVote && rumor.areaOfVote !== 'General';

  const handleVoteClick = (voteType: 'FACT' | 'LIE') => {
    if (hasVoted) {
      return;
    }

    setSelectedVote(voteType);

    if (isOutsideArea) {
      setShowConfirmModal(true);
    } else {
      submitVote(voteType);
    }
  };

  const submitVote = async (voteType: 'FACT' | 'LIE') => {
    setIsVoting(true);
    setShowConfirmModal(false);

    try {
      await voteAPI.submitVote(rumor.id, voteType);
      toast.success('Vote submitted successfully!', {
        iconTheme: {
          primary: '#10b981',
          secondary: '#fff',
        },
      });
      onVoteSuccess();
    } catch (error: any) {
      console.error('Vote submission error:', error);
      onVoteSuccess();
    } finally {
      setIsVoting(false);
      setSelectedVote(null);
    }
  };

  if (rumor.isLocked && !rumor.isFinal) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-yellow-800 dark:text-yellow-300 text-center font-medium">
          Voting ended. System is analyzing results.
        </p>
      </div>
    );
  }

  if (rumor.isLocked) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-yellow-800 dark:text-yellow-300 text-center font-medium">
          Voting has been locked for this rumor
        </p>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <p className="text-blue-800 dark:text-blue-300 font-medium">
            You have already voted on this rumor
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {isOutsideArea && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" />
            <p className="text-sm text-orange-800 dark:text-orange-300">
              This rumor is for <strong>{rumor.areaOfVote}</strong>. Your vote will have reduced weight.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleVoteClick('FACT')}
              disabled={isVoting || hasVoted}
              className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-500"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              FACT
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleVoteClick('LIE')}
              disabled={isVoting || hasVoted}
              className="w-full bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              <XCircle className="w-5 h-5 mr-2" />
              LIE
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Confirmation Modal for Outside Area */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Vote"
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              You are voting on a rumor outside your area ({rumor.areaOfVote}). Your vote will have
              <strong> reduced weight</strong> in the final decision.
            </p>
          </div>

          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to vote <strong className="text-blue-600 dark:text-blue-400">{selectedVote}</strong>?
          </p>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => selectedVote && submitVote(selectedVote)}
              isLoading={isVoting}
              className="flex-1"
            >
              Confirm Vote
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default VotingInterface;
