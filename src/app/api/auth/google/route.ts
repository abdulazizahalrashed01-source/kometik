import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";

// ==========================================
// CONFIG
// ==========================================

const JWT_SECRET =
  process.env.JWT_SECRET as string;

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not configured"
  );
}

if (!GOOGLE_CLIENT_ID) {
  throw new Error(
    "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured"
  );
}

const googleClient =
  new OAuth2Client(
    GOOGLE_CLIENT_ID
  );

// ==========================================
// POST /api/auth/google
// GOOGLE USER LOGIN / REGISTER
// ==========================================

export async function POST(
  request: NextRequest
) {
  try {
    // ========================================
    // READ BODY
    // ========================================

    const body =
      await request.json();

    const credential =
      body.credential;

    // ========================================
    // VALIDATE CREDENTIAL
    // ========================================

    if (
      typeof credential !== "string" ||
      !credential
    ) {
      return NextResponse.json(
        {
          message:
            "Google credential is required",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // VERIFY GOOGLE ID TOKEN
    // ========================================

    const ticket =
      await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });

    const payload =
      ticket.getPayload();

    if (!payload) {
      return NextResponse.json(
        {
          message:
            "Invalid Google credential",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================
    // GOOGLE DATA
    // ========================================

    const googleId =
      payload.sub;

    const email =
      payload.email
        ?.trim()
        .toLowerCase();

    const name =
      payload.name ||
      null;

    const picture =
      payload.picture ||
      null;

    const emailVerified =
      payload.email_verified === true;

    // ========================================
    // VALIDATE GOOGLE ACCOUNT
    // ========================================

    if (
      !googleId ||
      !email
    ) {
      return NextResponse.json(
        {
          message:
            "Google account information is incomplete",
        },
        {
          status: 400,
        }
      );
    }

    if (!emailVerified) {
      return NextResponse.json(
        {
          message:
            "Your Google email address must be verified.",
        },
        {
          status: 403,
        }
      );
    }

    // ========================================
    // FIND BY GOOGLE ID
    // ========================================

    let user =
      await prisma.user.findUnique({
        where: {
          googleId,
        },
      });

    // ========================================
    // FIND BY EMAIL
    // ========================================

    if (!user) {
      user =
        await prisma.user.findUnique({
          where: {
            email,
          },
        });
    }

    // ========================================
    // EXISTING USER
    // ========================================

    if (user) {
      // --------------------------------------
      // ADMIN CANNOT USE USER GOOGLE LOGIN
      // --------------------------------------

      if (user.role !== "USER") {
        return NextResponse.json(
          {
            message:
              "Invalid Google account",
          },
          {
            status: 401,
          }
        );
      }

      // --------------------------------------
      // LINK GOOGLE ACCOUNT
      // --------------------------------------

      user =
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            googleId,
            emailVerifiedAt:
              user.emailVerifiedAt ||
              new Date(),
            name:
              user.name ||
              name,
            imageUrl:
              user.imageUrl ||
              picture,
          },
        });
    }

    // ========================================
    // CREATE NEW USER
    // ========================================

    if (!user) {
      // --------------------------------------
      // GENERATE UNUSABLE PASSWORD
      // --------------------------------------

      const randomPassword =
        crypto.randomBytes(32)
          .toString("hex");

      const passwordHash =
        await bcrypt.hash(
          randomPassword,
          12
        );

      user =
        await prisma.user.create({
          data: {
            name,
            email,
            password: passwordHash,
            googleId,
            emailVerifiedAt:
              new Date(),
            imageUrl: picture,
            role: "USER",
          },
        });
    }

    // ========================================
    // CREATE JWT
    // ========================================

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

    // ========================================
    // RESPONSE
    // ========================================

    const response =
      NextResponse.json(
        {
          message:
            "Google authentication successful",
          token,

          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            imageUrl:
              user.imageUrl,
          },
        },
        {
          status: 200,
        }
      );

    // ========================================
    // AUTH COOKIE
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
      "GOOGLE AUTH ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Google authentication failed",
      },
      {
        status: 500,
      }
    );
  }
}