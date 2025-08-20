// src/contexts/AuthContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserAuthService } from '../services/BrowserAuthService';
import type { 
  BrowserLoginState, 
  AuthContextType, 
  AuthProviderProps 
} from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider handling browser authentication detection and state management
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [browserLoginState, setBrowserLoginState] = useState<BrowserLoginState | null>(null);
  const [loading, setLoading] = useState(false);
  
  const browserAuthService = BrowserAuthService.getInstance();

  /**
   * Check browser authentication state
   */
  const checkBrowserAuth = async (): Promise<void> => {
    try {
      setLoading(true);
      const loginState = await browserAuthService.checkBrowserLoginState();
      setBrowserLoginState(loginState);
    } catch (error) {
      console.error('Browser auth check failed:', error);
      setBrowserLoginState({
        isLoggedIn: false,
        userInfo: null,
        error: error instanceof Error ? error.message : 'Auth check failed'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Trigger browser login flow
   */
  const triggerLogin = async (): Promise<void> => {
    try {
      setLoading(true);
      const userInfo = await browserAuthService.triggerBrowserLogin();
      
      if (userInfo) {
        setBrowserLoginState({
          isLoggedIn: true,
          userInfo: userInfo,
          error: null
        });
      } else {
        setBrowserLoginState({
          isLoggedIn: false,
          userInfo: null,
          error: 'Login was cancelled'
        });
      }
    } catch (error) {
      console.error('Browser login failed:', error);
      setBrowserLoginState({
        isLoggedIn: false,
        userInfo: null,
        error: error instanceof Error ? error.message : 'Login failed'
      });
    } finally {
      setLoading(false);
    }
  };

  // Check browser auth state on mount
  useEffect(() => {
    checkBrowserAuth();
  }, []);

  const contextValue: AuthContextType = {
    browserLoginState,
    loading,
    checkBrowserAuth,
    triggerLogin,
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