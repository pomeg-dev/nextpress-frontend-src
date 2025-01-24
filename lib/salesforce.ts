// lib/salesforce.ts
import { Connection } from "jsforce";

let conn: Connection | null = null;
const isDevelopment = process.env.NEXT_PUBLIC_SALESFORCE_DOMAIN!.includes(
  "orapharma--orapharmad"
);

async function validateConnection(connection: Connection): Promise<boolean> {
  try {
    // Test the connection with a simple query
    await connection.query("SELECT Id FROM User LIMIT 1");
    return true;
  } catch (error) {
    console.error("Connection validation failed:", error);
    return false;
  }
}

async function createConnection(): Promise<Connection> {
  if (isDevelopment) {
    // Development: Username-Password Flow
    const connection = new Connection({
      loginUrl: process.env.NEXT_PUBLIC_SALESFORCE_DOMAIN,
    });

    await connection.login(
      process.env.SALESFORCE_USERNAME!,
      process.env.SALESFORCE_PASSWORD! + process.env.SALESFORCE_SECURITY_TOKEN!
    );

    return connection;
  } else {
    // Production: OAuth2 Client Credentials Flow
    const connection = new Connection({
      instanceUrl: process.env.NEXT_PUBLIC_SALESFORCE_DOMAIN,
      oauth2: {
        clientId: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID!,
        clientSecret: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_SECRET!,
        loginUrl: process.env.NEXT_PUBLIC_SALESFORCE_DOMAIN,
      },
    });

    await connection.authorize({
      grant_type: "client_credentials",
    });

    return connection;
  }
}

export async function getSalesforceConnection() {
  try {
    // If connection exists, validate it
    if (conn) {
      const isValid = await validateConnection(conn);
      if (isValid) {
        return conn;
      }
      // If validation fails, reset connection
      conn = null;
    }

    // Create new connection
    conn = await createConnection();
    return conn;
  } catch (error) {
    console.error("Error in getSalesforceConnection:", error);
    // Reset connection on error
    conn = null;
    throw new Error("Failed to establish Salesforce connection");
  }
}

// Helper to force a new connection if needed
export function resetConnection() {
  conn = null;
}

// Helper to check current environment
export function isDevEnvironment() {
  return isDevelopment;
}

// Optional: Add a connection error handler
export class SalesforceConnectionError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = "SalesforceConnectionError";
  }
}
