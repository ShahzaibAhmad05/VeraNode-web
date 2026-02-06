'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import type { User } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  secretKey: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (universityId: string, password: string) => Promise<void>;
  register: (universityId: string, password: string, area: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        const userSecretKey = localStorage.getItem('secret_key');

        if (token && userData) {
          setUser(JSON.parse(userData));
          setSecretKey(userSecretKey);
          
          // Verify token with backend
          try {
            const verifiedUser = await authAPI.verifyToken();
            setUser(verifiedUser);
            localStorage.setItem('user_data', JSON.stringify(verifiedUser));
          } catch (error) {
            // Token invalid, clear auth
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            localStorage.removeItem('secret_key');
            setUser(null);
            setSecretKey(null);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (universityId: string, password: string) => {
    try {
      const response = await authAPI.login(universityId, password);
      
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data', JSON.stringify(response.user));
      localStorage.setItem('secret_key', response.secretKey);
      
      setUser(response.user);
      setSecretKey(response.secretKey);
      
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (universityId: string, password: string, area: string) => {
    try {
      const response = await authAPI.register(universityId, password, area);
      
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data', JSON.stringify(response.user));
      localStorage.setItem('secret_key', response.secretKey);
      
      setUser(response.user);
      setSecretKey(response.secretKey);
      
      toast.success('Registration successful! Please save your secret key.');
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('secret_key');
      
      setUser(null);
      setSecretKey(null);
      
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const refreshUser = async () => {
    try {
      const verifiedUser = await authAPI.verifyToken();
      setUser(verifiedUser);
      localStorage.setItem('user_data', JSON.stringify(verifiedUser));
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        secretKey,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
