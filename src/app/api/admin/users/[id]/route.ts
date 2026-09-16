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
// GET /api/admin/users/[id]
// ==========================================

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await requireAdmin(request);

    const { id } =
      await context.params;


    // ========================================
    // GET USER
    // ========================================

    const user =
      await prisma.user.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
          role: true,
          createdAt: true,
          updatedAt: true,

          _count: {
            select: {
              orders: true,
            },
          },

          orders: {
            orderBy: {
              createdAt: "desc",
            },

            take: 10,

            select: {
              id: true,
              total: true,
              status: true,
              createdAt: true,

              items: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  quantity: true,
                },
              },
            },
          },
        },
      });


    // ========================================
    // USER NOT FOUND
    // ========================================

    if (!user) {
      return NextResponse.json(
        {
          message:
            "User not found",
        },
        {
          status: 404,
        }
      );
    }


    // ========================================
    // ONLY NORMAL USERS
    // ========================================

    if (user.role !== "USER") {
      return NextResponse.json(
        {
          message:
            "Customer account not found",
        },
        {
          status: 404,
        }
      );
    }


    return NextResponse.json({
      user,
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
      "GET ADMIN USER ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load user",
      },
      {
        status: 500,
      }
    );
  }
}