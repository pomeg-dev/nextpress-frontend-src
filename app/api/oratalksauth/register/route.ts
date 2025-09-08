import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email } = body
  
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }
      // Create response with cookie
      const response = NextResponse.json({ 
        success: true, 
        message: 'Registered successfully' 
      })

      // Generate JWT token
      const token = jwt.sign(
        { 
          email: email,
          userId: email, // Get from your user database
          role: 'user',           // User role/permissions
          iat: Math.floor(Date.now() / 1000), // Issued at
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30) // Expires in 30 days
        },
        JWT_SECRET || 'your-secret-key'
      )

      // Set authentication cookie
    response.cookies.set('auth-token', token, {
        sameSite: 'strict',    // CSRF protection
        maxAge: 60 * 60 * 24 * 30, // 7 days
        path: '/',             // Cookie available across site
      })

      return response
  
}