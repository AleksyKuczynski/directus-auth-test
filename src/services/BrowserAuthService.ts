// src/services/BrowserAuthService.ts

import { BrowserLoginState, BrowserUserInfo } from "@/types/auth";

/**
 * Modern Browser Auth Service using Google Identity Services
 * Replaces deprecated gapi.auth2 with current Google Identity Services
 */
export class BrowserAuthService {
  private static instance: BrowserAuthService;
  private googleClientId: string | null = null;

  private constructor() {
    // Initialize Google Client ID from environment
    this.googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || null;
  }

  public static getInstance(): BrowserAuthService {
    if (!BrowserAuthService.instance) {
      BrowserAuthService.instance = new BrowserAuthService();
    }
    return BrowserAuthService.instance;
  }

  /**
   * Check if user is signed into Google using Google Identity Services
   * Note: Modern Google Identity Services has privacy limitations - 
   * we can't passively detect login state, only through user interaction
   */
  async checkBrowserLoginState(): Promise<BrowserLoginState> {
    try {
      // Check if we have Google Client ID configured
      if (!this.googleClientId) {
        return {
          isLoggedIn: false,
          userInfo: null,
          error: 'Google Client ID not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable.'
        };
      }

      // Load Google Identity Services if not already loaded
      await this.loadGoogleIdentityServices();
      
      // With modern Google Identity Services, we can't silently check login state
      // due to privacy improvements. We can only detect through user interaction.
      // Return a neutral state that indicates we're ready to check authentication
      return {
        isLoggedIn: false,
        userInfo: null,
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
   * Trigger Google browser sign-in using One Tap or Sign In With Google
   */
  async triggerBrowserLogin(): Promise<BrowserUserInfo | null> {
    try {
      if (!this.googleClientId) {
        throw new Error('Google Client ID not configured');
      }

      await this.loadGoogleIdentityServices();
      
      return new Promise((resolve, reject) => {
        window.google.accounts.id.initialize({
          client_id: this.googleClientId!,
          callback: (credentialResponse) => {
            try {
              // Decode the JWT credential response
              const userInfo = this.decodeJWTCredential(credentialResponse.credential);
              resolve(userInfo);
            } catch (error) {
              reject(error);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Try One Tap first
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // One Tap didn't show, render a button instead
            this.renderSignInButton(resolve, reject);
          }
        });
      });

    } catch (error) {
      console.error('Browser login error:', error);
      throw error;
    }
  }

  /**
   * Load Google Identity Services JavaScript library
   */
  private async loadGoogleIdentityServices(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Not in browser environment'));
        return;
      }

      // Check if already loaded
      if (window.google && window.google.accounts) {
        resolve();
        return;
      }

      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  /**
   * Render Sign In With Google button for fallback
   */
  private renderSignInButton(
    resolve: (value: BrowserUserInfo | null) => void, 
    reject: (error: any) => void
  ): void {
    // Create a temporary container for the button
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'google-signin-button-temp';
    buttonContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 300px;
      text-align: center;
    `;
    document.body.appendChild(buttonContainer);

    // Add a title
    const title = document.createElement('p');
    title.textContent = 'Sign in with Google';
    title.style.cssText = `
      margin: 0 0 15px 0;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 16px;
      color: #333;
    `;
    buttonContainer.appendChild(title);

    // Add a close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      border: none;
      background: none;
      font-size: 20px;
      cursor: pointer;
      color: #666;
    `;
    closeButton.onclick = () => {
      document.body.removeChild(buttonContainer);
      resolve(null);
    };
    buttonContainer.appendChild(closeButton);

    // Create button container
    const buttonDiv = document.createElement('div');
    buttonContainer.appendChild(buttonDiv);

    // Render the Google Sign In button
    window.google.accounts.id.renderButton(buttonDiv, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
    });
  }

  /**
   * Decode JWT credential to extract user information
   */
  private decodeJWTCredential(credential: string): BrowserUserInfo {
    try {
      // JWT has 3 parts: header.payload.signature
      const payload = credential.split('.')[1];
      if (!payload) {
        throw new Error('Invalid credential format');
      }
      
      const decodedPayload = JSON.parse(atob(payload));
      
      if (!decodedPayload.sub || !decodedPayload.email) {
        throw new Error('Invalid credential payload');
      }
      
      return {
        id: decodedPayload.sub,
        email: decodedPayload.email,
        name: decodedPayload.name || decodedPayload.email,
        imageUrl: decodedPayload.picture || ''
      };
    } catch (error) {
      throw new Error('Failed to decode credential: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}