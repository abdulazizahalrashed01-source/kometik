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
// GET PRODUCTS
// ==========================================

export async function GET(
  request: NextRequest
) {
  try {
    // ----------------------------------------
    // Require admin
    // ----------------------------------------

    await requireAdmin(request);

    // ----------------------------------------
    // Get products
    // ----------------------------------------

    const products =
      await prisma.product.findMany({
        orderBy: {
          id: "desc",
        },

        include: {
          category: true,

          tags: {
            include: {
              tag: true,
            },
          },
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

// ==========================================
// CREATE PRODUCT
// ==========================================

export async function POST(
  request: NextRequest
) {
  try {
    // ----------------------------------------
    // Require admin
    // ----------------------------------------

    await requireAdmin(request);

    // ----------------------------------------
    // Read body
    // ----------------------------------------

    const body =
      await request.json();

    const {
      name,
      description,
      price,
      stock,
      categoryId,
      tags,
      imageUrl,
      imagePublicId,
    } = body;

    // ----------------------------------------
    // Validation - Name
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
    // Validation - Price
    // ----------------------------------------

    if (
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return NextResponse.json(
        {
          message:
            "A valid price is required",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------
    // Validation - Stock
    // ----------------------------------------

    if (
      typeof stock !== "number" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return NextResponse.json(
        {
          message:
            "Stock must be a whole number greater than or equal to 0",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------
    // Validation - Category
    // ----------------------------------------

    if (
      typeof categoryId !== "string" ||
      !categoryId
    ) {
      return NextResponse.json(
        {
          message:
            "Category is required",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------
    // Validate Tags
    // ----------------------------------------

    let tagIds: string[] = [];

    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return NextResponse.json(
          {
            message:
              "Tags must be an array",
          },
          {
            status: 400,
          }
        );
      }

      tagIds = [
        ...new Set(
          tags.filter(
            (tagId): tagId is string =>
              typeof tagId === "string" &&
              tagId.trim().length > 0
          )
        ),
      ];
    }

    // ----------------------------------------
    // Check category
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
    // Check tags
    // ----------------------------------------

    if (tagIds.length > 0) {
      const existingTags =
        await prisma.tag.findMany({
          where: {
            id: {
              in: tagIds,
            },
          },

          select: {
            id: true,
          },
        });

      const existingTagIds =
        new Set(
          existingTags.map(
            (tag) => tag.id
          )
        );

      const missingTagIds =
        tagIds.filter(
          (tagId) =>
            !existingTagIds.has(
              tagId
            )
        );

      if (
        missingTagIds.length > 0
      ) {
        return NextResponse.json(
          {
            message:
              "One or more tags were not found",
          },
          {
            status: 404,
          }
        );
      }
    }

    // ----------------------------------------
    // Normalize image data
    // ----------------------------------------

    const normalizedImageUrl =
      typeof imageUrl === "string" &&
      imageUrl.trim()
        ? imageUrl.trim()
        : null;

    const normalizedImagePublicId =
      typeof imagePublicId ===
        "string" &&
      imagePublicId.trim()
        ? imagePublicId.trim()
        : null;

    // ----------------------------------------
    // Create product
    // ----------------------------------------

    const product =
      await prisma.product.create({
        data: {
          name:
            name.trim(),

          description:
            typeof description ===
              "string" &&
            description.trim()
              ? description.trim()
              : null,

          price,

          stock,

          categoryId,

          imageUrl:
            normalizedImageUrl,

          imagePublicId:
            normalizedImagePublicId,

          tags:
            tagIds.length > 0
              ? {
                  create:
                    tagIds.map(
                      (tagId) => ({
                        tag: {
                          connect: {
                            id: tagId,
                          },
                        },
                      })
                    ),
                }
              : undefined,
        },

        include: {
          category: true,

          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

    // ----------------------------------------
    // Response
    // ----------------------------------------

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