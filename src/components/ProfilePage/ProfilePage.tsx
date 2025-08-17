'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import styles from './ProfilePage.module.scss'

const ProfilePage: React.FC = () => {
  const router = useRouter()
  const { user, logout } = useAuth()
  
  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }
  
  if (!user) {
    router.push('/login')
    return null
  }
  
  return (
    <div className={styles.profilePage} data-testid="profile-page">
      <div className={styles.container}>
        <h1 className={styles.title}>Profile</h1>
        
        <div className={styles.userInfo}>
          {user.avatar && (
            <img
              src={user.avatar}
              alt="Avatar"
              className={styles.avatar}
            />
          )}
          
          <div className={styles.details}>
            <p className={styles.name} data-testid="user-name">
              {user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.email}
            </p>
            <p className={styles.email}>{user.email}</p>
          </div>
        </div>
        
        <button
          className={styles.logoutButton}
          onClick={handleLogout}
          data-testid="logout-button"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default ProfilePage