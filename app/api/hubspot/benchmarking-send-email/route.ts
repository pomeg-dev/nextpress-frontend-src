import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

  try {
    // Generate HTML content
    // const htmlContent = `
    //   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    //     <div style="background-color: #eaf0f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    //       <h3>In the past month you completed...</h3>
    //       <ul>
    //         <li><strong>${metrics[0] || 'N/A'}</strong> Periodontitis Procedures</li>
    //         <li><strong>${metrics[1] || 'N/A'}</strong> Sites of ARESTIN®</li>
    //       </ul>

    //       <h3>But there may have been approximately...</h3>
    //       <ul>
    //         <li><strong>${metrics[2] || 'N/A'}</strong> Infected sites appropriate for SRP + ARESTIN</li>
    //       </ul>

    //       <h3>Which means...</h3>
    //       <ul>
    //         <li><strong>${metrics[3] || 'N/A'}%</strong> Of appropriate sites were treated comprehensively with SRP + ARESTIN</li>
    //       </ul>
    //     </div>
    //   </div>
    // `;

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
        to: "akissin@orapharma.com", // akissin@orapharma.com
      },
      customProperties: {
        // html_content: htmlContent,
        perio_procedures: metrics[0],
        arestin_sites: metrics[1],
        infected_sites: metrics[2],
        app_sites: metrics[3],
        sub_date: submissionDate,
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
        <div style="background-color: #eaf0f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>A submission has been made on Arestin Benchmarking Calculator</h2>
          <p>The user ${email} has submitted the following data:</p>
          <ul>
            <li><strong>JDE Number:</strong> ${aban8}</li>
            <li><strong>Periodontitis Procedures:</strong> ${metrics[0]}</li>
            <li><strong>Sites of ARESTIN®:</strong> ${metrics[1]}</li>
            <li><strong>Infected sites appropriate for SRP + ARESTIN:</strong> ${metrics[2]}</li>
            <li><strong>% of appropriate sites treated with SRP + ARESTIN®:</strong> ${metrics[3]}</li>
          </ul>
        </div>
      </div>
    `;

    const alertEmailData = {
      emailId: 219447778077,
      message: {
        to: "akissin@orapharma.com", // marketing@orapharma.com
      },
      customProperties: {
        sub_details: alertContent,
      },
    };

    const alertEmailResponse = await fetch(emailEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(alertEmailData),
    });
    const alertResult = await alertEmailResponse.json();

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
