import { NextRequest, NextResponse } from "next/server";

import {
  requireAdmin,
  AdminAuthError,
} from "@/lib/admin-auth";


// ==========================================
// GET /api/admin/auth/me
// ==========================================

export async function GET(
  request: NextRequest
) {
  try {

    const admin =
      await requireAdmin(request);


    return NextResponse.json(
      {
        admin,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    if (
      error instanceof AdminAuthError
    ) {
      return NextResponse.json(
        {
          message:
            error.message,
        },
        {
          status: error.status,
        }
      );
    }


    console.error(
      "ADMIN ME ERROR:",
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