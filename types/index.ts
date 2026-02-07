export type AreaOfVote = 'SEECS' | 'NBS' | 'ASAB' | 'SINES' | 'SCME' | 'S3H' | 'General';

export type Department = 'SEECS' | 'NBS' | 'ASAB' | 'SINES' | 'SCME' | 'S3H';

export interface User {
  id: string;
  secretKey?: string;
  area: AreaOfVote;
  points?: number;
  isBlocked: boolean;
  createdAt: string;
  keyExpiresAt?: string;
  isKeyExpired?: boolean;
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
  currentHash: string;
  previousHash: string;
  stats: {
    totalVotes: number | 'hidden';
    factVotes: number | 'hidden';
    lieVotes: number | 'hidden';
    factWeight: number | 'hidden';
    lieWeight: number | 'hidden';
    underAreaVotes: number | 'hidden';
    notUnderAreaVotes: number | 'hidden';
    progress: number | 'hidden';
  };
}

export interface Vote {
  id: string;
  rumorId: string;
  voteType: 'FACT' | 'LIE';
  weight: number;
  isWithinArea: boolean;
  timestamp: string;
}

export interface VoteStatus {
  hasVoted: boolean;
  voteType?: 'FACT' | 'LIE';
  timestamp?: string;
}

export interface VoteResponse {
  success: boolean;
  message: string;
  vote: {
    id: string;
    rumorId: string;
    voteType: 'FACT' | 'LIE';
    weight: number;
    isWithinArea: boolean;
    timestamp: string;
  };
}

export interface VoteStats {
  totalVotes: number;
  factVotes: number;
  lieVotes: number;
  factWeight: number;
  lieWeight: number;
  underAreaVotes: number;
  notUnderAreaVotes: number;
  progress: number;
}

export interface RumorsResponse {
  rumors: Rumor[];
}

export interface RumorResponse {
  rumor: Rumor;
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
