import { NextRequest, NextResponse } from "next/server";
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
// JWT PAYLOAD
// ==========================================

type AuthToken = {
  id: string;
  role: "USER" | "ADMIN";
};

// ==========================================
// GET /api/auth/me
//
// Supports:
// Cookie: auth_token
// Authorization: Bearer <token>
// ==========================================

export async function GET(
  request: NextRequest
) {
  try {
    // ========================================
    // GET TOKEN
    // ========================================

    let token: string | undefined;

    // ----------------------------------------
    // 1. Try Authorization Bearer
    // ----------------------------------------

    const authorization =
      request.headers.get(
        "authorization"
      );

    if (
      authorization &&
      authorization.startsWith("Bearer ")
    ) {
      token =
        authorization
          .substring(7)
          .trim();
    }

    // ----------------------------------------
    // 2. Fallback to Cookie
    // ----------------------------------------

    if (!token) {
      token =
        request.cookies.get(
          "auth_token"
        )?.value;
    }

    // ----------------------------------------
    // No token
    // ----------------------------------------

    if (!token) {
      return NextResponse.json(
        {
          message: "Not authenticated",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================
    // VERIFY JWT
    // ========================================

    let decoded: AuthToken;

    try {
      decoded =
        jwt.verify(
          token,
          JWT_SECRET
        ) as AuthToken;
    } catch {
      return NextResponse.json(
        {
          message:
            "Invalid or expired token",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================
    // FIND USER
    // ========================================

    const user =
      await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

    // ========================================
    // USER NO LONGER EXISTS
    // ========================================

    if (!user) {
      return NextResponse.json(
        {
          message:
            "User not found",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================
    // RETURN CURRENT USER
    // ========================================

    return NextResponse.json(
      {
        user,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "AUTH ME ERROR:",
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
