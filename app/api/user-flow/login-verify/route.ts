import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.NEXT_JWT_AUTH_SECRET_KEY;

const verifyJWT = (token: string) => {
  if (!SECRET_KEY) {
    throw new Error("Secret key is not defined");
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (error) {
    return null;
  }
};

export async function POST(request: NextRequest) {
  const token = request.cookies.get('jwt_token')?.value || request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'No token provided' },
      { status: 401 }
    );
  }

  const decoded = verifyJWT(token);
  if (decoded && typeof decoded !== 'string' && 'user_id' in decoded) {
    return NextResponse.json(
      {
        success: true, 
        userId: decoded.user_id, 
        blogUrl: decoded.iss, 
        blogId: decoded.blog_id,
        isAdmin: decoded.is_admin,
      },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { success: false, message: 'Invalid token' },
      { status: 401 }
    );
  }
}
