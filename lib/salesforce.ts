import { Connection, OAuth2 } from "jsforce";
import { cache } from "react";

// Types for better type safety
interface ConnectionConfig {
  instanceUrl: string;
  accessToken?: string;
  refreshToken?: string;
}

// Maximum number of retry attempts for failed requests
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Initialize connection as null
let conn: Connection | null = null;

// Environment check
const isDevelopment = process.env.NEXT_PUBLIC_SALESFORCE_DOMAIN!.includes(
  "orapharma--orapharmad"
);

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Handles connection errors and implements retry logic
 */
async function handleConnectionError(
  error: any,
  retryCount: number,
  operation: () => Promise<any>
): Promise<any> {
  if (retryCount >= MAX_RETRIES) {
    console.error("Max retries reached:", error);
    throw error;
  }

  if (
    error.errorCode === "INVALID_SESSION_ID" ||
    error.name === "invalid_grant"
  ) {
    console.log("Session expired, attempting to refresh connection...");
    resetConnection();
    await sleep(RETRY_DELAY_MS * (retryCount + 1));
    return operation();
  }

  console.error(
    `Operation failed, attempt ${retryCount + 1} of ${MAX_RETRIES}:`,
    error
  );
  await sleep(RETRY_DELAY_MS * (retryCount + 1));
  return operation();
}

/**
 * Creates a new Salesforce connection with proper error handling and retry logic
 */
export const getSalesforceConnection = cache(async () => {
  if (conn) return conn;

  try {
    if (isDevelopment) {
      // Development environment: Username-Password Flow
      conn = new Connection({
        loginUrl: process.env.NEXT_PUBLIC_SALESFORCE_DOMAIN,
      });

      await conn.login(
        process.env.SALESFORCE_USERNAME!,
        process.env.SALESFORCE_PASSWORD! +
          process.env.SALESFORCE_SECURITY_TOKEN!
      );
    } else {
      // Production environment: OAuth2 Client Credentials Flow
      conn = new Connection({
        instanceUrl: process.env.NEXT_PUBLIC_SALESFORCE_DOMAIN,
        oauth2: {
          clientId: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID!,
          clientSecret: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_SECRET!,
          loginUrl: process.env.NEXT_PUBLIC_SALESFORCE_DOMAIN,
        },
        refreshFn: async (connection, callback) => {
          try {
            if (!connection.oauth2 || !connection.refreshToken) {
              throw new Error("OAuth2 configuration or refresh token missing");
            }

            const response = await connection.oauth2.refreshToken(
              connection.refreshToken
            );
            callback(null, response.access_token);
          } catch (error) {
            console.error("Token refresh failed:", error);
            resetConnection();
            callback(
              error instanceof Error ? error : new Error("Token refresh failed")
            );
          }
        },
      });

      // Initial authorization
      await conn.authorize({
        grant_type: "client_credentials",
      });
    }

    // Set up refresh token listener
    conn.on("refresh", (accessToken: string) => {
      console.log("Access token refreshed successfully");
    });

    console.log("Salesforce connection::: ", conn);

    return conn;
  } catch (error) {
    console.error("Failed to establish Salesforce connection:", error);
    resetConnection();
    throw error;
  }
});

/**
 * Wrapper function to execute Salesforce queries with retry logic
 */
export async function executeSalesforceQuery<T>(
  queryFn: (connection: Connection) => Promise<T>,
  retryCount = 0
): Promise<T> {
  try {
    const connection = await getSalesforceConnection();
    return await queryFn(connection);
  } catch (error) {
    return handleConnectionError(error, retryCount, () =>
      executeSalesforceQuery(queryFn, retryCount + 1)
    );
  }
}

/**
 * Reset the connection instance
 */
export function resetConnection() {
  conn = null;
}

/**
 * Validate connection status
 */
export async function isConnectionValid(): Promise<boolean> {
  try {
    const connection = await getSalesforceConnection();
    await connection.identity();
    return true;
  } catch (error) {
    console.error("Connection validation failed:", error);
    return false;
  }
}

/**
 * Check if running in development environment
 */
export function isDevEnvironment(): boolean {
  return isDevelopment;
}
