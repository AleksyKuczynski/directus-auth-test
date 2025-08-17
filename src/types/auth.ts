// Shared type definitions for authentication

export interface DirectusUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  provider?: string;
  external_identifier?: string;
}

export interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

export interface AuthContextType {
  user: DirectusUser | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  handleAuthCallback: (code: string) => Promise<DirectusUser>;
  checkUserExists: (email: string) => Promise<boolean>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}