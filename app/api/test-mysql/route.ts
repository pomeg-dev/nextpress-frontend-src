// app/api/test-mysql/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql, { Pool, PoolConnection } from "mysql2/promise";
import dns from "dns";
import { promisify } from "util";

const lookup = promisify(dns.lookup);

interface ConnectionConfig {
  host: string;
  database: string;
  user: string;
  password: string;
}

const configs: ConnectionConfig[] = [
  {
    host: "bausch-sales-customer-calls.cbxd002eofiz.us-east-1.rds.amazonaws.com",
    database: "bausch",
    user: "admin",
    password: "5rzO!owyosCyC8TQsqiwi%Z7V^r#",
  },
  {
    host: "swapdbsoedp01.cpcrqvroa809.us-east-1.rds.amazonaws.com",
    database: "OEDDBP01",
    user: "oeddbprod01",
    password: "MLKXHSeSJ4xTeYtEU1Hl",
  },
];

async function getHostDetails(hostname: string) {
  try {
    const { address, family } = await lookup(hostname);
    return {
      ip: address,
      ipVersion: `IPv${family}`,
      hostname,
    };
  } catch (error: any) {
    return {
      error: error.message,
      hostname,
    };
  }
}

async function testConnection(config: ConnectionConfig) {
  let pool: Pool | null = null;
  let connection: PoolConnection | null = null;
  const startTime = Date.now();

  try {
    const hostInfo = await getHostDetails(config.host);

    pool = mysql.createPool({
      ...config,
      connectionLimit: 1,
      connectTimeout: 10000,
    });

    connection = await pool.getConnection();
    const connectionTime = Date.now() - startTime;

    const [results] = await connection.query("SELECT * FROM customers LIMIT 1");
    const queryTime = Date.now() - startTime - connectionTime;

    return {
      success: true,
      data: results,
      timing: {
        totalMs: Date.now() - startTime,
        connectionMs: connectionTime,
        queryMs: queryTime,
      },
      connectionInfo: {
        threadId: connection.threadId,
        database: config.database,
        host: config.host,
        user: config.user,
      },
      network: hostInfo,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      timing: {
        totalMs: Date.now() - startTime,
      },
      connectionInfo: {
        database: config.database,
        host: config.host,
        user: config.user,
      },
      network: hostInfo,
      timestamp: new Date().toISOString(),
    };
  } finally {
    if (connection) await connection.release();
    if (pool) await pool.end();
  }
}

export async function GET() {
  try {
    const results = await Promise.all(
      configs.map(async (config, index) => ({
        configName: index === 0 ? "Bausch Config" : "OEDDBP Config",
        result: await testConnection(config),
      }))
    );

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
