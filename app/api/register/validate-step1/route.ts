import { NextResponse } from "next/server";
import {
  getSalesforceConnection,
  resetConnection,
  SalesforceConnectionError,
} from "@/lib/salesforce";

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

async function validateInput(email: string, jdeNumber: string) {
  if (!email || !email.includes("@")) {
    throw new Error("Invalid email format");
  }
  if (!jdeNumber || jdeNumber.trim().length === 0) {
    throw new Error("JDE number is required");
  }
}

async function executeWithRetry(
  operation: () => Promise<any>,
  retries = MAX_RETRIES
): Promise<any> {
  try {
    return await operation();
  } catch (error: any) {
    if (
      retries > 0 &&
      (error.name === "INVALID_SESSION_ID" || error.name === "INVALID_GRANT")
    ) {
      console.log(`Retrying operation. Attempts remaining: ${retries}`);
      resetConnection();
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return executeWithRetry(operation, retries - 1);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, jdeNumber } = body;

    // Validate input
    await validateInput(email, jdeNumber);

    // Sanitize inputs for SOQL
    const sanitizedEmail = email.replace(/['"\\\n\r]/g, "");
    const sanitizedJdeNumber = jdeNumber.replace(/['"\\\n\r]/g, "");

    // Wrap Salesforce operations in retry logic
    const result = await executeWithRetry(async () => {
      const conn = await getSalesforceConnection();

      // Look up Account with prepared statement pattern
      const accounts = await conn.query(`
        SELECT Id, Name 
        FROM Account
        WHERE JDE_Account_ID__c = '${sanitizedJdeNumber}'
      `);

      if (accounts.totalSize === 0) {
        throw new Error("ACCOUNT_NOT_FOUND");
      }

      const accountId = accounts.records[0].Id;

      // Check for existing user with prepared statement pattern
      const existingUser = await conn.query(`
        SELECT Id, Email 
        FROM User
        WHERE Email = '${sanitizedEmail}'
      `);

      if (existingUser.totalSize > 0) {
        throw new Error("EMAIL_IN_USE");
      }

      return {
        success: true,
        message: "Step 1 validation successful",
        accountId: accountId,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Step 1 validation error:", error);

    // Handle specific error cases
    switch (error.message) {
      case "ACCOUNT_NOT_FOUND":
        return NextResponse.json(
          {
            error:
              "Company not found in approved accounts list. Please check your JDE number or call 1-866-273-7846 between 9am-5pm EST",
          },
          { status: 404 }
        );

      case "EMAIL_IN_USE":
        return NextResponse.json(
          {
            error:
              "Email is already in use. If you have not yet set your password, please set in via the email sent. If further assistance is needed, please call 1-866-273-7846 between 9am-5pm EST",
          },
          { status: 409 }
        );

      case "Invalid email format":
      case "JDE number is required":
        return NextResponse.json(
          {
            error: error.message,
          },
          { status: 400 }
        );

      default:
        // For any other errors, return a generic message
        return NextResponse.json(
          {
            error:
              "An error occurred during validation. Please try again or contact support.",
          },
          { status: 500 }
        );
    }
  }
}
