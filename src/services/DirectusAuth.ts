import { createDirectus, rest, authentication } from '@directus/sdk';
import { SessionManager, TokenData } from './AuthService';

// Define the user interface
export interface DirectusUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  provider?: string;
  external_identifier?: string;
}

// Define the Directus schema interface
interface DirectusSchema {
  directus_users: DirectusUser;
}

export class DirectusAuth {
  private client;
  private sessionManager: SessionManager;

  constructor() {
    this.client = createDirectus<DirectusSchema>(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
      .with(rest())
      .with(authentication());
    
    this.sessionManager = new SessionManager();
  }

  async getGoogleAuthUrl(): Promise<string> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/auth/oauth/google`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to get Google auth URL');
      }

      const data = await response.json();
      return data.url || data.authorization_url;
    } catch (error) {
      console.error('Error getting Google auth URL:', error);
      throw error;
    }
  }

  async handleAuthCallback(code: string): Promise<DirectusUser> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/auth/oauth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const authData = await response.json();
      
      const tokenData: TokenData = {
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
        expires_in: authData.expires_in,
      };

      this.sessionManager.setToken(tokenData);
      
      return authData.user;
    } catch (error) {
      console.error('Error in auth callback:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<DirectusUser | null> {
    try {
      const token = this.sessionManager.getToken();
      if (!token || this.sessionManager.isTokenExpired(token)) {
        return null;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get current user');
      }

      const userData = await response.json();
      return userData.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async checkUserExists(email: string): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/users?filter[email][_eq]=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.data && data.data.length > 0;
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.sessionManager.getToken();
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      this.sessionManager.clearToken();
    }
  }
}