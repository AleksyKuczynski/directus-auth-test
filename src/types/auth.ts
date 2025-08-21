// src/types/auth.ts

export interface BrowserUserInfo {
  id: string;
  email: string;
  name: string;
  imageUrl: string;
}

export interface BrowserLoginState {
  isLoggedIn: boolean;
  userInfo: BrowserUserInfo | null;
  error: string | null;
}

// Directus User Types
export interface DirectusUser {
  id: number;
  google_id: string;
  email: string;
  name: string;
  avatar_url?: string;
  birthday?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DirectusLoginState {
  isRegistered: boolean;
  isLoggedIn: boolean;
  user: DirectusUser | null;
  token: string | null;
  error: string | null;
}

// Combined Authentication State
export interface CombinedAuthState {
  browser: BrowserLoginState | null;
  directus: DirectusLoginState | null;
  loading: boolean;
  error: string | null;
}

// User State Enum for Login Page Logic
export enum UserState {
  BROWSER_NOT_LOGGED_IN = 'browser_not_logged_in',           // Case 1
  BROWSER_LOGGED_IN_DIRECTUS_LOGGED_IN = 'directus_logged_in',        // Case 3  
  BROWSER_LOGGED_IN_DIRECTUS_EXISTS_NOT_LOGGED = 'directus_exists_not_logged', // Case 4
  BROWSER_LOGGED_IN_DIRECTUS_NOT_EXISTS = 'directus_not_exists',      // Case 5
  LOADING = 'loading',
  ERROR = 'error'
}

export interface AuthContextType {
  // Legacy browser-only state (for backward compatibility)
  browserLoginState: BrowserLoginState | null;
  loading: boolean;
  checkBrowserAuth: () => Promise<void>;
  triggerLogin: () => Promise<void>;
  
  // New combined authentication state
  combinedAuthState: CombinedAuthState;
  userState: UserState;
  
  // Directus operations
  registerUserInDirectus: () => Promise<void>;
  loginToDirectus: () => Promise<void>;
  logoutFromDirectus: () => Promise<void>;
  
  // Utility methods
  refresh: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

// Directus API Response Types
export interface DirectusApiResponse<T> {
  data: T;
}

export interface DirectusListResponse<T> {
  data: T[];
  meta: {
    total_count: number;
    filter_count: number;
  };
}

export interface DirectusAuthResponse {
  access_token: string;
  expires: number;
  refresh_token: string;
}

// Global type definitions for Google Identity Services
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: GoogleIdentityConfig) => void;
          prompt: (momentListener?: (notification: PromptMomentNotification) => void) => void;
          renderButton: (parent: HTMLElement, options: GsiButtonConfiguration) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }

  interface GoogleIdentityConfig {
    client_id: string;
    callback: (credentialResponse: CredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }

  interface CredentialResponse {
    credential: string;
    select_by?: string;
  }

  interface PromptMomentNotification {
    isNotDisplayed: () => boolean;
    isSkippedMoment: () => boolean;
    getNotDisplayedReason?: () => string;
    getSkippedReason?: () => string;
  }

  interface GsiButtonConfiguration {
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
    logo_alignment?: 'left' | 'center';
    width?: string;
    locale?: string;
  }
}