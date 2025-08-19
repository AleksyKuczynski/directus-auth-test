// src/services/BrowserAuthService.ts

import { BrowserLoginState } from "@/types/auth";

/**
 * Service for detecting Google browser authentication state
 * Focuses only on checking if user is logged into browser
 */
export class BrowserAuthService {
  private static instance: BrowserAuthService;

  private constructor() {}

  public static getInstance(): BrowserAuthService {
    if (!BrowserAuthService.instance) {
      BrowserAuthService.instance = new BrowserAuthService();
    }
    return BrowserAuthService.instance;
  }

  /**
   * Check if user is logged into Google in their browser
   * This uses Google's JavaScript API to detect browser login state
   */
  async checkBrowserLoginState(): Promise<BrowserLoginState> {
    try {
      // Load Google Auth API if not already loaded
      await this.loadGoogleAuthAPI();
      
      // Initialize and check auth state
      const authInstance = await this.initializeGoogleAuth();
      const isSignedIn = authInstance.isSignedIn.get();
      
      if (!isSignedIn) {
        return {
          isLoggedIn: false,
          userInfo: null,
          error: null
        };
      }

      // Get basic user info from browser session
      const user = authInstance.currentUser.get();
      const profile = user.getBasicProfile();
      
      return {
        isLoggedIn: true,
        userInfo: {
          id: profile.getId(),
          email: profile.getEmail(),
          name: profile.getName(),
          imageUrl: profile.getImageUrl()
        },
        error: null
      };

    } catch (error) {
      console.error('Browser auth detection error:', error);
      return {
        isLoggedIn: false,
        userInfo: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Trigger Google browser login
   */
  async triggerBrowserLogin(): Promise<void> {
    try {
      await this.loadGoogleAuthAPI();
      const authInstance = await this.initializeGoogleAuth();
      await authInstance.signIn();
    } catch (error) {
      console.error('Browser login error:', error);
      throw error;
    }
  }

  /**
   * Load Google Auth JavaScript API
   */
  private async loadGoogleAuthAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Not in browser environment'));
        return;
      }

      // Check if already loaded
      if (window.gapi && window.gapi.auth2) {
        resolve();
        return;
      }

      // Load Google API script
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('auth2', () => resolve());
      };
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize Google Auth instance
   */
  private async initializeGoogleAuth(): Promise<gapi.auth2.GoogleAuth> {
    return new Promise((resolve, reject) => {
      window.gapi.auth2.init({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope: 'profile email'
      }).then(() => {
        const authInstance = window.gapi.auth2.getAuthInstance();
        resolve(authInstance);
      }).catch(reject);
    });
  }
}