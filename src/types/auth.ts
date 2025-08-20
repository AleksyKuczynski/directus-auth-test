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

export interface AuthContextType {
  browserLoginState: BrowserLoginState | null;
  loading: boolean;
  checkBrowserAuth: () => Promise<void>;
  triggerLogin: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
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