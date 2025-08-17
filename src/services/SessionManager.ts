import Cookies from 'js-cookie'

interface SessionData {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: {
    id: string
    email: string
    name?: string
  }
}

class SessionManager {
  private static instance: SessionManager
  private readonly ACCESS_TOKEN_KEY = 'directus_access_token'
  private readonly REFRESH_TOKEN_KEY = 'directus_refresh_token'
  private readonly SESSION_KEY = 'directus_session'
  
  private constructor() {}
  
  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }
  
  saveSession(sessionData: SessionData): void {
    const { accessToken, refreshToken, expiresAt, user } = sessionData
    
    // Store tokens in httpOnly cookies (server-side) or secure cookies
    Cookies.set(this.ACCESS_TOKEN_KEY, accessToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(expiresAt),
    })
    
    Cookies.set(this.REFRESH_TOKEN_KEY, refreshToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: 30, // 30 days
    })
    
    // Store user data in localStorage for quick access
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(user))
    }
  }
  
  getSession(): SessionData | null {
    const accessToken = Cookies.get(this.ACCESS_TOKEN_KEY)
    const refreshToken = Cookies.get(this.REFRESH_TOKEN_KEY)
    
    if (!accessToken || !refreshToken) {
      return null
    }
    
    let user = null
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(this.SESSION_KEY)
      if (userData) {
        user = JSON.parse(userData)
      }
    }
    
    return {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + 900000, // 15 minutes
      user,
    }
  }
  
  clearSession(): void {
    Cookies.remove(this.ACCESS_TOKEN_KEY)
    Cookies.remove(this.REFRESH_TOKEN_KEY)
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY)
    }
  }
  
  isAuthenticated(): boolean {
    return !!this.getSession()
  }
}

export default SessionManager