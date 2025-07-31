// api/login-simple/route.ts

import { NextResponse } from "next/server";
import { executeSalesforceQuery } from "@/lib/salesforce";
import { getMysqlDataApi } from "@themes/elite-dashboard/blocks/elite-tool/data";
import { slugify } from "@/utils/slugify";
import { SignJWT } from "jose";
import { v4 as uuidv4 } from "uuid";

// Custom error class for better error handling
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

interface JDERecord {
  cust_name: string;
  aban8: string;
  [key: string]: any;
}

async function validateInput(email: string, jdeNumber: string) {
  if (!email || !email.includes("@")) {
    throw new RegistrationError("Invalid email format", "INVALID_EMAIL", 400);
  }
  if (!jdeNumber || jdeNumber.trim().length === 0) {
    throw new RegistrationError("JDE number is required", "INVALID_JDE", 400);
  }
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/['"\\\n\r]/g, "");
}

async function getJDERecord(jdeNumber: string): Promise<JDERecord> {
  const record = await getMysqlDataApi(
    `SELECT * FROM customers WHERE aban8 = ${jdeNumber}`
  );

  console.log("JDE record:", record);

  if (!record || record.length === 0) {
    throw new RegistrationError(
      "JDE record not found. Please verify your JDE number.",
      "JDE_RECORD_NOT_FOUND",
      404
    );
  }

  return record[0];
}

// Generate a secure JWT token for passwordless authentication
async function generateToken(userData: any) {
  const SECRET_KEY = new TextEncoder().encode(
    process.env.NEXT_PUBLIC_JWT_SECRET_KEY ||
      "your-very-secure-and-randomly-generated-secret-key"
  );

  const token = await new SignJWT({
    ...userData,
    sub: userData.userId || uuidv4(),
    JDE_Account_ID__c: userData.jdeAccountId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h") // Token valid for 24 hours
    .sign(SECRET_KEY);

  return token;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, jdeNumber } = body;

    // Input validation
    await validateInput(email, jdeNumber);

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedJdeNumber = sanitizeInput(jdeNumber);

    // Get JDE record to verify it exists in the system
    const jdeRecord = await getJDERecord(sanitizedJdeNumber);
    const firstName = jdeRecord.cust_name || "Customer";

    // Default last name if we need to create a contact
    const lastName = "Customer";

    // Check all the user flow scenarios
    const result = await executeSalesforceQuery(async (conn) => {
      // 1. First, check if account exists
      const accountQuery = await conn.query(`
        SELECT Id, Name 
        FROM Account
        WHERE JDE_Account_ID__c = '${sanitizedJdeNumber}'
      `);

      let accountId;

      // If account doesn't exist, create one
      if (accountQuery.totalSize === 0) {
        console.log("No account found, creating a new one");

        // Create a new account
        const accountResult = await conn.sobject("Account").create({
          Name: jdeRecord.cust_name,
          JDE_Account_ID__c: sanitizedJdeNumber,
          // Add other required Account fields here
        });

        if (!accountResult.success) {
          throw new RegistrationError(
            "Failed to create account. Please try again.",
            "ACCOUNT_CREATION_FAILED",
            500
          );
        }

        accountId = accountResult.id;
      } else {
        accountId = accountQuery.records[0].Id;
      }

      // 2. Check if user exists by email
      const userQuery = await conn.query(`
        SELECT Id, Username, Email, ContactId, IsActive, Profile.Name
        FROM User
        WHERE Email = '${sanitizedEmail}'
        AND IsActive = true
      `);

      // If user exists, generate token for passwordless login
      if (userQuery.totalSize > 0) {
        console.log("User found, proceeding with login");

        const userData = {
          userId: userQuery.records[0].Id,
          email: sanitizedEmail,
          firstName: userQuery.records[0]?.FirstName || firstName,
          lastName: userQuery.records[0]?.LastName || lastName,
          jdeAccountId: sanitizedJdeNumber,
        };

        // Generate JWT token for next-auth
        const token = await generateToken(userData);

        // Return token for login
        return {
          success: true,
          message: "User exists. Proceed with login.",
          token,
          accountId,
          isNewUser: false,
        };
      }

      // 3. No user exists, check if contact exists
      const contactQuery = await conn.query(`
        SELECT Id, FirstName, LastName, Email
        FROM Contact
        WHERE Email = '${sanitizedEmail}'
        AND AccountId = '${accountId}'
      `);

      let contactId;

      // If contact doesn't exist, create one
      if (contactQuery.totalSize === 0) {
        console.log("Contact not found, creating a new one");

        // Create Contact
        const contactResult = await conn.sobject("Contact").create({
          FirstName: firstName,
          LastName: lastName,
          Email: sanitizedEmail,
          AccountId: accountId,
        });

        if (!contactResult.success) {
          throw new RegistrationError(
            "Failed to create contact. Please try again.",
            "CONTACT_CREATION_FAILED",
            500
          );
        }

        contactId = contactResult.id;
      } else {
        contactId = contactQuery.records[0].Id;
      }

      // 4. Create User
      console.log("Creating new user");

      // Generate unique community nickname
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 6);
      const uniqueNickname = `${slugify(firstName).substring(
        0,
        3
      )}_${timestamp}_${randomStr}`;

      const userObject = {
        Username: sanitizedEmail,
        Email: sanitizedEmail,
        FirstName: firstName,
        LastName: lastName,
        Alias: `${slugify(firstName).substring(0, 3)}_${slugify(
          randomStr
        ).substring(0, 4)}`,
        ContactId: contactId,
        ProfileId: process.env.SALESFORCE_B2B_PROFILE_ID,
        UserRoleId: null,
        IsActive: true,
        Ecomm_Category__c: "EC2",
        TimeZoneSidKey: "America/Los_Angeles",
        LocaleSidKey: "en_US",
        EmailEncodingKey: "UTF-8",
        LanguageLocaleKey: "en_US",
        FederationIdentifier: sanitizedEmail,
        CommunityNickname: uniqueNickname,
      };

      // Create B2B Commerce User
      const userResult = await conn.sobject("User").create(userObject);

      if (!userResult.success) {
        throw new RegistrationError(
          "Failed to create user. Please try again.",
          "USER_CREATION_FAILED",
          500
        );
      }

      // For new users, we still need to set a secure random password
      // even though we won't be using it directly
      try {
        const secureRandomPassword =
          uuidv4() + Math.random().toString(36).substring(2, 10);
        await conn.soap.setPassword(
          userResult.id as string,
          secureRandomPassword
        );
      } catch (error) {
        // Rollback user creation
        await conn.sobject("User").delete(userResult.id);
        throw new RegistrationError(
          "Failed to set up user account. Please try again.",
          "USER_SETUP_FAILED",
          500
        );
      }

      const userData = {
        userId: userResult.id,
        email: sanitizedEmail,
        firstName,
        lastName,
        jdeAccountId: sanitizedJdeNumber,
      };

      // Generate JWT token for next-auth
      const token = await generateToken(userData);

      return {
        success: true,
        message: "User created successfully. Proceed with login.",
        token,
        userId: userResult.id,
        accountId,
        contactId,
        isNewUser: true,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Registration/Login error:", error);

    if (error instanceof RegistrationError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    // Handle any unexpected errors
    return NextResponse.json(
      {
        error:
          "An unexpected error occurred. Please try again or contact support.",
      },
      { status: 500 }
    );
  }
}
