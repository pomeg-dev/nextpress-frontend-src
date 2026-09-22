import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

async function getPracticeName(aban8: number) {
  const sql = `
    SELECT acct_name, cust_name FROM customers WHERE aban8 = ${aban8};
  `;

  try {
    const url =
      API_URL +
      "/sql?" +
      new URLSearchParams({
        sql: sql,
      });

    const data = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "force-cache",
      next: { tags: ["sql"] },
    });

    const json = await data.json();
    return json;
  } catch (error) {
    console.log("error:", error);
  }
}

export async function POST(request: NextRequest) {
  const { email, aban8, metrics } = await request.json();

  // Validate required fields
  if (!email || !aban8 || !metrics) {
    return NextResponse.json(
      { error: 'Missing required fields: email, aban8, or metrics' },
      { status: 400 }
    );
  }

  if (!process.env.HUBSPOT_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "HubSpot access token is not set" },
      { status: 500 }
    );
  }

  // Get practice name from JDE.
  const practiceNameResponse = await getPracticeName(aban8);
  let practiceName = practiceNameResponse?.[0]?.acct_name && practiceNameResponse?.[0]?.acct_name !== '' 
    ? practiceNameResponse?.[0]?.acct_name
    : practiceNameResponse?.[0]?.cust_name;
  practiceName = !practiceName || practiceName === '' ? 'Unknown' : practiceName;

  try {
    // Format today's date as e.g. "Wed July 17"
    const submissionDate = new Date()
      .toLocaleDateString("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
      })
      .replace(",", "");

    // Send email with HTML content
    const emailEndpoint =
      "https://api.hubapi.com/marketing/v3/transactional/single-email/send";
    const emailData = {
      emailId: 217512746936,
      message: {
        to: email,
      },
      customProperties: {
        perio_procedures: metrics[0],
        arestin_sites: metrics[1],
        infected_sites: metrics[2],
        app_sites: metrics[3],
        sub_date: submissionDate,
        aban8: aban8,
        practice_name: practiceName
      },
    };

    const emailResponse = await fetch(emailEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(emailData),
    });

    const result = await emailResponse.json();
    console.log("HubSpot send response:", emailResponse.status, result);

    if (!emailResponse.ok) {
      throw new Error(`Failed to send email: ${JSON.stringify(result)}`);
    }

    // A 200 does not guarantee delivery — check sendResult
    if (result.sendResult && result.sendResult !== "SENT") {
      console.warn(`Email not delivered. sendResult: ${result.sendResult}`);
    }

    // Marketing alert email
    const alertContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #eaf0f6; padding: 40px 30px; border-radius: 8px; margin: 20px 0; line-height: 1.4;">
          <h2>A submission has been made on ARESTIN Benchmarking Calculator</h2>
          <p style="color:#23496d; font-weight:bold; margin:0 0 16px;">The user ${email} has submitted the following data on ${submissionDate}:</p>
          <ul style="color:#23496d; font-weight:bold; padding-left:20px; margin:0;">
            <li>${practiceName}: Practice name</li>
            <li>${aban8}: Account Number (JDE)</li>
            <li>${metrics[0]}: Periodontal procedures</li>
            <li>${metrics[1]}: Sites of ARESTIN placed</li>
            <li>${metrics[2]}: infected sites appropriate for SRP + ARESTIN</li>
            <li>${metrics[3]}% of appropriate sites were treated comprehensively with SRP + ARESTIN</li>
          </ul>
        </div>
      </div>
    `;

    // const alertEmailData = {
    //   emailId: 219447778077,
    //   message: {
    //     to: "vic.l@pomegranate.co.uk" //"marketing@orapharma.com",
    //   },
    //   customProperties: {
    //     sub_details: alertContent,
    //   },
    // };

    // const alertEmailResponse = await fetch(emailEndpoint, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
    //   },
    //   body: JSON.stringify(alertEmailData),
    // });
    // const alertResult = await alertEmailResponse.json();
    // console.log(alertResult);

    return NextResponse.json({
      message: "Email accepted by HubSpot",
      sendResult: result.sendResult,
    });
  } catch (error) {
    console.error("Error in upload or sending email:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
