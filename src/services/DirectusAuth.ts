import { createDirectus, rest, authentication } from '@directus/sdk';
import { SessionManager } from './AuthService';
import type { DirectusUser, TokenData } from '../types/auth';

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
      // Get the callback URL for the current environment
      const callbackUrl = `${window.location.origin}/auth/callback`;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/auth/oauth/google?redirect=${encodeURIComponent(callbackUrl)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to get Google auth URL');
      }

      const data = await response.json();
      return data.url || data.authorization_url || data.data?.url;
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
        body: JSON.stringify({ 
          code,
          redirect_uri: `${window.location.origin}/auth/callback`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Authentication failed: ${errorData?.error || response.statusText}`);
      }

      const authData = await response.json();
      
      // Handle different response structures from Directus
      const tokenData: TokenData = {
        access_token: authData.access_token || authData.data?.access_token,
        refresh_token: authData.refresh_token || authData.data?.refresh_token,
        expires_in: authData.expires_in || authData.data?.expires_in,
      };

      if (!tokenData.access_token) {
        throw new Error('No access token received from authentication');
      }

      this.sessionManager.setToken(tokenData);
      
      // Get user data after setting token
      const userData = await this.getCurrentUser();
      if (!userData) {
        throw new Error('Failed to get user data after authentication');
      }
      
      return userData;
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