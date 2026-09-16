import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";

import {
  AdminAuthError,
  requireAdmin,
} from "@/lib/admin-auth";

// ==========================================
// DELETE PRODUCT FROM COLLECTION
// ==========================================

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
      productId: string;
    }>;
  }
) {
  try {
    // ========================================
    // AUTH
    // ========================================

    await requireAdmin(request);

    // ========================================
    // PARAMS
    // ========================================

    const { id, productId } =
      await context.params;

    if (!id || !productId) {
      return NextResponse.json(
        {
          message:
            "Collection ID and product ID are required.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // CHECK COLLECTION
    // ========================================

    const collection =
      await prisma.collection.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          type: true,
          name: true,
        },
      });

    if (!collection) {
      return NextResponse.json(
        {
          message:
            "Collection not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================
    // ONLY MANUAL COLLECTIONS
    // ========================================

    if (
      collection.type !== "MANUAL"
    ) {
      return NextResponse.json(
        {
          message:
            "Products cannot be removed manually from a TAG collection.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // CHECK RELATION
    // ========================================

    const relation =
      await prisma.productCollection.findUnique(
        {
          where: {
            productId_collectionId: {
              productId,
              collectionId: id,
            },
          },

          select: {
            productId: true,
            collectionId: true,
          },
        }
      );

    if (!relation) {
      return NextResponse.json(
        {
          message:
            "Product is not part of this collection.",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================
    // DELETE RELATION
    // ========================================

    await prisma.productCollection.delete({
      where: {
        productId_collectionId: {
          productId,
          collectionId: id,
        },
      },
    });

    // ========================================
    // RESPONSE
    // ========================================

    return NextResponse.json({
      message:
        "Product removed from collection successfully.",
    });
  } catch (error) {
    // ========================================
    // AUTH ERROR
    // ========================================

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

    // ========================================
    // UNEXPECTED ERROR
    // ========================================

    console.error(
      "REMOVE COLLECTION PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to remove product from collection.",
      },
      {
        status: 500,
      }
    );
  }
}