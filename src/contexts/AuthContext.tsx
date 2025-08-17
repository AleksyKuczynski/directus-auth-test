'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import AuthService from '@/services/AuthService'
import SessionManager from '@/services/SessionManager'

interface AuthContextType {
  user: any | null
  loading: boolean
  login: (googleToken: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  
  const authService = AuthService.getInstance()
  const sessionManager = SessionManager.getInstance()
  
  useEffect(() => {
    // Check for existing session on mount
    const session = sessionManager.getSession()
    if (session) {
      setUser(session.user)
    }
    setLoading(false)
  }, [])
  
  const login = async (googleToken: string) => {
    try {
      const authResponse = await authService.loginWithGoogle(googleToken)
      
      sessionManager.saveSession({
        accessToken: authResponse.access_token,
        refreshToken: authResponse.refresh_token,
        expiresAt: Date.now() + (authResponse.expires * 1000),
        user: {
          id: authResponse.user.id,
          email: authResponse.user.email,
          name: `${authResponse.user.first_name} ${authResponse.user.last_name}`.trim(),
        },
      })
      
      setUser(authResponse.user)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }
  
  const logout = async () => {
    const session = sessionManager.getSession()
    if (session) {
      await authService.logout(session.refreshToken)
    }
    sessionManager.clearSession()
    setUser(null)
  }
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}