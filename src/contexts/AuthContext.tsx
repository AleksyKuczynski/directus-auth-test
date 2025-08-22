// src/contexts/AuthContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserAuthService } from '../services/BrowserAuthService';
import { DirectusAuthService } from '../services/DirectusAuthService';
import type { 
  BrowserLoginState, 
  DirectusLoginState,
  CombinedAuthState,
  UserState,
  AuthContextType, 
  AuthProviderProps 
} from '../types/auth';
import { UserState as UserStateEnum } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Production Auth Provider handling both browser and Directus authentication
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Legacy state for backward compatibility
  const [browserLoginState, setBrowserLoginState] = useState<BrowserLoginState | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Combined authentication state
  const [combinedAuthState, setCombinedAuthState] = useState<CombinedAuthState>({
    browser: null,
    directus: null,
    loading: false,
    error: null
  });

  // Current user state enum
  const [userState, setUserState] = useState<UserState>(UserStateEnum.LOADING);
  
  const browserAuthService = BrowserAuthService.getInstance();
  const directusAuthService = DirectusAuthService.getInstance();

  /**
   * Determine user state based on browser and Directus auth states
   */
  const determineUserState = (browser: BrowserLoginState | null, directus: DirectusLoginState | null): UserState => {
    if (!browser) {
      return UserStateEnum.LOADING;
    }

    if (browser.error || (directus && directus.error)) {
      return UserStateEnum.ERROR;
    }

    if (!browser.isLoggedIn) {
      return UserStateEnum.BROWSER_NOT_LOGGED_IN; // Case 1
    }

    if (!directus) {
      return UserStateEnum.LOADING;
    }

    if (directus.isRegistered && directus.isLoggedIn) {
      return UserStateEnum.BROWSER_LOGGED_IN_DIRECTUS_LOGGED_IN; // Case 2
    }

    if (directus.isRegistered && !directus.isLoggedIn) {
      return UserStateEnum.BROWSER_LOGGED_IN_DIRECTUS_EXISTS_NOT_LOGGED; // Case 3
    }

    if (!directus.isRegistered) {
      return UserStateEnum.BROWSER_LOGGED_IN_DIRECTUS_NOT_EXISTS; // Case 4
    }

    return UserStateEnum.ERROR;
  };

  /**
   * Update combined state and determine user state
   */
  const updateCombinedState = (browser: BrowserLoginState | null, directus: DirectusLoginState | null, loading: boolean = false, error: string | null = null) => {
    const newCombinedState: CombinedAuthState = {
      browser,
      directus,
      loading,
      error
    };

    setCombinedAuthState(newCombinedState);
    setUserState(determineUserState(browser, directus));
    
    // Update legacy state for backward compatibility
    setBrowserLoginState(browser);
    setLoading(loading);
  };

  /**
   * Check browser authentication state
   */
  const checkBrowserAuth = async (): Promise<void> => {
    try {
      updateCombinedState(combinedAuthState.browser, combinedAuthState.directus, true);
      
      const loginState = await browserAuthService.checkBrowserLoginState();
      
      updateCombinedState(loginState, combinedAuthState.directus, false);
    } catch (error) {
      console.error('Browser auth check failed:', error);
      const errorState: BrowserLoginState = {
        isLoggedIn: false,
        userInfo: null,
        error: error instanceof Error ? error.message : 'Auth check failed'
      };
      updateCombinedState(errorState, combinedAuthState.directus, false);
    }
  };

  /**
   * Check complete authentication state (browser + Directus)
   */
  const checkCompleteAuthState = async (): Promise<void> => {
    try {
      updateCombinedState(combinedAuthState.browser, combinedAuthState.directus, true);

      // First check browser auth
      const browserState = await browserAuthService.checkBrowserLoginState();
      
      // Then check Directus auth based on browser state
      const directusState = await directusAuthService.checkDirectusAuthState(browserState.userInfo);
      
      updateCombinedState(browserState, directusState, false);
    } catch (error) {
      console.error('Complete auth check failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Auth check failed';
      updateCombinedState(null, null, false, errorMessage);
    }
  };

  /**
   * Trigger browser login flow
   */
  const triggerLogin = async (): Promise<void> => {
    try {
      updateCombinedState(combinedAuthState.browser, combinedAuthState.directus, true);
      
      const userInfo = await browserAuthService.triggerBrowserLogin();
      
      if (userInfo) {
        const browserState: BrowserLoginState = {
          isLoggedIn: true,
          userInfo: userInfo,
          error: null
        };
        
        // After successful browser login, check Directus state
        const directusState = await directusAuthService.checkDirectusAuthState(userInfo);
        
        updateCombinedState(browserState, directusState, false);
      } else {
        const browserState: BrowserLoginState = {
          isLoggedIn: false,
          userInfo: null,
          error: 'Login was cancelled'
        };
        updateCombinedState(browserState, combinedAuthState.directus, false);
      }
    } catch (error) {
      console.error('Browser login failed:', error);
      const errorState: BrowserLoginState = {
        isLoggedIn: false,
        userInfo: null,
        error: error instanceof Error ? error.message : 'Login failed'
      };
      updateCombinedState(errorState, combinedAuthState.directus, false);
    }
  };

  /**
   * Register user in Directus
   */
  const registerUserInDirectus = async (): Promise<void> => {
    try {
      if (!combinedAuthState.browser?.userInfo) {
        throw new Error('No browser user info available for registration');
      }

      updateCombinedState(combinedAuthState.browser, combinedAuthState.directus, true);

      const directusUser = await directusAuthService.registerUser(combinedAuthState.browser.userInfo);
      const token = await directusAuthService.authenticateUser(directusUser);

      const newDirectusState: DirectusLoginState = {
        isRegistered: true,
        isLoggedIn: true,
        user: directusUser,
        token: token,
        error: null
      };

      updateCombinedState(combinedAuthState.browser, newDirectusState, false);
    } catch (error) {
      console.error('User registration failed:', error);
      const errorDirectusState: DirectusLoginState = {
        ...combinedAuthState.directus!,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
      updateCombinedState(combinedAuthState.browser, errorDirectusState, false);
    }
  };

  /**
   * Log in to Directus
   */
  const loginToDirectus = async (): Promise<void> => {
    try {
      if (!combinedAuthState.directus?.user) {
        throw new Error('No Directus user found for login');
      }

      updateCombinedState(combinedAuthState.browser, combinedAuthState.directus, true);

      const token = await directusAuthService.authenticateUser(combinedAuthState.directus.user);

      const newDirectusState: DirectusLoginState = {
        ...combinedAuthState.directus,
        isLoggedIn: true,
        token: token,
        error: null
      };

      updateCombinedState(combinedAuthState.browser, newDirectusState, false);
    } catch (error) {
      console.error('Directus login failed:', error);
      const errorDirectusState: DirectusLoginState = {
        ...combinedAuthState.directus!,
        error: error instanceof Error ? error.message : 'Login failed'
      };
      updateCombinedState(combinedAuthState.browser, errorDirectusState, false);
    }
  };

  /**
   * Log out from Directus
   */
  const logoutFromDirectus = async (): Promise<void> => {
    try {
      await directusAuthService.logout();

      const newDirectusState: DirectusLoginState = {
        isRegistered: combinedAuthState.directus?.isRegistered || false,
        isLoggedIn: false,
        user: combinedAuthState.directus?.user || null,
        token: null,
        error: null
      };

      updateCombinedState(combinedAuthState.browser, newDirectusState, false);
    } catch (error) {
      console.error('Directus logout failed:', error);
      // Even if logout fails, clear local state
      const newDirectusState: DirectusLoginState = {
        isRegistered: false,
        isLoggedIn: false,
        user: null,
        token: null,
        error: error instanceof Error ? error.message : 'Logout failed'
      };
      updateCombinedState(combinedAuthState.browser, newDirectusState, false);
    }
  };

  /**
   * Refresh complete authentication state
   */
  const refresh = async (): Promise<void> => {
    await checkCompleteAuthState();
  };

  // Check complete auth state on mount
  useEffect(() => {
    checkCompleteAuthState();
  }, []);

  const contextValue: AuthContextType = {
    // Legacy API for backward compatibility
    browserLoginState,
    loading,
    checkBrowserAuth,
    triggerLogin,
    
    // Combined authentication API
    combinedAuthState,
    userState,
    
    // Directus operations
    registerUserInDirectus,
    loginToDirectus,
    logoutFromDirectus,
    
    // Utility methods
    refresh,
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