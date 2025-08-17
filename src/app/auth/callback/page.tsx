'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleAuthCallback } = useAuth()
  
  useEffect(() => {
    const handleCallback = async () => {
      // Get the authorization code from URL parameters
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      
      if (error) {
        console.error('OAuth error:', error);
        router.push('/login?error=oauth_error');
        return;
      }
      
      if (code) {
        try {
          // Handle the OAuth callback with the authorization code
          await handleAuthCallback(code);
          router.push('/profile');
        } catch (error) {
          console.error('Authentication failed:', error);
          router.push('/login?error=auth_failed');
        }
      } else {
        // No code parameter found
        console.error('No authorization code found');
        router.push('/login?error=no_code');
      }
    }
    
    handleCallback()
  }, [searchParams, handleAuthCallback, router])
  
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Authenticating...</p>
      </div>
    </div>
  )
}