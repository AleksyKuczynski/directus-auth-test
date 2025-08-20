// src/app/login/page.tsx

'use client';

import { useAuth } from '@/contexts/AuthContext';

/**
 * Simplified login page focused only on browser authentication detection
 * Shows different states based on browser login status
 */
export default function LoginPage() {
  const { browserLoginState, loading, triggerLogin } = useAuth();

  const handleTriggerLogin = async () => {
    await triggerLogin();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Browser Authentication Test</h1>
        <p>Testing Google browser login detection</p>

        <div className="auth-status">
          <h2>Browser Authentication Test</h2>
          <p>Using modern Google Identity Services</p>
          
          {loading && (
            <div className="status-loading">
              <p>🔄 Processing authentication...</p>
            </div>
          )}

          {!loading && !browserLoginState && (
            <div className="status-unknown">
              <p>❓ Ready to test browser authentication</p>
              <p>Note: Modern Google Identity Services requires user interaction to check authentication state.</p>
              <button onClick={handleTriggerLogin} className="btn-login">
                Sign In With Google
              </button>
            </div>
          )}

          {!loading && browserLoginState && !browserLoginState.isLoggedIn && (
            <div className="status-not-logged-in">
              <h3>❌ Authentication not completed</h3>
              <p>No Google authentication detected or user cancelled</p>
              {browserLoginState.error && (
                <p className="error">Error: {browserLoginState.error}</p>
              )}
              <div className="actions">
                <button onClick={handleTriggerLogin} className="btn-login">
                  Try Sign In With Google
                </button>
              </div>
            </div>
          )}

          {!loading && browserLoginState && browserLoginState.isLoggedIn && browserLoginState.userInfo && (
            <div className="status-logged-in">
              <h3>✅ Successfully authenticated with Google!</h3>
              <div className="user-info">
                <img 
                  src={browserLoginState.userInfo.imageUrl} 
                  alt="User avatar"
                  className="user-avatar"
                />
                <div className="user-details">
                  <p><strong>Name:</strong> {browserLoginState.userInfo.name}</p>
                  <p><strong>Email:</strong> {browserLoginState.userInfo.email}</p>
                  <p><strong>ID:</strong> {browserLoginState.userInfo.id}</p>
                </div>
              </div>
              <div className="actions">
                <button onClick={handleTriggerLogin} className="btn-login">
                  Sign In Again
                </button>
              </div>
            </div>
          )}

          {!loading && browserLoginState && browserLoginState.isLoggedIn && !browserLoginState.userInfo && (
            <div className="status-logged-in">
              <h3>🔍 Google session detected</h3>
              <p>User has a Google session but profile data requires consent.</p>
              <button onClick={handleTriggerLogin} className="btn-login">
                Get Profile Information
              </button>
            </div>
          )}
        </div>

        <div className="debug-info">
          <h3>Debug Information:</h3>
          <pre>{JSON.stringify(browserLoginState, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}