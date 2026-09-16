import { NextResponse } from "next/server";
import { transporter } from "@/lib/mailer";

export async function GET() {
  try {
    const to = process.env.SMTP_USER;

    if (!to) {
      return NextResponse.json(
        {
          message: "SMTP_USER is not configured",
        },
        {
          status: 500,
        }
      );
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: "Kometik Email Test",
      text: "This is a test email from your Kometik application.",
      html: `
        <div style="font-family:Arial,sans-serif;">
          <h2>Kometik Email Test</h2>
          <p>If you received this email, Gmail SMTP is working correctly.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("TEST EMAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to send test email",
      },
      {
        status: 500,
      }
    );
  }
}
