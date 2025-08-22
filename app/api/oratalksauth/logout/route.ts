import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log(body)
    const response = NextResponse.json({ 
        success: true, 
        message: 'Logged out successfully' 
      })
      
      // Clear authentication cookie
       response.cookies.delete('auth-token')
      return response   
  } catch (error) {
    return NextResponse.json({ error: 'Logout failed' }, { status: 400 })
  }
}