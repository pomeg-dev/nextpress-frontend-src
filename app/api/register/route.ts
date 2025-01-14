import { NextResponse } from "next/server";
import { getSalesforceConnection } from "@/lib/salesforce";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, jdeNumber, password } = body;

    const conn = await getSalesforceConnection();

    // 1. Look up Account
    const accounts = await conn.query(`
    SELECT Id, Name 
    FROM Account
    WHERE JDE_Account_ID__c = '${jdeNumber}'
  `);

    if (accounts.totalSize === 0) {
      return NextResponse.json(
        { error: "Company not found in approved accounts list" },
        { status: 404 }
      );
    }

    const accountId = accounts.records[0].Id;

    // 2. Create Contact
    const contactResult = await conn.sobject("Contact").create({
      FirstName: "firstName",
      LastName: "lastName",
      Email: email,
      AccountId: accountId,
    });

    const profiles = await conn.query(`
      SELECT Id, Name 
      FROM Profile 
      WHERE UserLicense.Name = 'Customer Community Plus Login'
    `);
    console.log(profiles.records);
    // 3. Create B2B Commerce User
    const userResult = await conn.sobject("User").create({
      // Basic User Info
      Username: email,
      Email: email,
      LastName: "lastName",
      FirstName: "firstName",
      Alias: "firstName".substring(0, 1) + "lastName".substring(0, 4),

      // Required for Experience Cloud Users
      ContactId: contactResult.id,
      ProfileId: process.env.SALESFORCE_B2B_PROFILE_ID,

      // License and User Settings
      // UserType: "Guest", setting this isnt allowed apparantly?
      UserRoleId: null, // External users don't have roles

      // Experience Cloud Settings
      IsActive: true,

      // Locale Settings
      TimeZoneSidKey: "America/Los_Angeles",
      LocaleSidKey: "en_US",
      EmailEncodingKey: "UTF-8",
      LanguageLocaleKey: "en_US",

      // Additional B2B Commerce Settings
      FederationIdentifier: email, // If using SSO
      CommunityNickname:
        `${"firstName"}${"lastName"}`.toLowerCase() +
        Math.random().toString(36).substring(2, 6),
    });

    // 5. Set the password
    if (password) {
      await conn.soap.setPassword(userResult.id as string, password);
    }
    console.log("User created:", userResult);

    return NextResponse.json({
      success: true,
      userId: userResult.id,
      accountId: accountId,
      contactId: contactResult.id,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
