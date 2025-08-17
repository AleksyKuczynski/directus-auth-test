'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function AuthCallback() {
  const searchParams = useSearchParams()

  useEffect(() => {
    // Log all parameters for debugging
    const params: any = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    
    console.log('Auth Callback Params:', params)
    
    // For now, just display what we received
    // Later we'll handle the token properly
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Authentication Callback</h2>
        <div className="space-y-2">
          {Array.from(searchParams.entries()).map(([key, value]) => (
            <div key={key} className="text-sm">
              <span className="font-semibold">{key}:</span> {value}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}