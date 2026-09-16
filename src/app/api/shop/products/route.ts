import {
  NextRequest,
  NextResponse,
} from "next/server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ==========================================
// GET /api/shop/products
//
// Supports:
// ?categoryId=
// ?search=
// ?collection=<slug>
// ==========================================

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const categoryId =
      searchParams.get("categoryId");

    const search =
      searchParams.get("search");

    const collectionSlug =
      searchParams.get("collection");

    // ========================================
    // BUILD PRODUCT FILTER
    // ========================================

    const where: Prisma.ProductWhereInput =
      {};

    // ========================================
    // CATEGORY FILTER
    // ========================================

    if (categoryId?.trim()) {
      where.categoryId =
        categoryId.trim();
    }

    // ========================================
    // SEARCH FILTER
    // ========================================

    if (search?.trim()) {
      const searchValue =
        search.trim();

      where.OR = [
        {
          name: {
            contains: searchValue,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: searchValue,
            mode: "insensitive",
          },
        },
      ];
    }

    // ========================================
    // COLLECTION FILTER
    // ========================================

    if (collectionSlug?.trim()) {
      const normalizedSlug =
        collectionSlug.trim();

      const collection =
        await prisma.collection.findUnique({
          where: {
            slug: normalizedSlug,
          },

          select: {
            id: true,
            type: true,
            tagId: true,
            active: true,
          },
        });

      // --------------------------------------
      // COLLECTION NOT FOUND
      // --------------------------------------

      if (!collection) {
        return NextResponse.json(
          {
            message:
              "Collection not found",
          },
          {
            status: 404,
          }
        );
      }

      // --------------------------------------
      // COLLECTION INACTIVE
      // --------------------------------------

      if (!collection.active) {
        return NextResponse.json({
          products: [],
        });
      }

      // --------------------------------------
      // TAG COLLECTION
      // --------------------------------------

      if (collection.type === "TAG") {
        if (!collection.tagId) {
          return NextResponse.json({
            products: [],
          });
        }

        where.tags = {
          some: {
            tagId: collection.tagId,
          },
        };
      }

      // --------------------------------------
      // MANUAL COLLECTION
      // --------------------------------------

      if (
        collection.type === "MANUAL"
      ) {
        where.collections = {
          some: {
            collectionId:
              collection.id,
          },
        };
      }
    }

    // ========================================
    // GET PRODUCTS
    // ========================================

    const products =
      await prisma.product.findMany({
        where,

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          stock: true,
          imageUrl: true,
          imagePublicId: true,

          categoryId: true,

          category: {
            select: {
              id: true,
              name: true,
            },
          },

          createdAt: true,
        },
      });

    // ========================================
    // RESPONSE
    // ========================================

    return NextResponse.json({
      products,
    });
  } catch (error) {
    console.error(
      "GET SHOP PRODUCTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load products",
      },
      {
        status: 500,
      }
    );
  }
}