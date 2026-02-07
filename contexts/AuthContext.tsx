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
  register: (email: string, password: string, department: string, previousSecretKey?: string) => Promise<{ secretKey: string; recovered?: boolean }>;
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
      
      // Check if this is an admin login
      if (response.userType === 'admin') {
        // Handle admin login
        sessionStorage.setItem('admin_token', response.token);
        if (response.admin) {
          sessionStorage.setItem('admin_data', JSON.stringify(response.admin));
        }
        
        toast.success('Admin login successful!', {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        });
        
        // Use window.location for full page reload so AdminAuthContext initializes properly
        window.location.href = '/admin/dashboard';
      } else {
        // Handle student login
        if (response.profile) {
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
        }
      }
    } catch (error: any) {
      const errorCode = error.response?.data?.code;
      const message = error.response?.data?.error || error.response?.data?.message || 'Login failed';
      
      // Handle KEY_EXPIRED error specifically
      if (errorCode === 'KEY_EXPIRED') {
        toast.error('Your key has expired. You can recover your account by registering again.', {
          duration: 5000,
        });
      } else {
        toast.error(message);
      }
      
      throw error;
    }
  };

  const register = async (email: string, password: string, department: string, previousSecretKey?: string) => {
    try {
      const response = await authAPI.register(email, password, department, previousSecretKey);
      
      // Show success message based on whether account was recovered
      if (response.recovered) {
        toast.success('Account recovered successfully! Your data has been preserved.', {
          duration: 5000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        });
      }
      
      // Don't auto-login after registration - user needs to save secret key first
      // Just return the secret key to display in the UI
      return { 
        secretKey: response.secretKey,
        recovered: response.recovered 
      };
    } catch (error: any) {
      const errorCode = error.response?.data?.code;
      const message = error.response?.data?.message || 'Registration failed';
      
      // Handle specific error codes
      if (errorCode === 'INVALID_PREVIOUS_KEY') {
        toast.error('Previous key not found. Proceeding with normal registration.');
      } else if (errorCode === 'KEY_NOT_EXPIRED') {
        toast.error('This key is still valid. Please use it to login.');
      } else {
        toast.error(message);
      }
      
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
