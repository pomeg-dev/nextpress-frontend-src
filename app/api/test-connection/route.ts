import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Define database configurations
const dbConfigs = [
  {
    host: "3.217.9.205",
    database: "OEDDBP01",
    label: "IP1",
  },
  {
    host: "98.85.89.58",
    database: "OEDDBP01",
    label: "IP2",
  },
];

async function getPublicIp() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Failed to fetch public IP:", error);
    return "Failed to fetch IP";
  }
}

async function testDatabaseConnection(
  config: typeof dbConfigs[0],
  credentials: { user: string; password: string }
) {
  const startTime = Date.now();
  try {
    const connection = await mysql.createConnection({
      host: config.host,
      user: credentials.user,
      password: credentials.password,
      database: config.database,
      connectTimeout: 10000, // 10 second timeout
    });

    // Test query
    const [result] = await connection.execute("SELECT 1 as test");
    await connection.end();

    return {
      success: true,
      message: "Connection successful",
      timing: {
        totalMs: Date.now() - startTime,
      },
      result,
      connectionInfo: {
        host: config.host,
        database: config.database,
        user: credentials.user,
        label: config.label,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
      code: error.code,
      timing: {
        totalMs: Date.now() - startTime,
      },
      connectionInfo: {
        host: config.host,
        database: config.database,
        user: credentials.user,
        label: config.label,
      },
    };
  }
}

export async function GET() {
  const startTime = Date.now();
  const outboundIp = await getPublicIp();

  // Get credentials from environment variables
  const credentials = {
    user: "oeddbprod01",
    password: "MLKXHSeSJ4xTeYtEU1Hl", // This should be in environment variables
  };

  // Test all database connections
  const results = await Promise.all(
    dbConfigs.map((config) => testDatabaseConnection(config, credentials))
  );

  const anySuccess = results.some((result) => result.success);
  const status = anySuccess ? 200 : 500;

  return NextResponse.json(
    {
      overallSuccess: anySuccess,
      timing: {
        totalMs: Date.now() - startTime,
      },
      outboundIp,
      results,
    },
    { status }
  );
}
