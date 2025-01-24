import { NextResponse } from "next/server";
import { getSalesforceConnection, resetConnection } from "@/lib/salesforce";
import { getMysqlDataApi } from "@themes/elite-dashboard/blocks/elite-tool/data";
import { slugify } from "@/utils/slugify";

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

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
    const { email, jdeNumber, password } = body;

    // Input validation
    await validateInput(email, jdeNumber);

    // Sanitize inputs
    const sanitizedEmail = email.replace(/['"\\\n\r]/g, "");
    const sanitizedJdeNumber = jdeNumber.replace(/['"\\\n\r]/g, "");

    // Wrap all Salesforce operations in retry logic
    return await executeWithRetry(async () => {
      const conn = await getSalesforceConnection();

      // 0. Get JDE record with parameterized query
      const jdeRecord = await getMysqlDataApi(
        `SELECT * FROM customers WHERE aban8 = ${sanitizedJdeNumber}`
      );

      if (!jdeRecord || jdeRecord.length === 0) {
        throw new Error("JDE_RECORD_NOT_FOUND");
      }

      const fName = jdeRecord[0].cust_name;

      // 1. Look up Account
      const accounts = await conn.query(`
        SELECT Id, Name 
        FROM Account
        WHERE JDE_Account_ID__c = '${sanitizedJdeNumber}'
      `);

      if (accounts.totalSize === 0) {
        throw new Error("ACCOUNT_NOT_FOUND");
      }

      const accountId = accounts.records[0].Id;

      try {
        // 2. Create Contact
        const contactResult = await conn.sobject("Contact").create({
          FirstName: fName,
          LastName: "lname",
          Email: sanitizedEmail,
          AccountId: accountId,
        });

        if (!contactResult.success) {
          throw new Error("CONTACT_CREATION_FAILED");
        }

        // Generate a unique community nickname
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 6);
        const uniqueNickname = `${slugify(fName).substring(
          0,
          3
        )}_${timestamp}_${randomStr}`;

        // 3. Create B2B Commerce User
        const userResult = await conn.sobject("User").create({
          Username: sanitizedEmail,
          Email: sanitizedEmail,
          FirstName: fName,
          LastName: "lname",
          Alias:
            slugify(fName).substring(0, 3) +
            "_" +
            slugify("lname").substring(0, 4),
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
          // Rollback contact creation if user creation fails
          await conn.sobject("Contact").delete(contactResult.id);
          throw new Error("USER_CREATION_FAILED");
        }

        // 4. Set the password
        try {
          await conn.soap.setPassword(
            userResult.id as string,
            password || "&*yi2g3r9gr43r243r"
          );
        } catch (error) {
          // Rollback user and contact creation if password setting fails
          await conn.sobject("User").delete(userResult.id);
          await conn.sobject("Contact").delete(contactResult.id);
          throw new Error("PASSWORD_SETTING_FAILED");
        }

        console.log("User created successfully:", userResult.id);

        return NextResponse.json({
          success: true,
          userId: userResult.id,
          accountId: accountId,
          contactId: contactResult.id,
        });
      } catch (error: any) {
        // Handle specific creation errors
        throw error;
      }
    });
  } catch (error: any) {
    console.error("Registration error:", error);

    // Handle specific error cases
    switch (error.message) {
      case "JDE_RECORD_NOT_FOUND":
        return NextResponse.json(
          {
            error: "JDE record not found. Please verify your JDE number.",
          },
          { status: 404 }
        );

      case "ACCOUNT_NOT_FOUND":
        return NextResponse.json(
          {
            error: "Company not found in approved accounts list.",
          },
          { status: 404 }
        );

      case "CONTACT_CREATION_FAILED":
        return NextResponse.json(
          {
            error: "Failed to create contact. Please try again.",
          },
          { status: 500 }
        );

      case "USER_CREATION_FAILED":
        return NextResponse.json(
          {
            error: "Failed to create user. Please try again.",
          },
          { status: 500 }
        );

      case "PASSWORD_SETTING_FAILED":
        return NextResponse.json(
          {
            error: "Failed to set password. Please try again.",
          },
          { status: 500 }
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
        return NextResponse.json(
          {
            error: "Registration failed. Please try again or contact support.",
          },
          { status: 500 }
        );
    }
  }
}
