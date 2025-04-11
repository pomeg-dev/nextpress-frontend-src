// app/api/register/check-email/route.ts

import { NextResponse } from "next/server";
import { executeSalesforceQuery } from "@/lib/salesforce";
import { getMysqlDataApi } from "@themes/elite-dashboard/blocks/elite-tool/data";

// Custom error class for better error handling
class ValidationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      throw new ValidationError("Invalid email format", "INVALID_EMAIL", 400);
    }

    // Check if email exists in Salesforce
    const sfUser = await executeSalesforceQuery(async (conn) => {
      const result = await conn.query(`
        SELECT Id, ContactId, Contact.AccountId
        FROM User 
        WHERE Email = '${email}' 
        OR Username = '${email}'
      `);
      return result;
    }).catch(() => ({ totalSize: 0, records: [] }));

    // Check if email exists in JDE
    const jdeResults = await getMysqlDataApi(`
      SELECT * FROM customers 
      WHERE email = '${email.replace(/['"\\\n\r]/g, "")}'
      LIMIT 1
    `).catch(() => []);

    const matchFound =
      sfUser.totalSize > 0 || (jdeResults && jdeResults.length > 0);
    let jdeData = null;

    if (jdeResults && jdeResults.length > 0) {
      jdeData = jdeResults[0];
    }

    return NextResponse.json({
      matchFound,
      salesforceAccount:
        sfUser.totalSize > 0
          ? {
              userId: sfUser.records[0].Id,
              contactId: sfUser.records[0].ContactId,
              accountId: sfUser.records[0].Contact?.AccountId,
            }
          : null,
      jdeData,
    });
  } catch (error) {
    console.error("Email validation error:", error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "An error occurred while checking email" },
      { status: 500 }
    );
  }
}
