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
// TYPES
// ==========================================

type AuthToken = {
  id: string;
  role: "USER" | "ADMIN";
};


export type CurrentUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
};


// ==========================================
// GET CURRENT USER
// ==========================================

export async function getCurrentUser(
  request: NextRequest
): Promise<CurrentUser | null> {

  const token =
    request.cookies.get(
      "auth_token"
    )?.value;


  if (!token) {
    return null;
  }


  let decoded: AuthToken;

  try {

    decoded =
      jwt.verify(
        token,
        JWT_SECRET
      ) as AuthToken;

  } catch {

    return null;

  }


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


  if (!user) {
    return null;
  }


  return user;
}


// ==========================================
// REQUIRE AUTH
// ==========================================

export async function requireAuth(
  request: NextRequest
): Promise<CurrentUser> {

  const user =
    await getCurrentUser(request);


  if (!user) {
    throw new AuthError(
      "Unauthorized",
      401
    );
  }


  return user;
}


// ==========================================
// REQUIRE ADMIN
// ==========================================

export async function requireAdmin(
  request: NextRequest
): Promise<CurrentUser> {

  const user =
    await getCurrentUser(request);


  if (!user) {
    throw new AuthError(
      "Unauthorized",
      401
    );
  }


  if (user.role !== "ADMIN") {
    throw new AuthError(
      "Forbidden",
      403
    );
  }


  return user;
}


// ==========================================
// AUTH ERROR
// ==========================================

export class AuthError extends Error {

  status: 401 | 403;

  constructor(
    message: string,
    status: 401 | 403
  ) {
    super(message);

    this.name = "AuthError";

    this.status = status;
  }
}