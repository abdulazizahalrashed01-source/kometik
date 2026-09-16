import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// ==========================================
// GET /api/shop/categories
// Get public categories with hierarchy
// ==========================================

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
      },

      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
        parentId: true,

        _count: {
          select: {
            products: true,
          },
        },

        children: {
          orderBy: {
            name: "asc",
          },

          select: {
            id: true,
            name: true,
            parentId: true,

            _count: {
              select: {
                products: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      categories,
    });
  } catch (error) {
    console.error(
      "GET SHOP CATEGORIES ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to load categories",
      },
      {
        status: 500,
      }
    );
  }
}
