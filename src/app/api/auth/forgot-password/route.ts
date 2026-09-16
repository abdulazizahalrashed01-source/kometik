import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return NextResponse.json(
        {
          message: "Please enter your email address.",
        },
        {
          status: 400,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    /*
     * Always return the same message.
     * This prevents revealing whether an account exists.
     */
    if (!user || user.role !== "USER") {
      return NextResponse.json({
        message:
          "If an account exists for this email, a reset link has been sent.",
      });
    }

    /*
     * Remove previous reset tokens for this user.
     */
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    /*
     * Generate a cryptographically secure token.
     */
    const rawToken = crypto.randomBytes(32).toString("hex");

    /*
     * Store only a SHA-256 hash in the database.
     */
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    /*
     * Token is valid for 30 minutes.
     */
    const expiresAt = new Date(
      Date.now() + 30 * 60 * 1000
    );

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const resetUrl =
      `${appUrl}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail(
      user.email,
      resetUrl
    );

    return NextResponse.json({
      message:
        "If an account exists for this email, a reset link has been sent.",
    });
  } catch (error) {
    console.error(
      "FORGOT PASSWORD ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong. Please try again later.",
      },
      {
        status: 500,
      }
    );
  }
}
