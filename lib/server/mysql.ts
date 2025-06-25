// lib/server/mysql.ts
import mysql, { Pool, PoolConnection, PoolOptions } from "mysql2/promise";
import async from "async";
import { DbCredentials } from "@themes/components/organisms/QueryBuilder/types/queryBuilder";

// Default config from environment variables
const defaultDbConfig: PoolOptions = {
  host: process.env.NEXT_PUBLIC_SQL_HOST,
  database: process.env.NEXT_PUBLIC_SQL_DB,
  user: process.env.NEXT_PUBLIC_SQL_USER,
  password: process.env.NEXT_PUBLIC_SQL_PASS,
  connectionLimit: 100,
  // timezone: 'Z',
  dateStrings: true,
};

// Pool cache to avoid creating multiple pools for the same connection
const poolCache = new Map<string, Pool>();

// Get or create a connection pool
function getPool(credentials?: DbCredentials): Pool {
  // If no credentials provided, use default pool
  if (!credentials) {
    if (!poolCache.has("default")) {
      poolCache.set("default", mysql.createPool(defaultDbConfig));
    }
    return poolCache.get("default")!;
  }

  // Create a cache key for this specific connection
  const cacheKey = `${credentials.host}:${credentials.port}:${credentials.database}:${credentials.username}`;

  // Return existing pool if available
  if (poolCache.has(cacheKey)) {
    return poolCache.get(cacheKey)!;
  }

  // Create a new pool with custom credentials
  const customConfig: PoolOptions = {
    host: credentials.host,
    port: credentials.port ? parseInt(credentials.port, 10) : undefined,
    database: credentials.database,
    user: credentials.username,
    password: credentials.password,
    connectionLimit: 10, // Lower limit for custom connections
    // timezone: 'Z',
    dateStrings: true,
  };

  const pool = mysql.createPool(customConfig);
  poolCache.set(cacheKey, pool);
  return pool;
}

// Create an async queue for database queries
const queryQueue = async.queue(
  async (task: {
    sql: string;
    values?: any[];
    credentials?: DbCredentials;
  }): Promise<any> => {
    try {
      return await executeQuery(task.sql, task.values, task.credentials);
    } catch (error) {
      throw error;
    }
  },
  10 // Set the concurrency limit
);

// Function to execute a query
async function executeQuery(
  sql: string,
  values?: any[],
  credentials?: DbCredentials
): Promise<any> {
  const pool = getPool(credentials);
  let connection: PoolConnection | undefined;
  
  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(sql, values);
    return results;
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Main function to get MySQL data
export async function getMysqlData(
  sql: string,
  values?: any[],
  credentials?: DbCredentials
): Promise<any> {
  return new Promise((resolve, reject) => {
    queryQueue.push({ sql, values, credentials }).then(resolve).catch(reject);
  });
}
