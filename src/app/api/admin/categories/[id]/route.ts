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
// GET /api/admin/categories/[id]
// Get single category
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

    const category =
      await prisma.category.findUnique({
        where: {
          id,
        },

        include: {
          parent: {
            select: {
              id: true,
              name: true,
              parentId: true,
            },
          },

          children: {
            select: {
              id: true,
              name: true,
              parentId: true,
            },

            orderBy: {
              name: "asc",
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

    return NextResponse.json({
      category,
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
          status: error.status,
        }
      );
    }

    console.error(
      "GET CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load category",
      },
      {
        status: 500,
      }
    );
  }
}


// ==========================================
// PATCH /api/admin/categories/[id]
// Update category
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

    // ----------------------------------------
    // Read body
    // ----------------------------------------

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
    // Check category exists
    // ----------------------------------------

    const existingCategory =
      await prisma.category.findUnique({
        where: {
          id,
        },
      });

    if (!existingCategory) {

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
    // Category cannot be its own parent
    // ----------------------------------------

    if (parentId === id) {

      return NextResponse.json(
        {
          message:
            "A category cannot be its own parent",
        },
        {
          status: 400,
        }
      );

    }

    // ----------------------------------------
    // Check parent exists
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
    // Prevent circular hierarchy
    // ----------------------------------------

    if (parentId) {

      let currentParentId:
        string | null = parentId;

      const visited =
        new Set<string>();

      while (currentParentId) {

        if (
          visited.has(
            currentParentId
          )
        ) {
          break;
        }

        visited.add(
          currentParentId
        );

        if (
          currentParentId === id
        ) {

          return NextResponse.json(
            {
              message:
                "Cannot move a category under one of its descendants",
            },
            {
              status: 400,
            }
          );

        }

        const parent =
          await prisma.category.findUnique({
            where: {
              id: currentParentId,
            },

            select: {
              parentId: true,
            },
          });

        if (!parent) {
          break;
        }

        currentParentId =
          parent.parentId;
      }
    }

    // ----------------------------------------
    // Check duplicate name
    // ----------------------------------------

    const duplicate =
      await prisma.category.findFirst({
        where: {
          name,

          NOT: {
            id,
          },
        },
      });

    if (duplicate) {

      return NextResponse.json(
        {
          message:
            "Another category with this name already exists",
        },
        {
          status: 409,
        }
      );

    }

    // ----------------------------------------
    // Update category
    // ----------------------------------------

    const category =
      await prisma.category.update({
        where: {
          id,
        },

        data: {
          name,
          parentId,
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
      message:
        "Category updated successfully",

      category,
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
      "UPDATE CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update category",
      },
      {
        status: 500,
      }
    );
  }
}


// ==========================================
// DELETE /api/admin/categories/[id]
// Delete category
// ==========================================

export async function DELETE(
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

    // ----------------------------------------
    // Find category
    // ----------------------------------------

    const category =
      await prisma.category.findUnique({
        where: {
          id,
        },

        include: {
          _count: {
            select: {
              products: true,
              children: true,
            },
          },
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
    // Don't delete category
    // containing products
    // ----------------------------------------

    if (
      category._count.products > 0
    ) {

      return NextResponse.json(
        {
          message:
            "Cannot delete a category that contains products",
        },
        {
          status: 409,
        }
      );

    }

    // ----------------------------------------
    // Don't delete category
    // containing children
    // ----------------------------------------

    if (
      category._count.children > 0
    ) {

      return NextResponse.json(
        {
          message:
            "Cannot delete a category that contains subcategories",
        },
        {
          status: 409,
        }
      );

    }

    // ----------------------------------------
    // Delete category
    // ----------------------------------------

    await prisma.category.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message:
        "Category deleted successfully",
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
          status: error.status,
        }
      );

    }

    console.error(
      "DELETE CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to delete category",
      },
      {
        status: 500,
      }
    );
  }
}
