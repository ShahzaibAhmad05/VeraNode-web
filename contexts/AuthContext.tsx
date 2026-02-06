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
  login: (secretKey: string) => Promise<void>;
  register: (area: string) => Promise<{ secretKey: string }>;
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
            const { profile } = await authAPI.getProfile();
            setUser(profile);
            localStorage.setItem('user_data', JSON.stringify(profile));
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

  const login = async (secretKey: string) => {
    try {
      const response = await authAPI.login(secretKey);
      
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data', JSON.stringify(response.profile));
      localStorage.setItem('secret_key', secretKey);
      
      setUser(response.profile);
      setSecretKey(secretKey);
      
      toast.success('Login successful!', {
        iconTheme: {
          primary: '#10b981',
          secondary: '#fff',
        },
      });
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (area: string) => {
    try {
      const response = await authAPI.register(area);
      
      // Don't auto-login after registration - user needs to save secret key first
      // Just return the secret key to display in the UI
      return { secretKey: response.secretKey };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call API logout (will handle errors internally)
      await authAPI.logout();
    } catch (error) {
      console.warn('Logout had issues, but continuing:', error);
    } finally {
      // Always clear state and redirect, regardless of API errors
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('secret_key');
      
      setUser(null);
      setSecretKey(null);
      
      toast.success('Logged out successfully', {
        iconTheme: {
          primary: '#10b981',
          secondary: '#fff',
        },
      });
      router.push('/auth/login');
    }
  };

  const refreshUser = async () => {
    try {
      const { profile } = await authAPI.getProfile();
      setUser(profile);
      localStorage.setItem('user_data', JSON.stringify(profile));
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
