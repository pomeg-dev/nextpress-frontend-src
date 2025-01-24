import { NextResponse } from "next/server";
import { executeSalesforceQuery } from "@/lib/salesforce";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, jdeNumber } = body;

    if (!email || !jdeNumber) {
      return NextResponse.json(
        { error: "Email and JDE number are required" },
        { status: 400 }
      );
    }

    // Look up Account using the wrapper function
    const accounts = await executeSalesforceQuery(async (conn) => {
      return conn.query(`
        SELECT Id, Name 
        FROM Account
        WHERE JDE_Account_ID__c = '${jdeNumber}'
      `);
    });

    if (accounts.totalSize === 0) {
      return NextResponse.json(
        {
          error:
            "Company not found in approved accounts list. Please check your JDE number or call 1-866-273-7846 between 9am-5pm EST",
        },
        { status: 404 }
      );
    }

    const accountId = accounts.records[0].Id;

    // Check if email is already in use
    const existingUser = await executeSalesforceQuery(async (conn) => {
      return conn.query(`
        SELECT Id, Email 
        FROM User
        WHERE Email = '${email}'
      `);
    });

    if (existingUser.totalSize > 0) {
      return NextResponse.json(
        {
          error:
            "Email is already in use. If you have not yet set your password, please set in via the email sent. If further assistance is needed, please call 1-866-273-7846 between 9am-5pm EST",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Step 1 validation successful",
      accountId: accountId,
    });
  } catch (error: any) {
    console.error("Step 1 validation error:", error);

    // Handle specific error types
    if (
      error.name === "invalid_grant" ||
      error.errorCode === "INVALID_SESSION_ID"
    ) {
      return NextResponse.json(
        { error: "Authentication error. Please try again." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
