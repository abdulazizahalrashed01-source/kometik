import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createHash, randomInt } from "crypto";

import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mailer";

// ==========================================
// POST /api/auth/register
// ==========================================

export async function POST(request: NextRequest) {
  try {
    // ========================================
    // READ BODY
    // ========================================

    const body = await request.json();

    const name = body.name;
    const email = body.email;
    const password = body.password;

    // ========================================
    // VALIDATE NAME
    // ========================================

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return NextResponse.json(
        {
          message: "Name is required",
        },
        {
          status: 400,
        }
      );
    }

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
    // VALIDATE PASSWORD
    // ========================================

    if (
      typeof password !== "string" ||
      !password
    ) {
      return NextResponse.json(
        {
          message: "Password is required",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // PASSWORD LENGTH
    // ========================================

    if (password.length < 8) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 8 characters",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // NORMALIZE VALUES
    // ========================================

    const normalizedName = name.trim();
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // ========================================
    // CHECK EXISTING USER
    // ========================================

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          message:
            "An account with this email already exists",
        },
        {
          status: 409,
        }
      );
    }

    // ========================================
    // HASH PASSWORD
    // ========================================

    const hashedPassword =
      await bcrypt.hash(password, 12);

    // ========================================
    // CREATE USER
    // ========================================

    const user =
      await prisma.user.create({
        data: {
          name: normalizedName,
          email: normalizedEmail,
          password: hashedPassword,
          role: "USER",
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerifiedAt: true,
        },
      });

    try {
      // ======================================
      // GENERATE 6-DIGIT VERIFICATION CODE
      // ======================================

      const verificationCode =
        randomInt(100000, 1000000).toString();

      // ======================================
      // HASH VERIFICATION CODE
      // ======================================

      const codeHash = createHash("sha256")
        .update(verificationCode)
        .digest("hex");

      // ======================================
      // EXPIRATION - 10 MINUTES
      // ======================================

      const expiresAt = new Date(
        Date.now() + 10 * 60 * 1000
      );

      // ======================================
      // REMOVE OLD VERIFICATION TOKENS
      // ======================================

      await prisma.emailVerificationToken.deleteMany({
        where: {
          userId: user.id,
        },
      });

      // ======================================
      // CREATE VERIFICATION TOKEN
      // ======================================

      await prisma.emailVerificationToken.create({
        data: {
          userId: user.id,
          codeHash,
          expiresAt,
        },
      });

      // ======================================
      // SEND VERIFICATION EMAIL
      // ======================================

      await sendVerificationEmail(
        user.email,
        verificationCode
      );

      // ======================================
      // SUCCESS
      // NO JWT
      // NO AUTH COOKIE
      // ======================================

      return NextResponse.json(
        {
          message:
            "Account created successfully. Please verify your email.",
          verificationRequired: true,
          email: user.email,
        },
        {
          status: 201,
        }
      );
    } catch (emailError) {
      console.error(
        "VERIFICATION EMAIL ERROR:",
        emailError
      );

      // ======================================
      // CLEANUP USER IF EMAIL CANNOT BE SENT
      // ======================================

      await prisma.user.delete({
        where: {
          id: user.id,
        },
      });

      return NextResponse.json(
        {
          message:
            "Account could not be created because the verification email could not be sent.",
        },
        {
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error(
      "REGISTER ERROR:",
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
