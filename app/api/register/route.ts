// /api/register
import { NextResponse } from "next/server";
import { getSalesforceConnection } from "@/lib/salesforce";
import { getMysqlDataApi } from "@themes/elite-dashboard/blocks/elite-tool/data";
import { slugify } from "@/utils/slugify";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, jdeNumber, password } = body;

    const conn = await getSalesforceConnection();

    // 0. get JDE record
    const jdeRecord = await getMysqlDataApi(
      `SELECT * FROM customers WHERE aban8 = '${jdeNumber}'`
    );
    // {aban8: 12216,acct_name: "'09 Dental",cust_name: "'09 Dental",tgt_type: "Tier C",status: "",am_terr: "804-San Antonio TX",emp_nm: "Allison Bakutis-Perez",area: "1-Commercial",am_reg: "08-Southwest",spec: "D",subscr_tier: "",oig_flag: "",ppp_tier: "P24",pr2_flg: "",cat29: "PPP",phoneno: "210-805-8446",email: "DDS@SPALTEN.COM",address1: "120 Austin Hwy Ste 101 ",city: "San Antonio",state: "TX",zip: "78209",decile_arestinbnb: "7",decile_antim: "1",decile_srp: "2",location_srp_d4321_percentage: "0.19",location_srp_d4322_percentage: "0.34",location_srp_d4910_percentage: "0.48",abac03: "COM",abac21: "",aban84: 12216,

    const fName = jdeRecord[0].cust_name;
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
      FirstName: fName,
      LastName: "lname",
      Email: email,
      AccountId: accountId,
    });

    // 3. Create B2B Commerce User
    const userResult = await conn.sobject("User").create({
      // Basic User Info
      Username: email,
      Email: email,
      FirstName: fName,
      LastName: "lname",
      Alias:
        slugify(fName).substring(0, 3) + "_" + slugify("lname").substring(0, 4),

      // Required for Experience Cloud Users
      ContactId: contactResult.id,
      ProfileId: process.env.SALESFORCE_B2B_PROFILE_ID,

      // License and User Settings
      // UserType: "Guest", setting this isnt allowed apparantly?
      UserRoleId: null, // External users don't have roles

      // Experience Cloud Settings
      IsActive: true,

      //set ecomm cat so that they get correct email etc.
      Ecomm_Category__c: "EC2",

      // Locale Settings
      TimeZoneSidKey: "America/Los_Angeles",
      LocaleSidKey: "en_US",
      EmailEncodingKey: "UTF-8",
      LanguageLocaleKey: "en_US",

      // Additional B2B Commerce Settings
      FederationIdentifier: email, // If using SSO
      //plus random string
      CommunityNickname: fName + "_" + Math.random().toString(36).substring(7),
    });

    // 5. Set the password
    if (password) {
      await conn.soap.setPassword(userResult.id as string, password);
    } else {
      //if no password, register anyway, email will still be sent to user to reset
      await conn.soap.setPassword(
        userResult.id as string,
        "&*yi2g3r9gr43r243r"
      );
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
