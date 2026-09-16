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
// GET /api/admin/dashboard
// ==========================================

export async function GET(
  request: NextRequest
) {
  try {
    await requireAdmin(request);


    // ========================================
    // STATISTICS
    // ========================================

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      revenue,
      totalProducts,
      totalCategories,
      totalUsers,
    ] = await Promise.all([

      prisma.order.count(),

      prisma.order.count({
        where: {
          status: "PENDING",
        },
      }),

      prisma.order.count({
        where: {
          status: "PROCESSING",
        },
      }),

      prisma.order.count({
        where: {
          status: "DELIVERED",
        },
      }),

      prisma.order.aggregate({
        where: {
          status: {
            not: "CANCELLED",
          },
        },

        _sum: {
          total: true,
        },
      }),

      prisma.product.count(),

      prisma.category.count(),

      prisma.user.count({
        where: {
          role: "USER",
        },
      }),

    ]);


    // ========================================
    // RECENT ORDERS
    // ========================================

    const recentOrders =
      await prisma.order.findMany({
        orderBy: {
          createdAt: "desc",
        },

        take: 5,

        select: {
          id: true,
          customerName: true,
          customerEmail: true,
          total: true,
          status: true,
          createdAt: true,

          items: {
            select: {
              quantity: true,
            },
          },
        },
      });


    // ========================================
    // RESPONSE
    // ========================================

    return NextResponse.json({
      stats: {
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,

        totalProducts,
        totalCategories,
        totalUsers,

        totalRevenue:
          revenue._sum.total ?? 0,
      },

      recentOrders,
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
      "GET DASHBOARD ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load dashboard",
      },
      {
        status: 500,
      }
    );
  }
}