'use client'

import { useState } from 'react'
import DirectusAuth from '@/services/DirectusAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [userExists, setUserExists] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(false)
  
  const auth = new DirectusAuth()

  const checkUser = async () => {
    if (!email) return
    
    setChecking(true)
    const exists = await auth.checkUserExists(email)
    setUserExists(exists)
    setChecking(false)
  }

  const handleGoogleAuth = () => {
    const redirectUrl = `${window.location.origin}/auth/callback`
    window.location.href = auth.getGoogleAuthUrl(redirectUrl)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-center mb-6">
            Test Google OAuth
          </h2>
          
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={checkUser}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            
            {checking && (
              <p className="text-sm text-gray-500">Checking...</p>
            )}
            
            {userExists !== null && !checking && (
              <p className="text-sm">
                {userExists 
                  ? '✅ User exists - Click Login' 
                  : '🆕 New user - Click Register'}
              </p>
            )}
            
            <button
              onClick={handleGoogleAuth}
              disabled={!email}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {userExists ? 'Login' : 'Register'} with Google
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-100 rounded text-xs">
            <p><strong>Directus URL:</strong> {process.env.NEXT_PUBLIC_DIRECTUS_URL}</p>
          </div>
        </div>
      </div>
    </div>
  )
}