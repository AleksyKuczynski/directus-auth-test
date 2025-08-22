// src/app/profile/page.tsx

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { UserState } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * User Profile Page
 * Shows user information and provides logout functionality
 * Only accessible when user is fully authenticated
 */
export default function ProfilePage() {
  const { combinedAuthState, userState, logoutFromDirectus } = useAuth();
  const router = useRouter();

  // Redirect if not fully authenticated
  useEffect(() => {
    if (userState !== UserState.LOADING && userState !== UserState.BROWSER_LOGGED_IN_DIRECTUS_LOGGED_IN) {
      router.push('/');
    }
  }, [userState, router]);

  const handleLogout = async () => {
    await logoutFromDirectus();
    router.push('/');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  // Show loading state
  if (userState === UserState.LOADING) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="loading-state">
            <h2>Loading Profile...</h2>
            <p>Please wait while we load your information.</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (userState !== UserState.BROWSER_LOGGED_IN_DIRECTUS_LOGGED_IN) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="access-denied">
            <h2>Access Denied</h2>
            <p>You need to be logged in to view this page.</p>
            <button onClick={handleBackToHome} className="btn-primary">
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const browserUser = combinedAuthState.browser?.userInfo;
  const directusUser = combinedAuthState.directus?.user;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>User Profile</h1>
        
        <div className="profile-content">
          {/* User Avatar and Basic Info */}
          <div className="profile-header">
            {browserUser?.imageUrl && (
              <img 
                src={browserUser.imageUrl} 
                alt="Profile Avatar"
                className="profile-avatar"
              />
            )}
            <div className="profile-basic-info">
              <h2>{browserUser?.name}</h2>
              <p className="email">{browserUser?.email}</p>
            </div>
          </div>

          {/* Account Information */}
          <div className="profile-details">
            <div className="info-section">
              <h3>Account Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Name:</label>
                  <span>{browserUser?.name}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{browserUser?.email}</span>
                </div>
                <div className="info-item">
                  <label>Account ID:</label>
                  <span>{directusUser?.id}</span>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span className="status-badge">{directusUser?.status}</span>
                </div>
                <div className="info-item">
                  <label>Member Since:</label>
                  <span>{directusUser?.created_at ? new Date(directusUser.created_at).toLocaleDateString() : 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
            <button onClick={handleBackToHome} className="btn-secondary">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}