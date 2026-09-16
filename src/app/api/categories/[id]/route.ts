import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};


// PATCH /api/categories/:id
export async function PATCH(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const name = body.name;

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

    const categoryName = name.trim();

    const existingCategory =
      await prisma.category.findFirst({
        where: {
          name: categoryName,
          NOT: {
            id,
          },
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

    const category =
      await prisma.category.update({
        where: {
          id,
        },
        data: {
          name: categoryName,
        },
      });

    return NextResponse.json({
      category,
    });
  } catch (error) {
    console.error(
      "UPDATE CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to update category",
      },
      {
        status: 500,
      }
    );
  }
}


// DELETE /api/categories/:id
export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const category =
      await prisma.category.delete({
        where: {
          id,
        },
      });

    return NextResponse.json({
      message: "Category deleted successfully",
      category,
    });
  } catch (error) {
    console.error(
      "DELETE CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to delete category",
      },
      {
        status: 500,
      }
    );
  }
}