import mysql, { Pool, PoolConnection } from "mysql2/promise";
import async from "async";

const dbConfig = {
  host: process.env.NEXT_PUBLIC_SQL_HOST,
  database: process.env.NEXT_PUBLIC_SQL_DB,
  user: process.env.NEXT_PUBLIC_SQL_USER,
  password: process.env.NEXT_PUBLIC_SQL_PASS,
};

const pool: Pool = mysql.createPool({
  ...dbConfig,
  connectionLimit: 100,
});

// Create an async queue for database queries
const queryQueue = async.queue(
  async (task: { sql: string; values?: any[] }): Promise<any> => {
    try {
      return await executeQuery(task.sql, task.values);
    } catch (error) {
      throw error;
    }
  },
  10 // Set the concurrency limit (number of queries executed simultaneously)
);

// Function to execute a query
async function executeQuery(sql: string, values?: any[]): Promise<any> {
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

export async function getMysqlData(sql: string, values?: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    queryQueue.push({ sql, values }).then(resolve).catch(reject);
  });
}
