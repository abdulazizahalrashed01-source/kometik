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
// GET /api/admin/orders
// Get all orders
// ==========================================

export async function GET(
  request: NextRequest
) {
  try {
    await requireAdmin(request);

    const orders =
      await prisma.order.findMany({
        orderBy: {
          createdAt: "desc",
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

          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

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

    return NextResponse.json({
      orders,
    });

  } catch (error) {

    if (
      error instanceof AdminAuthError
    ) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: error.status,
        }
      );
    }

    console.error(
      "GET ADMIN ORDERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to load orders",
      },
      {
        status: 500,
      }
    );
  }
}