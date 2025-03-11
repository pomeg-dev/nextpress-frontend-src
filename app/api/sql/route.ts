// app/api/sql/route.ts
import { getMysqlData } from "@/lib/server/mysql";
import { type NextRequest } from "next/server";

// Whitelist of allowed SQL operations
const ALLOWED_OPERATIONS = ["SELECT", "WITH", "SHOW"];

// Blacklist of dangerous SQL keywords
const DANGEROUS_KEYWORDS = [
  "DROP",
  "TRUNCATE",
  "ALTER",
  "CREATE",
  "MODIFY",
  "INSERT",
  "UPDATE",
  "DELETE",
];

function isQuerySafe(sql: string): boolean {
  const uppercaseSQL = sql.toUpperCase();

  // Check if the query starts with an allowed operation
  if (!ALLOWED_OPERATIONS.some((op) => uppercaseSQL.trim().startsWith(op))) {
    return false;
  }

  // Check for presence of dangerous keywords
  if (DANGEROUS_KEYWORDS.some((keyword) => uppercaseSQL.includes(keyword))) {
    return false;
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { sql, credentials } = await request.json();

    if (!sql) {
      return new Response(JSON.stringify({ error: "No SQL query provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!isQuerySafe(sql)) {
      return new Response(JSON.stringify({ error: "Unsafe SQL query" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await getMysqlData(sql, undefined, credentials);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Database query error:", error);
    return new Response(JSON.stringify({ error: "Database query failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
