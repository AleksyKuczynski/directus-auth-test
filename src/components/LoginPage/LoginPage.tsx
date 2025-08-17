'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import styles from './LoginPage.module.scss'

enum UserState {
  LOADING = 'loading',
  LOGGED_IN = 'logged_in',
  EXISTING_USER = 'existing_user',
  NEW_USER = 'new_user',
}

const LoginPage: React.FC = () => {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()
  const [userState, setUserState] = useState<UserState>(UserState.LOADING)
  const [email, setEmail] = useState('')
  
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        setUserState(UserState.LOGGED_IN)
      } else if (email) {
        // Check if user exists in Directus
        checkUserExists(email)
      } else {
        setUserState(UserState.NEW_USER)
      }
    }
  }, [loading, isAuthenticated, email])
  
  const checkUserExists = async (email: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/users?filter[email][_eq]=${email}`
      )
      const data = await response.json()
      
      if (data.data && data.data.length > 0) {
        setUserState(UserState.EXISTING_USER)
      } else {
        setUserState(UserState.NEW_USER)
      }
    } catch (error) {
      console.error('Error checking user:', error)
      setUserState(UserState.NEW_USER)
    }
  }
  
  const handleGoogleAuth = () => {
    // Redirect to Directus Google OAuth endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/auth/login/google?redirect=${window.location.origin}/auth/callback`
  }
  
  const handleProfileClick = () => {
    router.push('/profile')
  }
  
  if (loading) {
    return <div className={styles.loading}>Loading...</div>
  }
  
  return (
    <div className={styles.loginPage} data-testid="login-page">
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome</h1>
        
        {userState === UserState.LOGGED_IN && user && (
          <div className={styles.loggedIn} data-testid="logged-in-state">
            <p className={styles.userName}>Hello, {user.email}!</p>
            <button
              className={styles.profileButton}
              onClick={handleProfileClick}
              data-testid="profile-button"
            >
              Go to Profile
            </button>
          </div>
        )}
        
        {userState === UserState.EXISTING_USER && (
          <div className={styles.existingUser} data-testid="existing-user-state">
            <p className={styles.userName}>{email}</p>
            <button
              className={styles.loginButton}
              onClick={handleGoogleAuth}
              data-testid="login-button"
            >
              <img
                src="/google-logo.svg"
                alt="Google"
                className={styles.googleIcon}
              />
              Login with Google
            </button>
          </div>
        )}
        
        {userState === UserState.NEW_USER && (
          <div className={styles.newUser} data-testid="new-user-state">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.emailInput}
              data-testid="email-input"
            />
            <button
              className={styles.registerButton}
              onClick={handleGoogleAuth}
              disabled={!email}
              data-testid="register-button"
            >
              <img
                src="/google-logo.svg"
                alt="Google"
                className={styles.googleIcon}
              />
              Register with Google
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginPage