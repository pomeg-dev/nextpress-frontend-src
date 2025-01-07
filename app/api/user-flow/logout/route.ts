import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const response = NextResponse.json({ message: 'Cookies deleted' });

  request.cookies.getAll().forEach(({ name: cookieName }) => {
    if (cookieName.startsWith('wordpress_')) {
      response.cookies.set(cookieName, '', {
        path: '/',
        expires: new Date(0),
        httpOnly: true,
        secure: true,
      });
    }
  });

  return response;
}