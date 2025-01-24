// app/api/test-db/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  const startTime = Date.now();

  try {
    const connection = await mysql.createConnection({
      host: "swapdbsoedp01.cpcrqvroa809.us-east-1.rds.amazonaws.com",
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
        host: "swapdbsoedp01.cpcrqvroa809.us-east-1.rds.amazonaws.com",
        database: "OEDDBP01",
        user: "oeddbprod01",
      },
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
          host: "swapdbsoedp01.cpcrqvroa809.us-east-1.rds.amazonaws.com",
          database: "OEDDBP01",
          user: "oeddbprod01",
        },
      },
      { status: 500 }
    );
  }
}
