// app/api/register/validate-jde/route.ts

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
    const { jdeNumber } = body;

    if (!jdeNumber || jdeNumber.trim().length === 0) {
      throw new ValidationError("JDE number is required", "INVALID_JDE", 400);
    }

    // Sanitize input
    const sanitizedJdeNumber = jdeNumber.trim().replace(/['"\\\n\r]/g, "");

    // Check if JDE number exists in JDE system
    const jdeResults = await getMysqlDataApi(`
      SELECT * FROM customers 
      WHERE aban8 = ${sanitizedJdeNumber}
      LIMIT 1
    `).catch(() => []);

    // Check if JDE number exists in Salesforce
    const sfAccount = await executeSalesforceQuery(async (conn) => {
      const result = await conn.query(`
        SELECT Id, Name 
        FROM Account
        WHERE JDE_Account_ID__c = '${sanitizedJdeNumber}'
      `);
      return result;
    }).catch(() => ({ totalSize: 0, records: [] }));

    // If no records found in either system
    if (
      (jdeResults?.length === 0 || !jdeResults) &&
      sfAccount.totalSize === 0
    ) {
      throw new ValidationError(
        "JDE number not found. Please verify your JDE number.",
        "JDE_RECORD_NOT_FOUND",
        404
      );
    }

    return NextResponse.json({
      valid: true,
      jdeData: jdeResults && jdeResults.length > 0 ? jdeResults[0] : null,
      salesforceAccount:
        sfAccount.totalSize > 0
          ? {
              accountId: sfAccount.records[0].Id,
              accountName: sfAccount.records[0].Name,
            }
          : null,
    });
  } catch (error) {
    console.error("JDE validation error:", error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: "An error occurred while validating JDE number" },
      { status: 500 }
    );
  }
}
