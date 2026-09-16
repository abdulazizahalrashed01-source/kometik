import { NextRequest, NextResponse } from "next/server";
import { createHash, randomInt } from "crypto";

import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mailer";

// ==========================================
// POST /api/auth/resend-verification
// ==========================================

export async function POST(
  request: NextRequest
) {
  try {
    // ========================================
    // READ BODY
    // ========================================

    const body = await request.json();

    const email = body.email;

    // ========================================
    // VALIDATE EMAIL
    // ========================================

    if (
      typeof email !== "string" ||
      !email.trim()
    ) {
      return NextResponse.json(
        {
          message: "Email is required",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // ========================================
    // FIND USER
    // ========================================

    const user =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
        select: {
          id: true,
          email: true,
          emailVerifiedAt: true,
        },
      });

    // ========================================
    // GENERIC RESPONSE
    // ========================================
    // Do not reveal whether an account exists.
    // ========================================

    if (!user) {
      return NextResponse.json(
        {
          message:
            "If an account exists with this email, a verification code has been sent.",
        },
        {
          status: 200,
        }
      );
    }

    // ========================================
    // ALREADY VERIFIED
    // ========================================

    if (user.emailVerifiedAt) {
      return NextResponse.json(
        {
          message:
            "This email address is already verified.",
          verified: true,
        },
        {
          status: 200,
        }
      );
    }

    // ========================================
    // CHECK RECENT CODE
    // ========================================
    // Prevent generating multiple codes
    // within 60 seconds.
    // ========================================

    const recentToken =
      await prisma.emailVerificationToken.findFirst({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (recentToken) {
      const secondsSinceCreation =
        Math.floor(
          (Date.now() -
            recentToken.createdAt.getTime()) /
            1000
        );

      if (secondsSinceCreation < 60) {
        const remainingSeconds =
          60 - secondsSinceCreation;

        return NextResponse.json(
          {
            message:
              `Please wait ${remainingSeconds} seconds before requesting another code.`,
            retryAfter: remainingSeconds,
          },
          {
            status: 429,
          }
        );
      }
    }

    // ========================================
    // GENERATE NEW 6-DIGIT CODE
    // ========================================

    const verificationCode =
      randomInt(100000, 1000000).toString();

    // ========================================
    // HASH CODE
    // ========================================

    const codeHash = createHash("sha256")
      .update(verificationCode)
      .digest("hex");

    // ========================================
    // EXPIRATION
    // 10 MINUTES
    // ========================================

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // ========================================
    // REPLACE OLD CODE
    // ========================================

    await prisma.emailVerificationToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt,
      },
    });

    // ========================================
    // SEND EMAIL
    // ========================================

    try {
      await sendVerificationEmail(
        user.email,
        verificationCode
      );
    } catch (emailError) {
      console.error(
        "RESEND VERIFICATION EMAIL ERROR:",
        emailError
      );

      // Remove the unused token if email failed.
      await prisma.emailVerificationToken.deleteMany({
        where: {
          userId: user.id,
        },
      });

      return NextResponse.json(
        {
          message:
            "Unable to send the verification email. Please try again later.",
        },
        {
          status: 500,
        }
      );
    }

    // ========================================
    // SUCCESS
    // ========================================

    return NextResponse.json(
      {
        message:
          "A new verification code has been sent to your email.",
        verificationRequired: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "RESEND VERIFICATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}