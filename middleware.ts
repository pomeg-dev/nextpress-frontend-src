import {NextRequest, NextResponse} from 'next/server'

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const jwtToken = request.cookies.get('jwt_token');
  if (jwtToken) requestHeaders.set('jwt_token', jwtToken.value);
  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
  if (jwtToken) {
    response.cookies.set("jwt_token", jwtToken.value, {
      httpOnly: true,
      secure: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return response;
}