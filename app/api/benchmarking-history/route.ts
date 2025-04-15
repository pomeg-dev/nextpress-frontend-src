// api/benchmarking-history/route.ts

import { NextResponse } from "next/server";
import { executeSalesforceQuery } from "@/lib/salesforce";
import { getServerSession } from "next-auth/next";
import { options } from "../auth/[...nextauth]/options";

// Custom error class for better error handling
class BenchmarkingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "BenchmarkingError";
  }
}

export async function GET(request: Request) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(options);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;

    if (!email) {
      return NextResponse.json(
        { error: "User email not found in session" },
        { status: 400 }
      );
    }

    // Query Salesforce for user's benchmarking history
    const result = await executeSalesforceQuery(async (conn) => {
      const userQuery = await conn.query(`
        SELECT Id, Benchmarking_Run_History__c
        FROM User
        WHERE Email = '${email}'
      `);

      if (userQuery.totalSize === 0) {
        return {
          runHistory: [],
          message: "User not found",
        };
      }

      // Parse run history from Salesforce
      let runHistory = [];

      if (userQuery.records[0].Benchmarking_Run_History__c) {
        try {
          runHistory = JSON.parse(
            userQuery.records[0].Benchmarking_Run_History__c
          );

          // Ensure it's an array
          if (!Array.isArray(runHistory)) {
            runHistory = [];
          }
        } catch (error) {
          console.error("Error parsing run history:", error);
          runHistory = [];
        }
      }

      return {
        runHistory,
        message: "History retrieved successfully",
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error retrieving benchmarking history:", error);

    if (error instanceof BenchmarkingError) {
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
        runHistory: [],
      },
      { status: 500 }
    );
  }
}
