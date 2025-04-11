import { NextResponse } from "next/server";
import { executeSalesforceQuery } from "@/lib/salesforce"; // If unused, consider removing this
import crypto from "crypto";
import axios from "axios";

// Custom error class
class RegistrationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "RegistrationError";
  }
}

// Validate reCAPTCHA token with Google
async function validateRecaptcha(token: string): Promise<boolean> {
  if (!process.env.RECAPTCHA_SECRET_KEY) return true;

  try {
    const { data } = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token,
        },
      }
    );
    return data.success;
  } catch (error) {
    console.error("reCAPTCHA validation error:", error);
    return false; // Fail silently, don’t block registration
  }
}

// Registration with Salesforce Headless
async function initiateSalesforceRegistration(userData: any) {
  const {
    firstName,
    lastName,
    email,
    password,
    jdeNumber,
    practiceName,
    practiceSpecialty,
    npiNumber,
    practiceType,
    recaptchaToken,
  } = userData;

  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const siteUrl = process.env.NEXT_PUBLIC_SALESFORCE_DOMAIN;
  if (!siteUrl) {
    throw new RegistrationError(
      "Salesforce site URL not configured",
      "CONFIG_ERROR",
      500
    );
  }

  const body = {
    userdata: {
      firstName,
      lastName,
      email,
      username: email.split("@")[0],
    },
    customdata: {
      mobilePhone: "+120d35408967",
      streetAddress: "12 N Lands End Rd",
      city: "Lantana",
      state: "Florida",
      zip: "20537",
      privacyPolicy: true,
    },
    password,
    verificationmethod: "email",
    recaptcha: recaptchaToken || null,
  };

  try {
    const response = await fetch(
      `${siteUrl}/Orapharma/services/auth/headless/init/registration`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie:
            "BrowserId=nqRygq15Ee-kRQvRUiomZQ; CookieConsentPolicy=0:1; LSKey-c$CookieConsentPolicy=0:1; oinfo=c3RhdHVzPURFTU8mdHlwZT02Jm9pZD0wMEREZjAwMDAwMFFTMHY=",
        },
        body: JSON.stringify(body),
      }
    );

    const responseBody = await response.json();

    return {
      success: responseBody.success,
      codeVerifier,
      codeChallenge,
    };
  } catch (error: any) {
    console.error("Salesforce registration error:", error);

    if (error.response) {
      throw new RegistrationError(
        error.response.data?.error || "Salesforce registration failed",
        "SF_REGISTRATION_ERROR",
        error.response.status
      );
    }

    throw new RegistrationError(
      "Failed to connect to Salesforce",
      "CONNECTION_ERROR",
      500
    );
  }
}

// POST handler
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      jdeNumber,
      practiceName,
      practiceSpecialty,
      npiNumber,
      practiceType,
      recaptchaToken,
    } = body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      throw new RegistrationError(
        "Missing required fields",
        "MISSING_FIELDS",
        400
      );
    }

    if (!email.includes("@")) {
      throw new RegistrationError("Invalid email format", "INVALID_EMAIL", 400);
    }

    // reCAPTCHA validation
    const isRecaptchaValid = await validateRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      throw new RegistrationError(
        "reCAPTCHA validation failed",
        "INVALID_RECAPTCHA",
        400
      );
    }

    const registrationResponse = await initiateSalesforceRegistration({
      firstName,
      lastName,
      email,
      password,
      jdeNumber,
      practiceName,
      practiceSpecialty,
      npiNumber,
      practiceType,
      recaptchaToken,
    });

    return NextResponse.json({
      status: "success",
      email: email,
      codeVerifier: registrationResponse.codeVerifier,
      codeChallenge: registrationResponse.codeChallenge,
    });
  } catch (error) {
    console.error("Registration initiation error:", error);

    const statusCode =
      error instanceof RegistrationError ? error.statusCode : 500;
    const message =
      error instanceof RegistrationError
        ? error.message
        : "Unexpected error occurred";

    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

// const myHeaders = new Headers();
// myHeaders.append("Content-Type", "application/json");
// myHeaders.append("Cookie", "BrowserId=nqRygq15Ee-kRQvRUiomZQ; CookieConsentPolicy=0:1; LSKey-c$CookieConsentPolicy=0:1; oinfo=c3RhdHVzPURFTU8mdHlwZT02Jm9pZD0wMEREZjAwMDAwMFFTMHY=");

// const raw = JSON.stringify({
//   "userdata": {
//     "firstName": "Ryan",
//     "lastName": "Smith",
//     "email": "ryan.s+ora938@pomegranate.co.uk",
//     "username": "ryan.s+ora938"
//   },
//   "customdata": {
//     "mobilePhone": "+120d35408967",
//     "streetAddress": "12 N Lands End Rd",
//     "city": "Lantana",
//     "state": "Florida",
//     "zip": "20537",
//     "privacyPolicy": true
//   },
//   "password": "Password123!",
//   "recaptcha": "03AFcWeA6GWwZiIg1Xtk1pyUQDokvUJnYe-UdBOk_5ivAGol3oZD2d2j03k7kX4OssBg4uLN00KjemQfhRYOfJIqLdK0zTg5bu8EhhHFEpU0q3felnQvYjqM2GrWPDRvR2w7ZrH1rhfuSihzX-M9xKbftIQcDHM2OeXM4BittpflBVkQt4NBLghZqzRq8lyF3WYBIALE_C5DEilIyLhudIYWV6VHvM3n8jAhMXV1bWxo_L51WUgWUpyrQgof",
//   "verificationmethod": "email"
// });

// const requestOptions = {
//   method: "POST",
//   headers: myHeaders,
//   body: raw,
//   redirect: "follow"
// };

// fetch("https://orapharma--orapharmad.sandbox.my.site.com/Orapharma/services/auth/headless/init/registration", requestOptions)
//   .then((response) => response.text())
//   .then((result) => console.log(result))
//   .catch((error) => console.error(error));
