import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createHash } from "crypto";

import { prisma } from "@/lib/prisma";

// ==========================================
// JWT SECRET
// ==========================================

const JWT_SECRET =
  process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not configured"
  );
}

// ==========================================
// POST /api/auth/verify-email
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
    const code = body.code;

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

    // ========================================
    // VALIDATE CODE
    // ========================================

    if (
      typeof code !== "string" ||
      !/^\d{6}$/.test(code.trim())
    ) {
      return NextResponse.json(
        {
          message:
            "Verification code must be 6 digits",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedCode =
      code.trim();

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
          name: true,
          email: true,
          role: true,
          emailVerifiedAt: true,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Invalid verification code",
        },
        {
          status: 400,
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
            "Email is already verified",
          verified: true,
        },
        {
          status: 200,
        }
      );
    }

    // ========================================
    // FIND VERIFICATION TOKEN
    // ========================================

    const verificationToken =
      await prisma.emailVerificationToken.findFirst({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (!verificationToken) {
      return NextResponse.json(
        {
          message:
            "Verification code is invalid or expired",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // CHECK EXPIRATION
    // ========================================

    if (
      verificationToken.expiresAt.getTime() <
      Date.now()
    ) {
      await prisma.emailVerificationToken.delete({
        where: {
          id: verificationToken.id,
        },
      });

      return NextResponse.json(
        {
          message:
            "Verification code has expired",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // HASH PROVIDED CODE
    // ========================================

    const codeHash = createHash("sha256")
      .update(normalizedCode)
      .digest("hex");

    // ========================================
    // COMPARE HASH
    // ========================================

    if (
      codeHash !==
      verificationToken.codeHash
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid verification code",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // VERIFY USER + DELETE CODE
    // ========================================

    const verifiedAt = new Date();

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailVerifiedAt: verifiedAt,
        },
      }),

      prisma.emailVerificationToken.delete({
        where: {
          id: verificationToken.id,
        },
      }),
    ]);

    // ========================================
    // CREATE JWT
    // ========================================

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // ========================================
    // RESPONSE
    // ========================================

    const response =
      NextResponse.json(
        {
          message:
            "Email verified successfully",
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
        {
          status: 200,
        }
      );

    // ========================================
    // SET AUTH COOKIE
    // ========================================

    response.cookies.set(
      "auth_token",
      token,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        maxAge:
          60 * 60 * 24 * 7,

        path: "/",
      }
    );

    return response;
  } catch (error) {
    console.error(
      "VERIFY EMAIL ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}
