// src/services/BrowserAuthService.ts

import { BrowserLoginState, BrowserUserInfo } from "@/types/auth";

/**
 * Production Browser Auth Service
 * Uses button-only approach to avoid Google prompt() API issues
 */
export class BrowserAuthService {
  private static instance: BrowserAuthService;
  private googleClientId: string | null = null;

  private constructor() {
    this.googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || null;
  }

  public static getInstance(): BrowserAuthService {
    if (!BrowserAuthService.instance) {
      BrowserAuthService.instance = new BrowserAuthService();
    }
    return BrowserAuthService.instance;
  }

  /**
   * Check if user is signed into Google
   */
  async checkBrowserLoginState(): Promise<BrowserLoginState> {
    try {
      if (!this.googleClientId) {
        return {
          isLoggedIn: false,
          userInfo: null,
          error: 'Google Client ID not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable.'
        };
      }

      await this.loadGoogleIdentityServices();
      
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
   * Trigger Google browser sign-in using button-only approach
   */
  async triggerBrowserLogin(): Promise<BrowserUserInfo | null> {
    try {
      if (!this.googleClientId) {
        throw new Error('Google Client ID not configured');
      }

      await this.loadGoogleIdentityServices();
      await new Promise(resolve => setTimeout(resolve, 300));

      if (!window.google?.accounts?.id) {
        throw new Error('Google Identity Services not available');
      }

      return new Promise((resolve, reject) => {
        try {
          // Initialize Google Identity Services
          window.google.accounts.id.initialize({
            client_id: this.googleClientId!,
            callback: (credentialResponse) => {
              try {
                const userInfo = this.decodeJWTCredential(credentialResponse.credential);
                resolve(userInfo);
              } catch (error) {
                reject(error);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Show sign-in button directly (bypassing problematic prompt())
          this.renderSignInButton(resolve, reject);

        } catch (error) {
          reject(error);
        }
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

      if (window.google && window.google.accounts) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(() => {
          if (window.google?.accounts?.id) {
            resolve();
          } else {
            reject(new Error('Google Identity Services API not available'));
          }
        }, 200);
      };
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  /**
   * Render Google Sign In button
   */
  private renderSignInButton(
    resolve: (value: BrowserUserInfo | null) => void, 
    reject: (error: any) => void
  ): void {
    // Remove any existing button
    const existingButton = document.getElementById('google-signin-modal');
    if (existingButton) {
      document.body.removeChild(existingButton);
    }

    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'google-signin-modal';
    buttonContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background-color: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      text-align: center;
      max-width: 400px;
      width: 90%;
    `;

    // Title
    const title = document.createElement('h3');
    title.textContent = 'Sign in to continue';
    title.style.cssText = `
      margin: 0 0 1rem 0;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 1.5rem;
      color: #333;
      font-weight: 600;
    `;
    modal.appendChild(title);

    // Subtitle
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Choose your Google account to continue';
    subtitle.style.cssText = `
      margin: 0 0 2rem 0;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 1rem;
      color: #666;
      line-height: 1.5;
    `;
    modal.appendChild(subtitle);

    // Close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 1rem;
      right: 1rem;
      border: none;
      background: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      padding: 0.5rem;
      line-height: 1;
    `;
    closeButton.onclick = () => {
      document.body.removeChild(buttonContainer);
      resolve(null);
    };
    modal.style.position = 'relative';
    modal.appendChild(closeButton);

    // Button container
    const buttonDiv = document.createElement('div');
    buttonDiv.style.marginBottom = '1rem';
    modal.appendChild(buttonDiv);

    // Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.cssText = `
      padding: 0.75rem 1.5rem;
      border: 1px solid #ddd;
      background: white;
      color: #666;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      margin-top: 1rem;
    `;
    cancelButton.onclick = () => {
      document.body.removeChild(buttonContainer);
      resolve(null);
    };
    modal.appendChild(cancelButton);

    buttonContainer.appendChild(modal);

    try {
      // Render Google button
      window.google.accounts.id.renderButton(buttonDiv, {
        theme: 'filled_blue',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: '300',
      });
      
      document.body.appendChild(buttonContainer);

    } catch (error) {
      reject(error);
    }
  }

  /**
   * Decode JWT credential to extract user information
   */
  private decodeJWTCredential(credential: string): BrowserUserInfo {
    try {
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