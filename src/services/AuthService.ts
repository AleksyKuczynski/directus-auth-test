import { createDirectus, authentication, rest, readMe } from '@directus/sdk'

export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  avatar?: string
  external_identifier?: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires: number
}

export interface AuthResponse extends AuthTokens {
  user: User
}

class AuthService {
  private static instance: AuthService
  private client: any
  
  private constructor() {
    this.client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
      .with(authentication('json'))
      .with(rest())
  }
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }
  
  async loginWithGoogle(googleToken: string): Promise<AuthResponse> {
    try {
      // Exchange Google token for Directus token
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/auth/login/google`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: googleToken }),
        }
      )
      
      if (!response.ok) {
        throw new Error('Google authentication failed')
      }
      
      const data = await response.json()
      
      // Set token for subsequent requests
      this.client.setToken(data.data.access_token)
      
      // Fetch user details
      const user = await this.client.request(readMe())
      
      return {
        ...data.data,
        user,
      }
    } catch (error) {
      console.error('Google login error:', error)
      throw error
    }
  }
  
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/auth/refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        }
      )
      
      if (!response.ok) {
        throw new Error('Token refresh failed')
      }
      
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Token refresh error:', error)
      throw error
    }
  }
  
  async logout(refreshToken: string): Promise<void> {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  async getCurrentUser(accessToken: string): Promise<User> {
    this.client.setToken(accessToken)
    return await this.client.request(readMe())
  }
}

export default AuthService