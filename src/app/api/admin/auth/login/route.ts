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
// POST /api/admin/auth/login
// ==========================================

export async function POST(
  request: NextRequest
) {
  try {

    // ----------------------------------------
    // Read request body
    // ----------------------------------------

    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";


    // ----------------------------------------
    // Validate input
    // ----------------------------------------

    if (!email || !password) {
      return NextResponse.json(
        {
          message:
            "Email and password are required",
        },
        {
          status: 400,
        }
      );
    }


    // ----------------------------------------
    // Find user
    // ----------------------------------------

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });


    // ----------------------------------------
    // User not found
    // ----------------------------------------

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


    // ----------------------------------------
    // Check ADMIN role
    // ----------------------------------------

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          message:
            "You do not have admin access",
        },
        {
          status: 403,
        }
      );
    }


    // ----------------------------------------
    // Check password
    // ----------------------------------------

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


    // ----------------------------------------
    // Create JWT
    // ----------------------------------------

    const token =
      jwt.sign(
        {
          id: user.id,
          role: user.role,
        },
        JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );


    // ----------------------------------------
    // Response
    // ----------------------------------------

    const response =
      NextResponse.json(
        {
          message:
            "Admin login successful",

          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
        },
        {
          status: 200,
        }
      );


    // ----------------------------------------
    // Set authentication cookie
    // ----------------------------------------

    response.cookies.set(
      "admin_token",
      token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      }
    );


    return response;

  } catch (error) {

    console.error(
      "ADMIN LOGIN ERROR:",
      error
    );


    return NextResponse.json(
      {
        message:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}