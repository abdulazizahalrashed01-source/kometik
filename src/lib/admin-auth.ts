import { NextRequest } from "next/server";
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
// ADMIN TOKEN
// ==========================================

type AdminToken = {
  id: string;
  role: "ADMIN";
};

// ==========================================
// ADMIN USER
// ==========================================

export type AdminUser = {
  id: string;
  email: string;
  role: "ADMIN";
};

// ==========================================
// GET TOKEN
// ==========================================

function getAdminToken(
  request: NextRequest
): string | null {
  // ----------------------------------------
  // Preferred admin cookie
  // ----------------------------------------

  const adminToken =
    request.cookies.get(
      "admin_token"
    )?.value;

  if (adminToken) {
    return adminToken;
  }

  // ----------------------------------------
  // Fallback to normal auth cookie
  // ----------------------------------------

  const authToken =
    request.cookies.get(
      "auth_token"
    )?.value;

  if (authToken) {
    return authToken;
  }

  return null;
}

// ==========================================
// GET CURRENT ADMIN
// ==========================================

export async function getCurrentAdmin(
  request: NextRequest
): Promise<AdminUser | null> {
  // ----------------------------------------
  // Get token
  // ----------------------------------------

  const token =
    getAdminToken(request);

  if (!token) {
    return null;
  }

  // ----------------------------------------
  // Verify JWT
  // ----------------------------------------

  let decoded: AdminToken;

  try {
    decoded =
      jwt.verify(
        token,
        JWT_SECRET
      ) as AdminToken;
  } catch {
    return null;
  }

  // ----------------------------------------
  // Validate JWT structure
  // ----------------------------------------

  if (
    !decoded ||
    typeof decoded.id !== "string" ||
    decoded.role !== "ADMIN"
  ) {
    return null;
  }

  // ----------------------------------------
  // Find user in database
  // ----------------------------------------

  const user =
    await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },

      select: {
        id: true,
        email: true,
        role: true,
      },
    });

  // ----------------------------------------
  // User does not exist
  // ----------------------------------------

  if (!user) {
    return null;
  }

  // ----------------------------------------
  // Database role check
  // ----------------------------------------

  if (user.role !== "ADMIN") {
    return null;
  }

  // ----------------------------------------
  // Return admin
  // ----------------------------------------

  return {
    id: user.id,
    email: user.email,
    role: "ADMIN",
  };
}

// ==========================================
// REQUIRE ADMIN
// ==========================================

export async function requireAdmin(
  request: NextRequest
): Promise<AdminUser> {
  const admin =
    await getCurrentAdmin(request);

  if (!admin) {
    throw new AdminAuthError(
      "Admin authentication required",
      401
    );
  }

  return admin;
}

// ==========================================
// ADMIN AUTH ERROR
// ==========================================

export class AdminAuthError extends Error {
  status: 401 | 403;

  constructor(
    message: string,
    status: 401 | 403
  ) {
    super(message);

    this.name =
      "AdminAuthError";

    this.status =
      status;
  }
}   