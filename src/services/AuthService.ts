import Cookies from 'js-cookie';

export interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

export class SessionManager {
  private readonly ACCESS_TOKEN_KEY = 'directus_access_token';
  private readonly REFRESH_TOKEN_KEY = 'directus_refresh_token';

  setToken(tokenData: TokenData): void {
    if (tokenData.access_token) {
      Cookies.set(this.ACCESS_TOKEN_KEY, tokenData.access_token, {
        expires: tokenData.expires_in ? tokenData.expires_in / 86400 : 7, // Convert seconds to days, default 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    }

    if (tokenData.refresh_token) {
      Cookies.set(this.REFRESH_TOKEN_KEY, tokenData.refresh_token, {
        expires: 30, // 30 days for refresh token
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    }
  }

  getToken(): string | undefined {
    return Cookies.get(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | undefined {
    return Cookies.get(this.REFRESH_TOKEN_KEY);
  }

  clearToken(): void {
    Cookies.remove(this.ACCESS_TOKEN_KEY);
    Cookies.remove(this.REFRESH_TOKEN_KEY);
  }

  isTokenExpired(token?: string): boolean {
    if (!token) return true;
    
    try {
      // Basic JWT payload extraction (without verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }
}