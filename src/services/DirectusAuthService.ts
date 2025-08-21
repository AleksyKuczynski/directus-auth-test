// src/services/DirectusAuthService.ts

import { 
  DirectusUser, 
  DirectusLoginState, 
  BrowserUserInfo,
  DirectusApiResponse,
  DirectusListResponse,
  DirectusAuthResponse 
} from "@/types/auth";

/**
 * Directus Authentication Service
 * Handles user management and authentication with Directus CMS
 */
export class DirectusAuthService {
  private static instance: DirectusAuthService;
  private directusUrl: string | null = null;
  private adminToken: string | null = null;
  private userToken: string | null = null;

  private constructor() {
    this.directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || null;
    this.adminToken = process.env.DIRECTUS_TOKEN || null;
  }

  public static getInstance(): DirectusAuthService {
    if (!DirectusAuthService.instance) {
      DirectusAuthService.instance = new DirectusAuthService();
    }
    return DirectusAuthService.instance;
  }

  /**
   * Check if Directus is properly configured
   */
  private validateConfiguration(): void {
    if (!this.directusUrl) {
      throw new Error('Directus URL not configured. Please set NEXT_PUBLIC_DIRECTUS_URL environment variable.');
    }
  }

  /**
   * Make authenticated request to Directus API
   */
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {},
    useAdminToken: boolean = false
  ): Promise<T> {
    this.validateConfiguration();

    const token = useAdminToken ? this.adminToken : this.userToken;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.directusUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Directus API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Check if user exists in Directus by Google ID
   */
  async checkUserExists(googleId: string): Promise<DirectusUser | null> {
    try {
      const response = await this.makeRequest<DirectusListResponse<DirectusUser>>(
        `/items/app_users?filter[google_id][_eq]=${googleId}&limit=1`,
        { method: 'GET' }
      );

      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw error;
    }
  }

  /**
   * Register new user in Directus
   */
  async registerUser(browserUserInfo: BrowserUserInfo): Promise<DirectusUser> {
    try {
      const userData = {
        google_id: browserUserInfo.id,
        email: browserUserInfo.email,
        name: browserUserInfo.name,
        avatar_url: browserUserInfo.imageUrl || null,
        status: 'active'
      };

      const response = await this.makeRequest<DirectusApiResponse<DirectusUser>>(
        '/items/app_users',
        {
          method: 'POST',
          body: JSON.stringify(userData),
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Authenticate user and get session token
   * Since we're using Google OAuth, we'll create a custom auth endpoint
   * or use Directus's built-in authentication with a custom approach
   */
  async authenticateUser(directusUser: DirectusUser): Promise<string> {
    try {
      // For now, we'll use admin token approach
      // In production, you should implement a custom auth endpoint
      // that validates the Google token and returns a Directus token
      
      if (!this.adminToken) {
        throw new Error('Admin token not configured for user authentication');
      }

      // Store user token (in production, implement proper token generation)
      this.userToken = this.adminToken;
      
      // Store token in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('directus_token', this.userToken);
        localStorage.setItem('directus_user', JSON.stringify(directusUser));
      }

      return this.userToken;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  /**
   * Check current Directus authentication state
   */
  async checkDirectusAuthState(browserUserInfo: BrowserUserInfo | null): Promise<DirectusLoginState> {
    try {
      if (!browserUserInfo) {
        return {
          isRegistered: false,
          isLoggedIn: false,
          user: null,
          token: null,
          error: null
        };
      }

      // Check if user exists in Directus
      const directusUser = await this.checkUserExists(browserUserInfo.id);
      
      // Check if user has stored token
      let token: string | null = null;
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('directus_token');
      }

      if (directusUser && token) {
        // User exists and has token - they're logged in
        this.userToken = token;
        return {
          isRegistered: true,
          isLoggedIn: true,
          user: directusUser,
          token: token,
          error: null
        };
      } else if (directusUser && !token) {
        // User exists but no token - needs to log in
        return {
          isRegistered: true,
          isLoggedIn: false,
          user: directusUser,
          token: null,
          error: null
        };
      } else {
        // User doesn't exist - needs to register
        return {
          isRegistered: false,
          isLoggedIn: false,
          user: null,
          token: null,
          error: null
        };
      }

    } catch (error) {
      console.error('Error checking Directus auth state:', error);
      return {
        isRegistered: false,
        isLoggedIn: false,
        user: null,
        token: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update user profile in Directus
   */
  async updateUserProfile(userId: number, updates: Partial<DirectusUser>): Promise<DirectusUser> {
    try {
      const response = await this.makeRequest<DirectusApiResponse<DirectusUser>>(
        `/items/app_users/${userId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updates),
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Logout user from Directus
   */
  async logout(): Promise<void> {
    try {
      // Clear stored tokens
      this.userToken = null;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('directus_token');
        localStorage.removeItem('directus_user');
      }

      // In production, you might want to call a logout endpoint
      // to invalidate the token on the server side
      
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  /**
   * Get current user token
   */
  getCurrentToken(): string | null {
    return this.userToken;
  }

  /**
   * Set user token (for session restoration)
   */
  setUserToken(token: string): void {
    this.userToken = token;
  }
}