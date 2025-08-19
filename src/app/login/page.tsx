// src/app/login/page.tsx

'use client';

import { useAuth } from '@/contexts/AuthContext';

/**
 * Simplified login page focused only on browser authentication detection
 * Shows different states based on browser login status
 */
export default function LoginPage() {
  const { browserLoginState, loading, checkBrowserAuth, triggerLogin } = useAuth();

  const handleCheckBrowserAuth = async () => {
    await checkBrowserAuth();
  };

  const handleTriggerLogin = async () => {
    await triggerLogin();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Browser Authentication Test</h1>
        <p>Testing Google browser login detection</p>

        <div className="auth-status">
          <h2>Current Status:</h2>
          
          {loading && (
            <div className="status-loading">
              <p>🔄 Checking browser authentication...</p>
            </div>
          )}

          {!loading && !browserLoginState && (
            <div className="status-unknown">
              <p>❓ Authentication status unknown</p>
              <button onClick={handleCheckBrowserAuth} className="btn-check">
                Check Browser Login State
              </button>
            </div>
          )}

          {!loading && browserLoginState && !browserLoginState.isLoggedIn && (
            <div className="status-not-logged-in">
              <h3>❌ User is NOT logged into browser</h3>
              <p>No Google account detected in browser session</p>
              {browserLoginState.error && (
                <p className="error">Error: {browserLoginState.error}</p>
              )}
              <div className="actions">
                <button onClick={handleCheckBrowserAuth} className="btn-check">
                  Re-check
                </button>
                <button onClick={handleTriggerLogin} className="btn-login">
                  Login to Browser
                </button>
              </div>
            </div>
          )}

          {!loading && browserLoginState && browserLoginState.isLoggedIn && browserLoginState.userInfo && (
            <div className="status-logged-in">
              <h3>✅ User IS logged into browser</h3>
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
              <button onClick={handleCheckBrowserAuth} className="btn-check">
                Re-check Status
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