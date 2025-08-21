// src/app/login/page.tsx

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { OAuthDebug } from '@/components/OAuthDebug';
import { UserState } from '@/types/auth';
import { useRouter } from 'next/navigation';

/**
 * Login page implementing all 5 user authentication states:
 * 1. User not logged into browser
 * 2. User logged into browser + Directus states:
 *    - 3. Exists in Directus and logged in
 *    - 4. Exists in Directus but not logged in  
 *    - 5. Does not exist in Directus
 */
export default function LoginPage() {
  const { 
    combinedAuthState, 
    userState, 
    triggerLogin, 
    registerUserInDirectus, 
    loginToDirectus 
  } = useAuth();
  
  const router = useRouter();

  // Event handlers for different actions
  const handleBrowserLogin = async () => {
    await triggerLogin();
  };

  const handleDirectusLogin = async () => {
    await loginToDirectus();
  };

  const handleDirectusRegister = async () => {
    await registerUserInDirectus();
  };

  const handleGoToProfile = () => {
    router.push('/profile');
  };

  // Render content based on user state
  const renderAuthStatus = () => {
    switch (userState) {
      case UserState.LOADING:
        return (
          <div className="status-loading">
            <p>🔄 Checking authentication state...</p>
          </div>
        );

      case UserState.ERROR:
        return (
          <div className="status-error">
            <h3>⚠️ Authentication Error</h3>
            <p className="error">
              {combinedAuthState.error || 
               combinedAuthState.browser?.error || 
               combinedAuthState.directus?.error || 
               'Unknown authentication error'}
            </p>
            <button onClick={handleBrowserLogin} className="btn-login">
              Try Again
            </button>
          </div>
        );

      case UserState.BROWSER_NOT_LOGGED_IN:
        return (
          <div className="status-not-logged-in">
            <h3>🔐 Case 1: Browser Authentication Required</h3>
            <p>You need to sign in with your Google account to continue.</p>
            <button onClick={handleBrowserLogin} className="btn-login">
              Login
            </button>
          </div>
        );

      case UserState.BROWSER_LOGGED_IN_DIRECTUS_LOGGED_IN:
        return (
          <div className="status-logged-in">
            <h3>✅ Case 3: Fully Authenticated</h3>
            <p>Welcome back, {combinedAuthState.browser?.userInfo?.name}!</p>
            <div className="user-info">
              {combinedAuthState.browser?.userInfo?.imageUrl && (
                <img 
                  src={combinedAuthState.browser.userInfo.imageUrl} 
                  alt="User avatar"
                  className="user-avatar"
                />
              )}
              <div className="user-details">
                <p><strong>Name:</strong> {combinedAuthState.browser?.userInfo?.name}</p>
                <p><strong>Email:</strong> {combinedAuthState.browser?.userInfo?.email}</p>
                <p><strong>Directus ID:</strong> {combinedAuthState.directus?.user?.id}</p>
              </div>
            </div>
            <button onClick={handleGoToProfile} className="btn-profile">
              Profile
            </button>
          </div>
        );

      case UserState.BROWSER_LOGGED_IN_DIRECTUS_EXISTS_NOT_LOGGED:
        return (
          <div className="status-partial">
            <h3>🔍 Case 4: Directus Login Required</h3>
            <p>Hello {combinedAuthState.browser?.userInfo?.name}, you have an account but need to log in to Directus.</p>
            <div className="user-info">
              {combinedAuthState.browser?.userInfo?.imageUrl && (
                <img 
                  src={combinedAuthState.browser.userInfo.imageUrl} 
                  alt="User avatar"
                  className="user-avatar"
                />
              )}
              <div className="user-details">
                <p><strong>Google Name:</strong> {combinedAuthState.browser?.userInfo?.name}</p>
                <p><strong>Google Email:</strong> {combinedAuthState.browser?.userInfo?.email}</p>
                <p><strong>Account Status:</strong> Registered but not logged in</p>
              </div>
            </div>
            <button onClick={handleDirectusLogin} className="btn-login">
              Login
            </button>
          </div>
        );

      case UserState.BROWSER_LOGGED_IN_DIRECTUS_NOT_EXISTS:
        return (
          <div className="status-not-registered">
            <h3>👋 Case 5: Registration Required</h3>
            <p>Hello {combinedAuthState.browser?.userInfo?.name}, welcome! You need to create an account in our system.</p>
            <div className="user-info">
              {combinedAuthState.browser?.userInfo?.imageUrl && (
                <img 
                  src={combinedAuthState.browser.userInfo.imageUrl} 
                  alt="User avatar"
                  className="user-avatar"
                />
              )}
              <div className="user-details">
                <p><strong>Google Name:</strong> {combinedAuthState.browser?.userInfo?.name}</p>
                <p><strong>Google Email:</strong> {combinedAuthState.browser?.userInfo?.email}</p>
                <p><strong>Account Status:</strong> Not registered</p>
              </div>
            </div>
            <button onClick={handleDirectusRegister} className="btn-register">
              Register
            </button>
          </div>
        );

      default:
        return (
          <div className="status-unknown">
            <p>⚠️ Unknown authentication state</p>
          </div>
        );
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Authentication Test</h1>
        <p>Testing complete authentication flow: Google + Directus integration</p>

        {/* Debug component for troubleshooting */}
        <OAuthDebug />

        <div className="auth-status">
          <h2>Authentication Status</h2>
          {renderAuthStatus()}
        </div>

        {/* State explanation */}
        <div className="state-explanation">
          <h3>Current State: {userState}</h3>
          <div className="state-details">
            <h4>Browser State:</h4>
            <p>Logged in: {combinedAuthState.browser?.isLoggedIn ? '✅ Yes' : '❌ No'}</p>
            {combinedAuthState.browser?.userInfo && (
              <p>User: {combinedAuthState.browser.userInfo.name}</p>
            )}
            
            <h4>Directus State:</h4>
            <p>Registered: {combinedAuthState.directus?.isRegistered ? '✅ Yes' : '❌ No'}</p>
            <p>Logged in: {combinedAuthState.directus?.isLoggedIn ? '✅ Yes' : '❌ No'}</p>
            {combinedAuthState.directus?.user && (
              <p>User ID: {combinedAuthState.directus.user.id}</p>
            )}
          </div>
        </div>

        <div className="debug-info">
          <h3>Debug Information</h3>
          <pre>{JSON.stringify(combinedAuthState, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}