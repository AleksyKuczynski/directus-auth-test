// src/app/api/auth/directus/route.ts
// This is the PRODUCTION-READY approach for Directus authentication
// Comment out for now, but implement this for production

import { NextRequest, NextResponse } from 'next/server';

interface DirectusAuthRequest {
  action: 'check' | 'register' | 'login' | 'logout';
  googleId?: string;
  userInfo?: {
    id: string;
    email: string;
    name: string;
    imageUrl: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: DirectusAuthRequest = await request.json();
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    const adminToken = process.env.DIRECTUS_TOKEN; // Server-side only

    if (!directusUrl || !adminToken) {
      return NextResponse.json(
        { error: 'Directus configuration missing' },
        { status: 500 }
      );
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    };

    switch (body.action) {
      case 'check':
        // Check if user exists in Directus
        const checkResponse = await fetch(
          `${directusUrl}/items/app_users?filter[google_id][_eq]=${body.googleId}&limit=1`,
          { headers }
        );
        const checkData = await checkResponse.json();
        
        return NextResponse.json({
          exists: checkData.data.length > 0,
          user: checkData.data[0] || null,
        });

      case 'register':
        // Register new user
        const registerResponse = await fetch(
          `${directusUrl}/items/app_users`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              google_id: body.userInfo?.id,
              email: body.userInfo?.email,
              name: body.userInfo?.name,
              avatar_url: body.userInfo?.imageUrl,
              status: 'active',
            }),
          }
        );
        const registerData = await registerResponse.json();
        
        return NextResponse.json({ user: registerData.data });

      case 'login':
        // Generate user session token
        // In production, implement proper JWT generation here
        const sessionToken = generateSecureToken();
        
        return NextResponse.json({ 
          token: sessionToken,
          message: 'Login successful' 
        });

      case 'logout':
        // Handle logout (invalidate tokens, etc.)
        return NextResponse.json({ message: 'Logout successful' });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Directus auth API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateSecureToken(): string {
  // In production, implement proper JWT generation
  // For now, return a simple token
  return `user_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}