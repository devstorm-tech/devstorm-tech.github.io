import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await apiClient.get('/user');
      setUser(response?.data?.data?.user || null);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    setUser,
    refreshUser: fetchUser,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    isVerified: Boolean(user?.isVerified ?? user?.emailVerified),
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
