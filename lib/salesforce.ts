import * as jsforce from "jsforce";

let conn: jsforce.Connection | null = null;

export async function getSalesforceConnection() {
  if (!conn) {
    conn = new jsforce.Connection({
      loginUrl: process.env.SALESFORCE_LOGIN_URL,
    });

    await conn.login(
      process.env.SALESFORCE_USERNAME!,
      process.env.SALESFORCE_PASSWORD! + process.env.SALESFORCE_SECURITY_TOKEN!
    );
  }
  return conn;
}
