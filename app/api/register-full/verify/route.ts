// app/api/register/verify/route.ts

import { NextResponse } from "next/server";
import axios from "axios";

// Declare global namespace to allow for codeVerifier and registrationData
declare global {
  var codeVerifier: string;
  var registrationData: {
    identifier: string;
    email: string;
    codeChallenge: string;
  };
}

// Custom error class for better error handling
class VerificationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "VerificationError";
  }
}

// Get stored registration data from global/session
function getStoredRegistrationData(requestId: string) {
  // In a real implementation, this would come from a secure session or database
  // This is simplified for demonstration purposes
  if (
    !global.registrationData ||
    global.registrationData.identifier !== requestId
  ) {
    throw new VerificationError(
      "Invalid or expired registration session",
      "INVALID_SESSION",
      400
    );
  }

  return global.registrationData;
}

async function verifyOtpAndAuthorize(
  otp: string,
  requestId: string,
  email: string
) {
  try {
    // Get stored data including code verifier
    const registrationData = getStoredRegistrationData(requestId);
    const { codeChallenge } = registrationData;

    if (!codeChallenge) {
      throw new VerificationError(
        "Missing PKCE code challenge",
        "MISSING_CODE_CHALLENGE",
        500
      );
    }

    // Experience Cloud site URL from env vars
    const siteUrl = process.env.SALESFORCE_EXPERIENCE_SITE_URL;
    if (!siteUrl) {
      throw new VerificationError(
        "Salesforce site URL not configured",
        "CONFIG_ERROR",
        500
      );
    }

    // Create Base64 encoded credential for Authorization header
    const credentials = Buffer.from(`${requestId}:${otp}`).toString("base64");

    // Step 1: Request authorization code
    const authResponse = await axios
      .post(
        `${siteUrl}/services/oauth2/authorize`,
        new URLSearchParams({
          response_type: "code_credentials",
          client_id: process.env.SALESFORCE_CLIENT_ID || "",
          redirect_uri: `${siteUrl}/services/oauth2/echo`,
          code_challenge: codeChallenge,
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Auth-Request-Type": "user-registration",
            "Auth-Verification-Type": "email",
            Authorization: `Basic ${credentials}`,
          },
          maxRedirects: 0,
          validateStatus: (status) => status === 302, // We expect a redirect
        }
      )
      .catch((error) => {
        // For redirects, axios throws an error but we need to get the Location header
        if (error.response && error.response.status === 302) {
          return error.response;
        }
        throw error;
      });

    if (!authResponse || !authResponse.headers.location) {
      throw new VerificationError(
        "Failed to get authorization code",
        "AUTH_CODE_FAILED",
        500
      );
    }

    // Parse the redirect URL to get the authorization code
    const redirectUrl = new URL(authResponse.headers.location);
    const code = redirectUrl.searchParams.get("code");

    if (!code) {
      throw new VerificationError(
        "No authorization code received",
        "NO_AUTH_CODE",
        500
      );
    }

    // Store the code verifier from initial PKCE generation
    const codeVerifier = global.codeVerifier;

    if (!codeVerifier) {
      throw new VerificationError(
        "Missing PKCE code verifier",
        "MISSING_CODE_VERIFIER",
        500
      );
    }

    // Step 2: Exchange authorization code for access token
    const tokenResponse = await axios.post(
      `${siteUrl}/services/oauth2/token`,
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.SALESFORCE_CLIENT_ID || "",
        redirect_uri: `${siteUrl}/services/oauth2/echo`,
        code: code,
        code_verifier: codeVerifier,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Clean up stored registration data
    // delete global.registrationData;
    // delete global.codeVerifier;

    return {
      success: true,
      userId: tokenResponse.data.id.split("/").pop(),
      accessToken: tokenResponse.data.access_token,
      instanceUrl: tokenResponse.data.instance_url,
      communityId: tokenResponse.data.sfdc_community_id,
      communityUrl: tokenResponse.data.sfdc_community_url,
    };
  } catch (error: any) {
    console.error("OTP verification error:", error);

    if (error instanceof VerificationError) {
      throw error;
    }

    if (error.response) {
      throw new VerificationError(
        error.response.data?.error_description ||
          error.response.data?.error ||
          "Failed to verify OTP",
        "OTP_VERIFICATION_FAILED",
        error.response.status || 500
      );
    }

    throw new VerificationError(
      "Failed to connect to Salesforce",
      "CONNECTION_ERROR",
      500
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { otp, requestId, email } = body;

    // Basic validation
    if (!otp || !requestId) {
      throw new VerificationError(
        "Missing required verification parameters",
        "MISSING_PARAMETERS",
        400
      );
    }

    // Verify OTP and complete authorization
    const verificationResult = await verifyOtpAndAuthorize(
      otp,
      requestId,
      email
    );

    return NextResponse.json(verificationResult);
  } catch (error) {
    console.error("Verification error:", error);

    if (error instanceof VerificationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during verification" },
      { status: 500 }
    );
  }
}
