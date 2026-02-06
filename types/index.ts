export type AreaOfVote = 'SEECS' | 'NBS' | 'ASAB' | 'SINES' | 'SCME' | 'S3H' | 'General';

export interface User {
  id: string;
  universityId: string;
  secretKey: string;
  area: AreaOfVote;
  isBlocked: boolean;
  createdAt: string;
}

export interface Rumor {
  id: string;
  content: string;
  areaOfVote: AreaOfVote;
  postedAt: string;
  votingEndsAt: string;
  isLocked: boolean;
  isFinal: boolean;
  finalDecision?: 'FACT' | 'LIE' | null;
  nullifier: string;
  previousHash: string;
  currentHash: string;
  votesCount: {
    fact: number;
    lie: number;
  };
  votesWeight: {
    fact: number;
    lie: number;
  };
  totalVotes: number;
  withinAreaVotes: number;
  requiredWithinAreaPercentage: number;
}

export interface Vote {
  rumorId: string;
  nullifier: string;
  voteType: 'FACT' | 'LIE';
  weight: number;
  isWithinArea: boolean;
  timestamp: string;
}

export interface VoteStats {
  totalVotes: number;
  factVotes: number;
  lieVotes: number;
  factWeight: number;
  lieWeight: number;
  withinAreaVotes: number;
  progress: number;
}

export interface AIValidation {
  isValid: boolean;
  reason?: string;
  isRumor: boolean;
  suggestedArea?: AreaOfVote;
}

export interface UserStats {
  rumorsPosted: number;
  rumorsVoted: number;
  correctVotes: number;
  incorrectVotes: number;
  accountStatus: 'ACTIVE' | 'BLOCKED' | 'WARNING';
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}
