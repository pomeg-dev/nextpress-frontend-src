// app/api/test-db/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

async function getPublicIp() {
  const response = await fetch("https://api.ipify.org?format=json");
  const data = await response.json();
  return data.ip;
}

export async function GET() {
  const startTime = Date.now();

  const outboundIp = await getPublicIp();

  try {
    const connection = await mysql.createConnection({
      host: "10.253.227.173",
      user: "oeddbprod01",
      password: "MLKXHSeSJ4xTeYtEU1Hl", // Add this to .env.local and Vercel
      database: "OEDDBP01",
    });

    // Simple test query
    const [result] = await connection.execute("SELECT 1 as test");
    await connection.end();

    return NextResponse.json({
      success: true,
      message: "Connection successful",
      timing: {
        totalMs: Date.now() - startTime,
      },
      result,
      connectionInfo: {
        host: "10.253.227.173",
        database: "OEDDBP01",
        user: "oeddbprod01",
      },
      outboundIp: outboundIp,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        code: error.code,
        timing: {
          totalMs: Date.now() - startTime,
        },
        connectionInfo: {
          host: "10.253.227.173",
          database: "OEDDBP01",
          user: "oeddbprod01",
        },
        outboundIp: outboundIp,
      },
      { status: 500 }
    );
  }
}
