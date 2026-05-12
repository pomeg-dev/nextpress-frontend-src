import { NextResponse } from "next/server";
import { executeSalesforceQuery } from "@/lib/salesforce/connection";

export async function GET() {
  try {
    const result = await executeSalesforceQuery(async (conn) => {
      let result = await conn.query(
        "SELECT Id, Name, Email, Username, IsActive, Elite_Hub_Tracker__c FROM User ORDER BY Name ASC"
      );
      const records = [...result.records];
      while (!result.done && result.nextRecordsUrl) {
        result = await conn.queryMore(result.nextRecordsUrl);
        records.push(...result.records);
      }
      const users = records.filter((u: any) => u.Elite_Hub_Tracker__c != null);
      return {
        success: true,
        users,
        totalHubUsers: users.length,
        totalUsers: records.length,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Salesforce users fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Salesforce users", code: "FETCH_FAILED" },
      { status: 500 }
    );
  }
}
