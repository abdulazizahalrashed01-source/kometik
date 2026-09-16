import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
// POST /api/auth/login
// USER LOGIN ONLY
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
    const password = body.password;

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
    // NORMALIZE EMAIL
    // ========================================

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
      });

    // ========================================
    // USER NOT FOUND
    // ========================================

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================
    // ADMIN CANNOT USE USER LOGIN
    // ========================================

    if (user.role !== "USER") {
      return NextResponse.json(
        {
          message:
            "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================
    // CHECK PASSWORD
    // ========================================

    const passwordValid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordValid) {
      return NextResponse.json(
        {
          message:
            "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================
    // CHECK EMAIL VERIFICATION
    // ========================================
    // No JWT and no auth cookie before
    // email verification.
    // ========================================

    if (!user.emailVerifiedAt) {
      return NextResponse.json(
        {
          message:
            "Please verify your email address before signing in.",
          verificationRequired: true,
          email: user.email,
        },
        {
          status: 403,
        }
      );
    }

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
    // CREATE RESPONSE
    // ========================================

    const response =
      NextResponse.json(
        {
          message: "Login successful",
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
    // WEB COOKIE
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
      "USER LOGIN ERROR:",
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