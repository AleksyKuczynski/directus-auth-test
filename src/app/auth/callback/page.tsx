'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  
  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      
      if (token) {
        try {
          await login(token)
          router.push('/profile')
        } catch (error) {
          console.error('Authentication failed:', error)
          router.push('/login?error=auth_failed')
        }
      } else {
        router.push('/login?error=no_token')
      }
    }
    
    handleCallback()
  }, [searchParams, login, router])
  
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Authenticating...</p>
      </div>
    </div>
  )
}