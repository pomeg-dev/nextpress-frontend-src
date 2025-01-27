// app/api/customer/data/route.ts
import { getMysqlData } from "@/lib/server/mysql";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const aban8List = searchParams.get("aban8List");

  if (!aban8List) {
    return NextResponse.json(
      { error: "Missing aban8List parameter" },
      { status: 400 }
    );
  }

  const aban8Query = `
    SELECT 
      c.aban8,
      c.acct_name,
      c.cust_name,
      c.ppp_tier,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'inv_dt', s.inv_dt,
          'revenue', s.revenue,
          'qty', s.qty
        )
      ) AS sales
    FROM customers c
    LEFT JOIN sales s 
      ON c.aban8 = s.aban8
      AND s.inv_dt >= DATE_SUB(CURDATE(), INTERVAL 3 YEAR)
      AND s.product = '125-Arestin'
    WHERE c.aban8 IN (${aban8List})
    GROUP BY c.aban8, c.acct_name, c.cust_name, c.ppp_tier, c.email;
  `;

  try {
    const aban8result = await getMysqlData(aban8Query);
    if (!aban8result) {
      return NextResponse.json([]);
    }

    // Note: The account_type is now handled by the frontend since we don't have access to the original aban8array here
    return NextResponse.json(aban8result);
  } catch (error) {
    console.error("Error fetching customer data:", error);
    return NextResponse.json(
      { error: "Error fetching customer data" },
      { status: 500 }
    );
  }
}
