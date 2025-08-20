// src/app/login/page.tsx

'use client';

import { useAuth } from '@/contexts/AuthContext';

/**
 * Login page for browser authentication testing
 * Demonstrates Google Identity Services integration
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
        <p>Testing Google browser login detection with Google Identity Services</p>

        <div className="auth-status">
          <h2>Authentication Status</h2>
          
          {loading && (
            <div className="status-loading">
              <p>🔄 Checking authentication...</p>
            </div>
          )}

          {!loading && !browserLoginState && (
            <div className="status-unknown">
              <p>⚠️ Authentication system initializing...</p>
            </div>
          )}

          {!loading && browserLoginState && browserLoginState.error && (
            <div className="status-error">
              <h3>⚠️ Configuration Issue</h3>
              <p className="error">{browserLoginState.error}</p>
              {browserLoginState.error.includes('Google Client ID') && (
                <div className="config-help">
                  <h4>Setup Instructions:</h4>
                  <ol>
                    <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
                    <li>Create or select a project</li>
                    <li>Enable Google Identity Services API</li>
                    <li>Go to "APIs & Services" → "Credentials"</li>
                    <li>Create "OAuth 2.0 Client ID" for Web Application</li>
                    <li>Add your domain to authorized origins</li>
                    <li>Copy the Client ID to your .env.local file</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {!loading && browserLoginState && !browserLoginState.error && !browserLoginState.isLoggedIn && (
            <div className="status-not-logged-in">
              <h3>🔐 Ready for Authentication</h3>
              <p>Google Identity Services is ready. Click below to test browser authentication.</p>
              <p><small>Note: Modern Google Identity Services requires user interaction to check authentication state.</small></p>
              <button onClick={handleTriggerLogin} className="btn-login">
                Sign In With Google
              </button>
            </div>
          )}

          {!loading && browserLoginState && browserLoginState.isLoggedIn && browserLoginState.userInfo && (
            <div className="status-logged-in">
              <h3>✅ Authentication Successful!</h3>
              <div className="user-info">
                {browserLoginState.userInfo.imageUrl && (
                  <img 
                    src={browserLoginState.userInfo.imageUrl} 
                    alt="User avatar"
                    className="user-avatar"
                  />
                )}
                <div className="user-details">
                  <p><strong>Name:</strong> {browserLoginState.userInfo.name}</p>
                  <p><strong>Email:</strong> {browserLoginState.userInfo.email}</p>
                  <p><strong>Google ID:</strong> {browserLoginState.userInfo.id}</p>
                </div>
              </div>
              <div className="actions">
                <button onClick={handleTriggerLogin} className="btn-login">
                  Sign In Again
                </button>
              </div>
              <div className="next-steps">
                <h4>Next Steps:</h4>
                <p>✓ Browser authentication working</p>
                <p>⏳ Directus integration (coming next)</p>
                <p>⏳ User profile page</p>
              </div>
            </div>
          )}

          {!loading && browserLoginState && browserLoginState.isLoggedIn && !browserLoginState.userInfo && (
            <div className="status-partial">
              <h3>🔍 Partial Authentication</h3>
              <p>Google session detected but profile data requires consent.</p>
              <button onClick={handleTriggerLogin} className="btn-login">
                Get Profile Information
              </button>
            </div>
          )}
        </div>

        <div className="debug-info">
          <h3>Debug Information</h3>
          <pre>{JSON.stringify(browserLoginState, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}