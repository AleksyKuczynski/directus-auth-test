import React, { createContext, useContext, useEffect, useState } from 'react';
import { DirectusAuth } from '../services/DirectusAuth';
import { SessionManager } from '../services/AuthService';
import type { DirectusUser, AuthContextType, AuthProviderProps } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<DirectusUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const directusAuth = new DirectusAuth();
  const sessionManager = new SessionManager();

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const token = sessionManager.getToken();
        if (token && !sessionManager.isTokenExpired(token)) {
          const currentUser = await directusAuth.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        sessionManager.clearToken();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []); // Remove sessionManager from dependencies to avoid recreation

  const login = async (): Promise<void> => {
    try {
      setLoading(true);
      const authUrl = await directusAuth.getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      throw error;
    }
  };

  const handleAuthCallback = async (code: string): Promise<DirectusUser> => {
    try {
      setLoading(true);
      const user = await directusAuth.handleAuthCallback(code);
      setUser(user);
      return user;
    } catch (error) {
      console.error('Auth callback error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await directusAuth.logout();
      sessionManager.clearToken();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      return await directusAuth.checkUserExists(email);
    } catch (error) {
      console.error('Check user exists error:', error);
      return false;
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    logout,
    handleAuthCallback,
    checkUserExists,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};