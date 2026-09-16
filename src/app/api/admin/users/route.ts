import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import {
  requireAdmin,
  AdminAuthError,
} from "@/lib/admin-auth";


// ==========================================
// GET /api/admin/users
// ==========================================

export async function GET(
  request: NextRequest
) {
  try {
    await requireAdmin(request);

    const users =
      await prisma.user.findMany({
        where: {
          role: "USER",
        },

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
          createdAt: true,

          _count: {
            select: {
              orders: true,
            },
          },
        },
      });

    return NextResponse.json({
      users,
    });

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
          status:
            error.status,
        }
      );
    }

    console.error(
      "GET ADMIN USERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load users",
      },
      {
        status: 500,
      }
    );
  }
}