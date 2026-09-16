  import { NextRequest } from "next/server";
  import { cookies } from "next/headers";
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
  // USER TOKEN
  // ==========================================

  type UserToken = {
    id: string;
    role: "USER" | "ADMIN";
  };

  // ==========================================
  // CURRENT USER
  // ==========================================

  export type CurrentUser = {
    id: string;
    name: string | null;
    email: string;
    role: "USER" | "ADMIN";
  };

  // ==========================================
  // GET CURRENT USER
  //
  // Supports:
  // 1. Authorization: Bearer <token>
  // 2. auth_token Cookie
  // ==========================================

  export async function getCurrentUser(
    request?: NextRequest
  ): Promise<CurrentUser | null> {
    let token: string | undefined;

    // ========================================
    // 1. TRY BEARER TOKEN
    // ========================================

    if (request) {
      const authorization =
        request.headers.get("authorization");

      if (
        authorization?.startsWith("Bearer ")
      ) {
        token = authorization
          .substring(7)
          .trim();
      }
    }

    // ========================================
    // 2. FALLBACK TO COOKIE
    // ========================================

    if (!token) {
      const cookieStore =
        await cookies();

      token =
        cookieStore.get(
          "auth_token"
        )?.value;
    }

    // ========================================
    // NO TOKEN
    // ========================================

    if (!token) {
      return null;
    }

    // ========================================
    // VERIFY JWT
    // ========================================

    let decoded: UserToken;

    try {
      const verified =
        jwt.verify(
          token,
          JWT_SECRET
        );

      if (
        typeof verified === "string" ||
        !verified ||
        typeof verified !== "object"
      ) {
        return null;
      }

      if (
        typeof verified.id !== "string"
      ) {
        return null;
      }

      if (
        verified.role !== "USER" &&
        verified.role !== "ADMIN"
      ) {
        return null;
      }

      decoded = {
        id: verified.id,
        role: verified.role,
      };
    } catch {
      return null;
    }

    // ========================================
    // GET USER FROM DATABASE
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

    if (!user) {
      return null;
    }

    // ========================================
    // SECURITY CHECK
    // ========================================

    if (
      user.role !== decoded.role
    ) {
      return null;
    }

    // ========================================
    // RETURN CURRENT USER
    // ========================================

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }