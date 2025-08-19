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

// Global type definitions for Google API
declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      auth2: {
        init: (config: {
          client_id: string;
          scope: string;
        }) => Promise<gapi.auth2.GoogleAuth>;
        getAuthInstance: () => gapi.auth2.GoogleAuth;
      };
    };
  }

  namespace gapi {
    namespace auth2 {
      interface GoogleAuth {
        isSignedIn: {
          get: () => boolean;
        };
        currentUser: {
          get: () => GoogleUser;
        };
        signIn: () => Promise<GoogleUser>;
      }

      interface GoogleUser {
        getBasicProfile: () => BasicProfile;
      }

      interface BasicProfile {
        getId: () => string;
        getEmail: () => string;
        getName: () => string;
        getImageUrl: () => string;
      }
    }
  }
}