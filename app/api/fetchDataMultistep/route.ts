import { getMysqlData } from "@/lib/server/mysql";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const aban8 = searchParams.get("aban8");

  if (!aban8) {
    return NextResponse.json(
      { error: "Missing aban8 parameter" },
      { status: 400 }
    );
  }

  try {
    const customerInfo = await fetchDataMultistep(aban8);
    if (!customerInfo) {
      return NextResponse.json(null);
    }

    return NextResponse.json(customerInfo);
  } catch (error) {
    console.error("Error fetching customer data:", error);
    return NextResponse.json(
      {
        error: "Error fetching customer data, please contact the support team.",
      },
      { status: 500 }
    );
  }
}

async function fetchDataMultistep(aban8: string) {
  const sqlQuery = `
    WITH AccountType AS (
      SELECT 
        CASE
          WHEN EXISTS (SELECT 1 FROM parent_child WHERE child_aban8 = ${aban8}) THEN 'Child'
          WHEN EXISTS (SELECT 1 FROM parent_child WHERE parent_aban8 = ${aban8}) THEN 'Parent'
          ELSE 'Individual'
        END AS account_type,
        ${aban8} AS aban8
    ),
    RelatedAccounts AS (
      SELECT 
        pc.parent_aban8 AS related_aban8,
        'Parent' AS related_account_type
      FROM parent_child pc
      INNER JOIN AccountType at ON pc.child_aban8 = at.aban8 AND at.account_type = 'Child'
      UNION
      SELECT 
        pc.child_aban8 AS related_aban8,
        'Child' AS related_account_type
      FROM parent_child pc
      INNER JOIN AccountType at ON pc.parent_aban8 = at.aban8 AND at.account_type = 'Parent'
      UNION
      SELECT 
        pc.child_aban8 AS related_aban8,
        'Child' AS related_account_type
      FROM parent_child pc
      WHERE pc.parent_aban8 = (
        SELECT pc2.parent_aban8
        FROM parent_child pc2
        WHERE pc2.child_aban8 = ${aban8}
        LIMIT 1
      )
      AND EXISTS (
        SELECT 1 FROM AccountType WHERE account_type = 'Child'
      )
      UNION
      SELECT 
        ${aban8} AS related_aban8,
        (SELECT account_type FROM AccountType) AS related_account_type
    ), 
    AllRelatedAccounts AS (
      SELECT 
        at.account_type,
        at.aban8,
        JSON_ARRAYAGG(
            JSON_OBJECT('related_aban8', ra.related_aban8, 'related_account_type', ra.related_account_type)
        ) AS related_accounts
      FROM AccountType at
      LEFT JOIN RelatedAccounts ra ON ra.related_aban8 IS NOT NULL
      GROUP BY at.account_type, at.aban8
    )
    SELECT 
      account_type, 
      aban8, 
      related_accounts
    FROM AllRelatedAccounts;
  `;

  const sqlResult = await getMysqlData(sqlQuery);
  if (!sqlResult || sqlResult.length < 1) return null;

  const data = sqlResult[0];
  data.current_account = null;

  console.log("Data:", data);

  if (data.account_type !== "Individual" && data.related_accounts) {
    const relatedAccData = await fetchCustomerData(data.related_accounts);
    if (relatedAccData) {
      const currentAccIndex = relatedAccData.findIndex(
        (item: { aban8: string }) => item.aban8 == aban8
      );
      data.current_account = relatedAccData[currentAccIndex];
      data.related_accounts = relatedAccData;
    }
  } else {
    const indData = await fetchCustomerData([
      { related_aban8: aban8, related_account_type: "Individual" },
    ]);
    if (indData[0]) {
      data.current_account = indData[0];
      data.related_accounts = null;
    }
  }

  // Set tiers
  //if ppp_tier is P1K, then tierBoxes = 1000
  let tierBoxes = data.current_account?.ppp_tier.replace("P", "");
  if (tierBoxes === "1K") {
    tierBoxes = "1000";
  }

  const currentTierIndex = tiers.findIndex(
    (item: { number_of_boxes: number }) => item.number_of_boxes >= tierBoxes
  );

  const currentTier = currentTierIndex !== -1 ? tiers[currentTierIndex] : null;
  const nextTier =
    currentTierIndex + 1 < tiers.length ? tiers[currentTierIndex + 1] : null;
  const nextNextTier =
    currentTierIndex + 2 < tiers.length ? tiers[currentTierIndex + 2] : null;

  return {
    accountType: data.account_type,
    currentAccount: data.current_account,
    relatedAccounts: data.related_accounts,
    currentTier,
    targetTier: nextTier,
    futureTier: nextNextTier,
  };
}

async function fetchCustomerData(
  aban8array: { related_aban8: string; related_account_type: string }[]
) {
  const aban8List = aban8array
    .map((item: { related_aban8: any }) => item.related_aban8)
    .join(", ");
  console.log("aban8List:", aban8List);
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

  console.log("Fetching customer data:", aban8Query);

  try {
    const aban8result = await getMysqlData(aban8Query);
    console.log("Customer data:", aban8result);
    if (aban8result) {
      aban8result.forEach((account: { aban8: string; account_type: any }) => {
        const match = aban8array.find(
          (item) => item.related_aban8 == account.aban8
        );
        account.account_type = match ? match.related_account_type : null;
      });
      return aban8result;
    }
  } catch (error) {
    console.error("Error fetching customer data:", error);
  }
}

const tiers = [
  {
    number_of_boxes: 6,
    discount_percentage: 6,
  },
  {
    number_of_boxes: 12,
    discount_percentage: 12,
  },
  {
    number_of_boxes: 24,
    discount_percentage: 18,
  },
  {
    number_of_boxes: 36,
    discount_percentage: 23,
  },
  {
    number_of_boxes: 48,
    discount_percentage: 25,
  },
  {
    number_of_boxes: 60,
    discount_percentage: 27,
  },
  {
    number_of_boxes: 96,
    discount_percentage: 29,
  },
  {
    number_of_boxes: 120,
    discount_percentage: 31,
  },
  {
    number_of_boxes: 156,
    discount_percentage: 33,
  },
  {
    number_of_boxes: 300,
    discount_percentage: 35,
  },
  {
    number_of_boxes: 500,
    discount_percentage: 39,
  },
  {
    number_of_boxes: 800,
    discount_percentage: 42,
  },
  {
    number_of_boxes: 1000,
    discount_percentage: 44,
  },
];
