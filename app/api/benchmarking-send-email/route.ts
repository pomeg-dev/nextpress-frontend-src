import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email, aban8, metrics } = await request.json();

    // Validate required fields
    if (!email || !aban8 || !metrics) {
      return NextResponse.json(
        { error: 'Missing required fields: email, aban8, or metrics' },
        { status: 400 }
      );
    }

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Benchmarking Results</h2>
        <p>Thank you for using our benchmarking calculator.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
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
        
        <p>If you have any questions about these results, please don't hesitate to contact us.</p>
      </div>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Your Benchmarking Calculator Results',
      html: htmlContent,
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}