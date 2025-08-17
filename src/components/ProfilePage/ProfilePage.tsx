import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import styles from './ProfilePage.module.scss';

export const ProfilePage: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1>Access Denied</h1>
          <p>Please log in to view your profile.</p>
          <button onClick={handleBackToLogin} className={styles.primaryButton}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.userInfo}>
            {user.avatar && (
              <Image
                src={user.avatar}
                alt="User Avatar"
                width={120}
                height={120}
                className={styles.avatar}
              />
            )}
            <div className={styles.userDetails}>
              <h1>{user.first_name} {user.last_name}</h1>
              <p className={styles.email}>{user.email}</p>
              <p className={styles.userId}>ID: {user.id}</p>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h2>Account Information</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>First Name</label>
                <span>{user.first_name || 'Not provided'}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Last Name</label>
                <span>{user.last_name || 'Not provided'}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Email</label>
                <span>{user.email}</span>
              </div>
              <div className={styles.infoItem}>
                <label>Provider</label>
                <span>{user.provider || 'Unknown'}</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>Additional Information</h2>
            <div className={styles.additionalInfo}>
              <p>
                Your account was created using Google authentication. 
                You can manage your account settings through your Google account.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            onClick={handleBackToLogin}
            className={styles.secondaryButton}
          >
            Back to Login
          </button>
          <button 
            onClick={handleLogout}
            className={styles.dangerButton}
            disabled={loading}
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
};