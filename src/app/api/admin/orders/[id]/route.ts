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
// TYPES
// ==========================================

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";


// ==========================================
// VALID STATUS TRANSITIONS
// ==========================================

const allowedTransitions: Record<
  OrderStatus,
  OrderStatus[]
> = {
  PENDING: [
    "CONFIRMED",
    "CANCELLED",
  ],

  CONFIRMED: [
    "PROCESSING",
    "CANCELLED",
  ],

  PROCESSING: [
    "SHIPPED",
    "CANCELLED",
  ],

  SHIPPED: [
    "DELIVERED",
  ],

  DELIVERED: [],

  CANCELLED: [],
};


// ==========================================
// GET /api/admin/orders/[id]
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

    const order =
      await prisma.order.findUnique({
        where: {
          id,
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

    return NextResponse.json({
      order,
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
      "GET ADMIN ORDER ERROR:",
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


// ==========================================
// PATCH /api/admin/orders/[id]
// Update order status
// ==========================================

export async function PATCH(
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
    // READ BODY
    // ========================================

    const body =
      await request.json();

    const newStatus =
      body.status as OrderStatus;


    // ========================================
    // VALID STATUS
    // ========================================

    const validStatuses: OrderStatus[] = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];


    if (
      !validStatuses.includes(
        newStatus
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid order status",
        },
        {
          status: 400,
        }
      );
    }


    // ========================================
    // GET CURRENT ORDER
    // ========================================

    const existingOrder =
      await prisma.order.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          status: true,
        },
      });


    if (!existingOrder) {
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


    const currentStatus =
      existingOrder.status as OrderStatus;


    // ========================================
    // SAME STATUS
    // ========================================

    if (
      currentStatus ===
      newStatus
    ) {
      return NextResponse.json({
        message:
          "Order status is already set",

        order: {
          id:
            existingOrder.id,

          status:
            currentStatus,
        },
      });
    }


    // ========================================
    // CHECK TRANSITION
    // ========================================

    const allowed =
      allowedTransitions[
        currentStatus
      ];


    if (
      !allowed.includes(
        newStatus
      )
    ) {
      return NextResponse.json(
        {
          message:
            `Cannot change order status from ${currentStatus} to ${newStatus}`,
        },
        {
          status: 400,
        }
      );
    }


    // ========================================
    // UPDATE ORDER
    // ========================================

    const order =
      await prisma.order.update({
        where: {
          id,
        },

        data: {
          status:
            newStatus,
        },

        select: {
          id: true,
          status: true,
          updatedAt: true,
        },
      });


    return NextResponse.json({
      message:
        "Order status updated successfully",

      order,
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
      "UPDATE ADMIN ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update order",
      },
      {
        status: 500,
      }
    );
  }
}