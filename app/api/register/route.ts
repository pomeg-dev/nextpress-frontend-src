import { NextResponse } from "next/server";
import { executeSalesforceQuery } from "@/lib/salesforce";
import { getMysqlDataApi } from "@themes/elite-dashboard/blocks/elite-tool/data";
import { slugify } from "@/utils/slugify";

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

  if (!record || record.length === 0) {
    throw new RegistrationError(
      "JDE record not found. Please verify your JDE number.",
      "JDE_RECORD_NOT_FOUND",
      404
    );
  }

  return record[0];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, jdeNumber, password } = body;

    // Input validation
    await validateInput(email, jdeNumber);

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedJdeNumber = sanitizeInput(jdeNumber);

    // Get JDE record
    const jdeRecord = await getJDERecord(sanitizedJdeNumber);
    const firstName = jdeRecord.cust_name;

    // Look up Account
    const accounts = await executeSalesforceQuery(async (conn) => {
      const result = await conn.query(`
        SELECT Id, Name 
        FROM Account
        WHERE JDE_Account_ID__c = '${sanitizedJdeNumber}'
      `);

      if (result.totalSize === 0) {
        throw new RegistrationError(
          "Company not found in approved accounts list.",
          "ACCOUNT_NOT_FOUND",
          404
        );
      }

      return result;
    });

    const accountId = accounts.records[0].Id;

    // Create Contact and User within a single transaction
    const result = await executeSalesforceQuery(async (conn) => {
      // Create Contact
      const contactResult = await conn.sobject("Contact").create({
        FirstName: firstName,
        LastName: "lname",
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

      // Generate unique community nickname
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 6);
      const uniqueNickname = `${slugify(firstName).substring(
        0,
        3
      )}_${timestamp}_${randomStr}`;

      // Create B2B Commerce User
      const userResult = await conn.sobject("User").create({
        Username: sanitizedEmail,
        Email: sanitizedEmail,
        FirstName: firstName,
        LastName: "lname",
        Alias: `${slugify(firstName).substring(0, 3)}_${slugify(
          "lname"
        ).substring(0, 4)}`,
        ContactId: contactResult.id,
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
      });

      if (!userResult.success) {
        // Rollback contact creation
        await conn.sobject("Contact").delete(contactResult.id);
        throw new RegistrationError(
          "Failed to create user. Please try again.",
          "USER_CREATION_FAILED",
          500
        );
      }

      try {
        // Set password
        await conn.soap.setPassword(
          userResult.id as string,
          password || "&*yi2g3r9gr43r243r"
        );
      } catch (error) {
        // Rollback both user and contact creation
        await conn.sobject("User").delete(userResult.id);
        await conn.sobject("Contact").delete(contactResult.id);
        throw new RegistrationError(
          "Failed to set password. Please try again.",
          "PASSWORD_SETTING_FAILED",
          500
        );
      }

      return {
        success: true,
        userId: userResult.id,
        accountId: accountId,
        contactId: contactResult.id,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof RegistrationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    // Handle any unexpected errors
    return NextResponse.json(
      {
        error:
          "An unexpected error occurred during registration. Please try again or contact support.",
      },
      { status: 500 }
    );
  }
}
