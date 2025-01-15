// lib/salesforce.ts
import { Connection } from "jsforce";

let conn: Connection | null = null;
const isDevelopment = process.env.NEXT_PUBLIC_SALESFORCE_DOMAIN!.includes(
  "orapharma--orapharmad"
);
export async function getSalesforceConnection() {
  if (!conn) {
    if (isDevelopment) {
      // Development: Username-Password Flow
      conn = new Connection({
        loginUrl: process.env.NEXT_PUBLIC_SALESFORCE_DOMAIN,
      });

      await conn.login(
        process.env.SALESFORCE_USERNAME!,
        process.env.SALESFORCE_PASSWORD! +
          process.env.SALESFORCE_SECURITY_TOKEN!
      );
    } else {
      // Production: OAuth2 Client Credentials Flow
      conn = new Connection({
        instanceUrl: process.env.NEXT_PUBLIC_SALESFORCE_DOMAIN,
        oauth2: {
          clientId: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_ID!,
          clientSecret: process.env.NEXT_PUBLIC_SALESFORCE_CLIENT_SECRET!,
          loginUrl: process.env.NEXT_PUBLIC_SALESFORCE_DOMAIN,
        },
      });

      await conn.authorize({
        grant_type: "client_credentials",
      });
    }
  }

  return conn;
}

// Helper to force a new connection if needed
export function resetConnection() {
  conn = null;
}

// Helper to check current environment
export function isDevEnvironment() {
  return isDevelopment;
}
