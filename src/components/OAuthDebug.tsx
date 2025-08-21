// src/components/OAuthDebug.tsx
'use client';

import { useState } from 'react';

/**
 * Debug component to help troubleshoot OAuth configuration
 */
export function OAuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const collectDebugInfo = () => {
    const info = {
      currentOrigin: window.location.origin,
      currentURL: window.location.href,
      userAgent: navigator.userAgent,
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      timestamp: new Date().toISOString(),
      googleScriptLoaded: !!(window as any).google,
      googleAccountsAvailable: !!((window as any).google?.accounts),
    };
    setDebugInfo(info);
  };

  return (
    <div style={{ 
      margin: '2rem 0', 
      padding: '1rem', 
      backgroundColor: '#f8f9fa', 
      borderRadius: '8px',
      border: '1px solid #e9ecef' 
    }}>
      <h4 style={{ margin: '0 0 1rem 0', color: '#495057' }}>OAuth Debug Information</h4>
      
      <button 
        onClick={collectDebugInfo}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '1rem'
        }}
      >
        Collect Debug Info
      </button>

      {debugInfo && (
        <div>
          <h5>Configuration Check:</h5>
          <div style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>
            <p><strong>Current Origin:</strong> {debugInfo.currentOrigin}</p>
            <p><strong>Client ID Configured:</strong> {debugInfo.clientId ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Client ID:</strong> {debugInfo.clientId || 'Not set'}</p>
            <p><strong>Google Script Loaded:</strong> {debugInfo.googleScriptLoaded ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Google Accounts API:</strong> {debugInfo.googleAccountsAvailable ? '✅ Available' : '❌ Not Available'}</p>
          </div>

          <h5 style={{ marginTop: '1rem' }}>Instructions:</h5>
          <div style={{ fontSize: '0.9rem' }}>
            <p>1. Copy this origin: <code>{debugInfo.currentOrigin}</code></p>
            <p>2. Add it to Google Cloud Console → OAuth 2.0 Client → "Authorized JavaScript origins"</p>
            <p>3. Wait 5-10 minutes for Google's cache to update</p>
            <p>4. Clear browser cache and try again</p>
          </div>

          <details style={{ marginTop: '1rem' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Full Debug Data</summary>
            <pre style={{ 
              backgroundColor: '#ffffff', 
              padding: '1rem', 
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '0.8rem',
              marginTop: '0.5rem'
            }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}