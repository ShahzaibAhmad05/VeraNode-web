import axios from 'axios';
import type { User, Rumor, Vote, AIValidation, VoteStats, UserStats } from '@/types';

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
  login: async (universityId: string, password: string): Promise<{ user: User; token: string; secretKey: string }> => {
    const response = await api.post('/auth/login', { universityId, password });
    return response.data;
  },

  register: async (universityId: string, password: string, area: string): Promise<{ user: User; token: string; secretKey: string }> => {
    const response = await api.post('/auth/register', { universityId, password, area });
    return response.data;
  },

  verifyToken: async (): Promise<User> => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },
};

// Rumor APIs
export const rumorAPI = {
  getAll: async (filters?: { area?: string; status?: string }): Promise<Rumor[]> => {
    const response = await api.get('/rumors', { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<Rumor> => {
    const response = await api.get(`/rumors/${id}`);
    return response.data;
  },

  create: async (content: string, areaOfVote: string): Promise<{ rumor: Rumor; validation: AIValidation }> => {
    const response = await api.post('/rumors', { content, areaOfVote });
    return response.data;
  },

  validateWithAI: async (content: string): Promise<AIValidation> => {
    const response = await api.post('/rumors/validate', { content });
    return response.data;
  },

  getStats: async (rumorId: string): Promise<VoteStats> => {
    const response = await api.get(`/rumors/${rumorId}/stats`);
    return response.data;
  },
};

// Vote APIs
export const voteAPI = {
  submitVote: async (rumorId: string, voteType: 'FACT' | 'LIE'): Promise<{ success: boolean; nullifier: string }> => {
    const response = await api.post(`/rumors/${rumorId}/vote`, { voteType });
    return response.data;
  },

  checkVoted: async (rumorId: string): Promise<{ hasVoted: boolean; voteType?: 'FACT' | 'LIE' }> => {
    const response = await api.get(`/rumors/${rumorId}/vote-status`);
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

export default api;
