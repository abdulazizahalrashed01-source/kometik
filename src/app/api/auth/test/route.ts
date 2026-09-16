import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentUser,
  requireAuth,
  requireAdmin,
} from "@/lib/auth";


// ==========================================
// GET /api/auth/test
// ==========================================

export async function GET(
  request: NextRequest
) {
  try {

    // ----------------------------------------
    // Current user
    // ----------------------------------------

    const currentUser =
      await getCurrentUser(request);


    // ----------------------------------------
    // Authentication
    // ----------------------------------------

    let authenticatedUser = null;

    try {

      authenticatedUser =
        await requireAuth(request);

    } catch {

      authenticatedUser = null;

    }


    // ----------------------------------------
    // Admin
    // ----------------------------------------

    let adminUser = null;

    try {

      adminUser =
        await requireAdmin(request);

    } catch {

      adminUser = null;

    }


    // ----------------------------------------
    // Response
    // ----------------------------------------

    return NextResponse.json({
      authenticated:
        !!authenticatedUser,

      isAdmin:
        !!adminUser,

      currentUser,
      authenticatedUser,
      adminUser,
    });

  } catch (error) {

    console.error(
      "AUTH TEST ERROR:",
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