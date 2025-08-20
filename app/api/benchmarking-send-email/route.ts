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
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #eaf0f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>In the past month you completed...</h3>
          <ul>
            <li><strong>${metrics[0] || 'N/A'}</strong> Periodontitis Procedures</li>
            <li><strong>${metrics[1] || 'N/A'}</strong> Sites of ARESTIN®</li>
          </ul>

          <h3>But there may have been approximately...</h3>
          <ul>
            <li><strong>${metrics[2] || 'N/A'}</strong> Infected sites appropriate for SRP + ARESTIN</li>
            <li><strong>Metric 4:</strong> ${metrics[3] || 'N/A'}</li>
          </ul>

          <h3>Which means...</h3>
          <ul>
            <li><strong>${metrics[3] || 'N/A'}%</strong> Of appropriate sites were treated comprehensively with SRP + ARESTIN</li>
          </ul>
        </div>
      </div>
    `;

    // Send email with HTML content
    const emailEndpoint =
      "https://api.hubapi.com/marketing/v3/transactional/single-email/send";
    const emailData = {
      emailId: 194804078381,
      message: {
        to: email,
      },
      customProperties: {
        html_content: htmlContent,
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

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
    }

    return NextResponse.json({
      message: "Email sent successfully with HTML content",
    });
  } catch (error) {
    console.error("Error in upload or sending email:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
