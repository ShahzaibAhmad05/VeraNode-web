'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Admin {
  id: string;
  createdAt: string;
  lastLogin: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  verifyAdmin: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!admin;

  // Load admin from sessionStorage on mount
  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const token = sessionStorage.getItem('admin_token');
        const adminData = sessionStorage.getItem('admin_data');

        if (token && adminData) {
          setAdmin(JSON.parse(adminData));
          
          // Verify token with backend
          try {
            const { admin: verifiedAdmin } = await adminAPI.verify();
            setAdmin(verifiedAdmin);
            sessionStorage.setItem('admin_data', JSON.stringify(verifiedAdmin));
          } catch (error) {
            // Token invalid, clear auth
            sessionStorage.removeItem('admin_token');
            sessionStorage.removeItem('admin_data');
            setAdmin(null);
          }
        }
      } catch (error) {
        console.error('Error loading admin:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdmin();
  }, []);

  const logout = () => {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_data');
    setAdmin(null);
    toast.success('Admin logged out');
    router.push('/auth/login');
  };

  const verifyAdmin = async (): Promise<boolean> => {
    try {
      const { admin: verifiedAdmin } = await adminAPI.verify();
      setAdmin(verifiedAdmin);
      sessionStorage.setItem('admin_data', JSON.stringify(verifiedAdmin));
      return true;
    } catch (error) {
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('admin_data');
      setAdmin(null);
      return false;
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticated,
        logout,
        verifyAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
