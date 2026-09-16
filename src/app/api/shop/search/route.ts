import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest
) {
  try {
    const search =
      request.nextUrl.searchParams
        .get("q")
        ?.trim();

    // لا نبحث إذا كان النص قصيرًا جدًا
    if (!search || search.length < 1) {
      return NextResponse.json({
        products: [],
      });
    }

    const products =
      await prisma.product.findMany({
        where: {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 6,

        select: {
          id: true,
          name: true,
          price: true,
          imageUrl: true,
          imagePublicId: true,

          category: {
            select: {
              name: true,
            },
          },
        },
      });

    return NextResponse.json({
      products,
    });
  } catch (error) {
    console.error(
      "SEARCH API ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "حدث خطأ أثناء البحث.",
        products: [],
      },
      {
        status: 500,
      }
    );
  }
}