// api/benchmarking-submit/route.ts

import { NextResponse } from "next/server";
import { executeSalesforceQuery } from "@/lib/salesforce";
import { getServerSession } from "next-auth/next";
import { options } from "../auth/[...nextauth]/options";

// Interface for benchmarking run data
interface BenchmarkingRunData {
  date: string;
  periodontalProcedures: number;
  arestinSites: number;
  infectedSites: number;
  appropriateSitesPercentage: number;
}

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

// Validate input data
function validateInput(email: string, jdeNumber: string, metrics: any) {
  if (!email || !email.includes("@")) {
    throw new BenchmarkingError("Invalid email format", "INVALID_EMAIL", 400);
  }

  if (!jdeNumber || jdeNumber.trim().length === 0) {
    throw new BenchmarkingError("JDE number is required", "INVALID_JDE", 400);
  }

  if (!metrics || typeof metrics !== "object") {
    throw new BenchmarkingError("Invalid metrics data", "INVALID_METRICS", 400);
  }
}

// Sanitize input to prevent injection
function sanitizeInput(input: string): string {
  return input.trim().replace(/['"\\\n\r]/g, "");
}

export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(options);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, jdeNumber, metrics, date } = body;

    // Input validation
    validateInput(email, jdeNumber, metrics);

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedJdeNumber = sanitizeInput(jdeNumber);

    // Create new benchmarking run data
    const newRun: BenchmarkingRunData = {
      date: date || new Date().toISOString(),
      periodontalProcedures: metrics.periodontalProcedures,
      arestinSites: metrics.arestinSites,
      infectedSites: metrics.infectedSites,
      appropriateSitesPercentage: metrics.appropriateSitesPercentage,
    };

    // Update Salesforce user record with new benchmarking run
    const result = await executeSalesforceQuery(async (conn) => {
      // Find the user by email
      const userQuery = await conn.query(`
        SELECT Id, Benchmarking_Run_History__c
        FROM User
        WHERE Email = '${sanitizedEmail}'
      `);

      if (userQuery.totalSize === 0) {
        throw new BenchmarkingError("User not found", "USER_NOT_FOUND", 404);
      }

      const userId = userQuery.records[0].Id;

      if (!userId) {
        throw new BenchmarkingError(
          "User ID not found",
          "INVALID_USER_ID",
          404
        );
      }

      // Parse existing run history or create new array
      let runHistory: BenchmarkingRunData[] = [];

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
          console.error("Error parsing existing history:", error);
          // If parsing fails, start with empty array
          runHistory = [];
        }
      }

      // Add new run to the beginning of history array
      runHistory.unshift(newRun);

      // Limit to most recent 20 runs to prevent field size issues
      if (runHistory.length > 20) {
        runHistory = runHistory.slice(0, 20);
      }

      // Update user record with new run history
      const updateResult = await conn.sobject("User").update({
        Id: userId,
        Benchmarking_Run_History__c: JSON.stringify(runHistory),
      });

      if (!updateResult.success) {
        throw new BenchmarkingError(
          "Failed to update benchmarking history",
          "UPDATE_FAILED",
          500
        );
      }

      return {
        success: true,
        message: "Benchmarking run saved successfully",
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Benchmarking error:", error);

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
      },
      { status: 500 }
    );
  }
}
