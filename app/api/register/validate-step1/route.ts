import { NextResponse } from "next/server";
import { getSalesforceConnection } from "@/lib/salesforce";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, jdeNumber } = body;

    const conn = await getSalesforceConnection();

    // 1. Look up Account
    const accounts = await conn.query(`
      SELECT Id, Name 
      FROM Account
      WHERE JDE_Account_ID__c = '${jdeNumber}'
    `);

    if (accounts.totalSize === 0) {
      return NextResponse.json(
        {
          error:
            "Company not found in approved accounts list. Please check your JDE number or call 1-866-273-7846 between 9am-5pm EST",
        },
        { status: 404 }
      );
    }

    const accountId = accounts.records[0].Id;

    // //get al the contacts for the account
    // const contacts = await conn.query(`
    //   SELECT Id, Email
    //   FROM Contact
    //   WHERE AccountId = '${accountId}'
    // `);

    // //if email is already in use, return an error
    // if (contacts.records.some((contact) => contact.Email === email)) {
    //   return NextResponse.json(
    //     {
    //       error:
    //         "Email is already in use. If you have not yet set your password, please set in via the email sent",
    //     },
    //     { status: 409 }
    //   );
    // }

    //check if the email is already in use on salesforce as a whole
    const existingUser = await conn.query(`
      SELECT Id, Email 
      FROM User
      WHERE Email = '${email}'
    `);

    if (existingUser.totalSize > 0) {
      return NextResponse.json(
        {
          error:
            "Email is already in use. If you have not yet set your password, please set in via the email sent. If further assistance is needed, please call 1-866-273-7846 between 9am-5pm EST",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Step 1 validation successful",
      accountId: accountId,
    });
  } catch (error: any) {
    console.error("Step 1 validation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
