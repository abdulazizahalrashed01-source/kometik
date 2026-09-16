import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// ==========================================
// GET /api/products
// ==========================================

export async function GET() {
  try {
    const products =
      await prisma.product.findMany({
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      products,
    });
  } catch (error) {
    console.error(
      "GET PRODUCTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to fetch products",
      },
      {
        status: 500,
      }
    );
  }
}


// ==========================================
// POST /api/products
// ==========================================

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const {
      name,
      description,
      price,
      imageUrl,
      categoryId,
    } = body;


    // ----------------------------------------
    // Validate name
    // ----------------------------------------

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Product name is required",
        },
        {
          status: 400,
        }
      );
    }


    // ----------------------------------------
    // Validate price
    // ----------------------------------------

    if (
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return NextResponse.json(
        {
          message: "Invalid price",
        },
        {
          status: 400,
        }
      );
    }


    // ----------------------------------------
    // Validate category
    // ----------------------------------------

    if (
      typeof categoryId !== "string" ||
      !categoryId
    ) {
      return NextResponse.json(
        {
          message: "Category is required",
        },
        {
          status: 400,
        }
      );
    }


    // ----------------------------------------
    // Check category exists
    // ----------------------------------------

    const category =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },
      });

    if (!category) {
      return NextResponse.json(
        {
          message:
            "Category not found",
        },
        {
          status: 404,
        }
      );
    }


    // ----------------------------------------
    // Create product
    // ----------------------------------------

    const product =
      await prisma.product.create({
        data: {
          name: name.trim(),

          description:
            typeof description === "string"
              ? description.trim() || null
              : null,

          price,

          imageUrl:
            typeof imageUrl === "string"
              ? imageUrl.trim() || null
              : null,

          categoryId,
        },

        include: {
          category: true,
        },
      });


    return NextResponse.json(
      {
        product,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to create product",
      },
      {
        status: 500,
      }
    );
  }
}