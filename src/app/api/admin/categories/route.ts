import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import {
  requireAdmin,
  AdminAuthError,
} from "@/lib/admin-auth";

// ==========================================
// GET /api/admin/categories
// Get all categories
// ==========================================

export async function GET(
  request: NextRequest
) {
  try {
    await requireAdmin(request);

    const categories =
      await prisma.category.findMany({
        orderBy: {
          name: "asc",
        },

        include: {
          parent: {
            select: {
              id: true,
              name: true,
              parentId: true,
            },
          },

          _count: {
            select: {
              products: true,
              children: true,
            },
          },
        },
      });

    return NextResponse.json({
      categories,
    });

  } catch (error) {

    if (error instanceof AdminAuthError) {
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
      "GET CATEGORIES ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load categories",
      },
      {
        status: 500,
      }
    );
  }
}


// ==========================================
// POST /api/admin/categories
// Create new category
// ==========================================

export async function POST(
  request: NextRequest
) {
  try {

    await requireAdmin(request);

    const body =
      await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const parentId =
      typeof body.parentId === "string" &&
      body.parentId.trim()
        ? body.parentId.trim()
        : null;

    // ----------------------------------------
    // Validate name
    // ----------------------------------------

    if (!name) {
      return NextResponse.json(
        {
          message:
            "Category name is required",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------
    // Validate parent
    // ----------------------------------------

    if (parentId) {

      const parent =
        await prisma.category.findUnique({
          where: {
            id: parentId,
          },
        });

      if (!parent) {
        return NextResponse.json(
          {
            message:
              "Parent category not found",
          },
          {
            status: 404,
          }
        );
      }
    }

    // ----------------------------------------
    // Check duplicate
    // ----------------------------------------

    const existingCategory =
      await prisma.category.findUnique({
        where: {
          name,
        },
      });

    if (existingCategory) {
      return NextResponse.json(
        {
          message:
            "Category already exists",
        },
        {
          status: 409,
        }
      );
    }

    // ----------------------------------------
    // Create
    // ----------------------------------------

    const category =
      await prisma.category.create({
        data: {
          name,
          parentId,
        },

        include: {
          parent: {
            select: {
              id: true,
              name: true,
            },
          },

          _count: {
            select: {
              products: true,
              children: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        message:
          "Category created successfully",

        category,
      },
      {
        status: 201,
      }
    );

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
          status: error.status,
        }
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          message:
            "Category already exists",
        },
        {
          status: 409,
        }
      );
    }

    console.error(
      "CREATE CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to create category",
      },
      {
        status: 500,
      }
    );
  }
}
