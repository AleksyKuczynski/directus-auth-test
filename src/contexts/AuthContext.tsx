// src/contexts/AuthContext.tsx

'use client';

import React, { createContext, useContext, useState } from 'react';
import { BrowserAuthService } from '../services/BrowserAuthService';
import type { 
  BrowserLoginState, 
  AuthContextType, 
  AuthProviderProps 
} from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Simplified Auth Provider focused only on browser authentication detection
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [browserLoginState, setBrowserLoginState] = useState<BrowserLoginState | null>(null);
  const [loading, setLoading] = useState(false);
  
  const browserAuthService = BrowserAuthService.getInstance();

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