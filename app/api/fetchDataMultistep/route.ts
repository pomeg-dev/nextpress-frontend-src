// app/api/customer/multistep/route.ts
import { getMysqlDataApi } from "@themes/elite-dashboard/blocks/elite-tool/data";
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

  try {
    const sqlResult = await getMysqlDataApi(sqlQuery);
    if (!sqlResult || sqlResult.length < 1) {
      return NextResponse.json(null);
    }

    const data = sqlResult[0];
    data.current_account = null;

    if (data.account_type !== "Individual" && data.related_accounts) {
      const relatedAccResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_FRONTEND_URL
        }/fetchCustomerData?aban8List=${data.related_accounts
          .map((acc: any) => acc.related_aban8)
          .join(",")}`
      );
      const relatedAccData = await relatedAccResponse.json();

      if (relatedAccData) {
        const currentAccIndex = relatedAccData.findIndex(
          (item: { aban8: string }) => item.aban8 == aban8
        );
        data.current_account = relatedAccData[currentAccIndex];
        data.related_accounts = relatedAccData;
      }
    } else {
      const indResponse = await fetch(
        `${process.env.NEXT_PUBLIC_FRONTEND_URL}/fetchCustomerData?aban8List=${aban8}`
      );
      const indData = await indResponse.json();

      if (indData[0]) {
        data.current_account = indData[0];
        data.related_accounts = null;
      }
    }

    // Set tiers
    const tierBoxes = data.current_account?.ppp_tier.replace("P", "");
    const currentTierIndex = tiers.findIndex(
      (item: { number_of_boxes: number }) => item.number_of_boxes >= tierBoxes
    );

    const currentTier =
      currentTierIndex !== -1 ? tiers[currentTierIndex] : null;
    const nextTier =
      currentTierIndex + 1 < tiers.length ? tiers[currentTierIndex + 1] : null;
    const nextNextTier =
      currentTierIndex + 2 < tiers.length ? tiers[currentTierIndex + 2] : null;

    return NextResponse.json({
      accountType: data.account_type,
      currentAccount: data.current_account,
      relatedAccounts: data.related_accounts,
      currentTier,
      targetTier: nextTier,
      futureTier: nextNextTier,
    });
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
