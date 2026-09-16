import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";


// ==========================================
// GET /api/shop/products/[id]
// Get single product
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

    const { id } =
      await context.params;


    const product =
      await prisma.product.findUnique({

        where: {
          id,
        },

        select: {

          id: true,

          name: true,

          description: true,

          price: true,

          imageUrl: true,

          categoryId: true,

          category: {
            select: {
              id: true,
              name: true,
            },
          },

          createdAt: true,

          updatedAt: true,

        },

      });


    if (!product) {

      return NextResponse.json(
        {
          message:
            "Product not found",
        },
        {
          status: 404,
        }
      );

    }


    return NextResponse.json({
      product,
    });

  } catch (error) {

    console.error(
      "GET SHOP PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load product",
      },
      {
        status: 500,
      }
    );

  }
}