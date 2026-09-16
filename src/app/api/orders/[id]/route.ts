import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/user";

// ==========================================
// GET /api/orders/[id]
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
    // ========================================
    // CURRENT USER
    // ========================================

    const user =
      await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Authentication required",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================
    // GET ORDER ID
    // ========================================

    const { id } =
      await context.params;

    // ========================================
    // GET ORDER
    // Only current user's order
    // ========================================

    const order =
      await prisma.order.findFirst({
        where: {
          id,
          userId: user.id,
        },

        select: {
          id: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          shippingAddress: true,
          shippingCity: true,
          shippingPostalCode: true,
          subtotal: true,
          shipping: true,
          total: true,
          status: true,
          createdAt: true,
          updatedAt: true,

          items: {
            select: {
              id: true,
              productId: true,
              name: true,
              price: true,
              quantity: true,
            },
          },
        },
      });

    // ========================================
    // ORDER NOT FOUND
    // ========================================

    if (!order) {
      return NextResponse.json(
        {
          message:
            "Order not found",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================
    // RESPONSE
    // ========================================

    return NextResponse.json(
      {
        order,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load order",
      },
      {
        status: 500,
      }
    );
  }
}