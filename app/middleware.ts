import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = "your-very-secure-and-randomly-generated-secret-key";

export function middleware(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  // Log if no token is found in the request
  if (!token) {
    console.log("No token found in the request URL.");
    return NextResponse.redirect("https://oraportal.com/login");
  }

  try {
    // Log token before verification
    console.log("Received token:", token);

    // Verify the token
    const decoded = jwt.verify(token, SECRET_KEY);

    // Log the decoded token to inspect its contents
    console.log("Decoded token:", decoded);

    // // Check group membership
    // if (decoded.group !== "Elite Access Group") {
    //   console.log(
    //     "User is not in the 'Elite Access Group'. Redirecting to no-access page."
    //   );
    //   return NextResponse.redirect("https://oraportal.com/no-access");
    // }

    // Log success when the user is allowed access
    console.log(
      "User is in the 'Elite Access Group'. Allowing access to elite.oraportal.com."
    );

    // Allow access to elite.oraportal.com
    return NextResponse.next();
  } catch (err) {
    // Log the error message when verification fails
    console.error("Invalid token:", err.message);
    return NextResponse.redirect("https://oraportal.com/login");
  }
}
