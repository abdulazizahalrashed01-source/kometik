import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// GET /api/categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      categories,
    });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch categories",
      },
      {
        status: 500,
      }
    );
  }
}


// POST /api/categories
export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const name = body.name;

    // التحقق من الاسم
    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return NextResponse.json(
        {
          message: "Category name is required",
        },
        {
          status: 400,
        }
      );
    }

    // تنظيف الاسم
    const categoryName = name.trim();

    // التأكد أن التصنيف غير موجود
    const existingCategory =
      await prisma.category.findUnique({
        where: {
          name: categoryName,
        },
      });

    if (existingCategory) {
      return NextResponse.json(
        {
          message: "Category already exists",
        },
        {
          status: 409,
        }
      );
    }

    // إنشاء التصنيف
    const category =
      await prisma.category.create({
        data: {
          name: categoryName,
        },
      });

    return NextResponse.json(
      {
        category,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to create category",
      },
      {
        status: 500,
      }
    );
  }
}