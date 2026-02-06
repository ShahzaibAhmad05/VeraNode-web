import axios from 'axios';
import type { User, Rumor, Vote, AIValidation, VoteStats, UserStats, RumorsResponse, RumorResponse, VoteStatus, VoteResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: async (secretKey: string): Promise<{ token: string; profile: User }> => {
    const response = await api.post('/auth/login', { secretKey });
    return response.data;
  },

  register: async (area: string): Promise<{ secretKey: string; profile: User; message: string }> => {
    const response = await api.post('/auth/register', { area });
    return response.data;
  },

  getProfile: async (): Promise<{ profile: User }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      // Try to call backend logout endpoint (optional)
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore API errors - logout is primarily a client-side operation
      console.warn('Backend logout failed, continuing with local logout:', error);
    } finally {
      // Always clear localStorage regardless of API call result
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('secret_key');
    }
  },
};

// Rumor APIs
export const rumorAPI = {
  getAll: async (filters?: { status?: string }): Promise<Rumor[]> => {
    const response = await api.get<RumorsResponse>('/rumors', { params: filters });
    return response.data.rumors;
  },

  getById: async (id: string): Promise<Rumor> => {
    const response = await api.get<RumorResponse>(`/rumors/${id}`);
    return response.data.rumor;
  },

  create: async (content: string, areaOfVote: string, votingEndsAt: string): Promise<Rumor> => {
    const response = await api.post<RumorResponse>('/rumors', { content, areaOfVote, votingEndsAt });
    return response.data.rumor;
  },

  validateWithAI: async (content: string, votingEndsAt: string): Promise<AIValidation> => {
    const response = await api.post('/rumors/validate', { content, votingEndsAt });
    return response.data;
  },
};

// Vote APIs
export const voteAPI = {
  submitVote: async (rumorId: string, voteType: 'FACT' | 'LIE'): Promise<VoteResponse> => {
    const response = await api.post<VoteResponse>(`/rumors/${rumorId}/vote`, { voteType });
    return response.data;
  },

  checkVoted: async (rumorId: string): Promise<VoteStatus> => {
    const response = await api.get<VoteStatus>(`/rumors/${rumorId}/vote-status`);
    return response.data;
  },

  getUserVotes: async (): Promise<Vote[]> => {
    const response = await api.get('/votes/my-votes');
    return response.data;
  },
};

// User APIs
export const userAPI = {
  getStats: async (): Promise<UserStats> => {
    const response = await api.get('/user/stats');
    return response.data;
  },

  getMyRumors: async (): Promise<Rumor[]> => {
    const response = await api.get('/user/rumors');
    return response.data;
  },
};

// Admin APIs
const adminAPI_instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Admin interceptor to add admin token
adminAPI_instance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface Admin {
  id: string;
  createdAt: string;
  lastLogin: string;
}

interface BlockedProfile {
  secretKey: string;
  isBlocked: boolean;
  createdAt: string;
}

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

export const adminAPI = {
  login: async (adminKey: string): Promise<{ success: boolean; token: string; admin: Admin }> => {
    const response = await adminAPI_instance.post('/admin/login', { adminKey });
    return response.data;
  },

  verify: async (): Promise<{ success: boolean; admin: Admin }> => {
    const response = await adminAPI_instance.get('/admin/verify');
    return response.data;
  },

  getStats: async (): Promise<AdminStats> => {
    const response = await adminAPI_instance.get('/admin/dashboard/stats');
    return response.data;
  },

  getBlockedUsers: async (): Promise<{ blockedProfiles: BlockedProfile[]; count: number }> => {
    const response = await adminAPI_instance.get('/admin/dashboard/blocked-users');
    return response.data;
  },

  unblockUser: async (secretKey: string): Promise<{ success: boolean; message: string; profile: BlockedProfile }> => {
    const response = await adminAPI_instance.post('/admin/dashboard/unblock-user', { secretKey });
    return response.data;
  },
};

export default api;
