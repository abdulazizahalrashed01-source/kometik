import {
  NextRequest,
  NextResponse,
} from "next/server";

import { v2 as cloudinary } from "cloudinary";

import { prisma } from "@/lib/prisma";

import {
  AdminAuthError,
  requireAdmin,
} from "@/lib/admin-auth";

// ==========================================
// CLOUDINARY CONFIG
// ==========================================

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,
});

// ==========================================
// GET PRODUCT
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

    const product =
      await prisma.product.findUnique({
        where: {
          id,
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
      "GET PRODUCT ERROR:",
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
          "Failed to load product",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// UPDATE PRODUCT
// ==========================================

export async function PUT(
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

    const body =
      await request.json();

    const {
      name,
      description,
      price,
      categoryId,
      tags,
      imageUrl,
      imagePublicId,
    } = body;

    // ========================================
    // VALIDATION - NAME
    // ========================================

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

    // ========================================
    // VALIDATION - PRICE
    // ========================================

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

    // ========================================
    // VALIDATION - CATEGORY
    // ========================================

    if (
      typeof categoryId !== "string" ||
      !categoryId.trim()
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

    // ========================================
    // VALIDATE TAGS
    // ========================================

    if (
      tags !== undefined &&
      !Array.isArray(tags)
    ) {
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

    const tagIds: string[] =
      Array.isArray(tags)
        ? [
            ...new Set(
              tags.filter(
                (
                  tagId
                ): tagId is string =>
                  typeof tagId ===
                    "string" &&
                  tagId.trim().length >
                    0
              )
            ),
          ]
        : [];

    // ========================================
    // CHECK PRODUCT
    // ========================================

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          imagePublicId: true,
        },
      });

    if (!existingProduct) {
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

    // ========================================
    // CHECK CATEGORY
    // ========================================

    const category =
      await prisma.category.findUnique({
        where: {
          id: categoryId,
        },

        select: {
          id: true,
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

    // ========================================
    // CHECK TAGS
    // ========================================

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

    // ========================================
    // NORMALIZE IMAGE DATA
    // ========================================

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

    // ========================================
    // CHECK IMAGE CHANGE
    // ========================================

    const imageChanged =
      existingProduct.imagePublicId !==
      normalizedImagePublicId;

    // ========================================
    // UPDATE PRODUCT + TAGS
    // ========================================

    await prisma.$transaction(
      async (tx) => {
        // --------------------------------------
        // UPDATE PRODUCT
        // --------------------------------------

        await tx.product.update({
          where: {
            id,
          },

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

            categoryId,

            imageUrl:
              normalizedImageUrl,

            imagePublicId:
              normalizedImagePublicId,
          },
        });

        // --------------------------------------
        // UPDATE TAG RELATIONS
        // --------------------------------------

        // Only update relations when tags
        // were supplied by the client.
        //
        // The Edit Product page always sends
        // tags, including [] to clear them.

        if (Array.isArray(tags)) {
          await tx.productTag.deleteMany({
            where: {
              productId: id,
            },
          });

          if (tagIds.length > 0) {
            await tx.productTag.createMany({
              data: tagIds.map(
                (tagId) => ({
                  productId: id,
                  tagId,
                })
              ),

              skipDuplicates: true,
            });
          }
        }
      }
    );

    // ========================================
    // DELETE OLD CLOUDINARY IMAGE
    // ========================================

    if (
      imageChanged &&
      existingProduct.imagePublicId
    ) {
      try {
        await cloudinary.uploader.destroy(
          existingProduct.imagePublicId,
          {
            resource_type: "image",
          }
        );
      } catch (cloudinaryError) {
        console.error(
          "DELETE OLD CLOUDINARY IMAGE ERROR:",
          cloudinaryError
        );
      }
    }

    // ========================================
    // GET UPDATED PRODUCT
    // ========================================

    const product =
      await prisma.product.findUnique({
        where: {
          id,
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
      product,
    });
  } catch (error) {
    console.error(
      "UPDATE PRODUCT ERROR:",
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
          "Failed to update product",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// DELETE PRODUCT
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

    // ========================================
    // GET PRODUCT
    // ========================================

    const product =
      await prisma.product.findUnique({
        where: {
          id,
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

    // ========================================
    // DELETE DATABASE RECORD
    // ========================================

    await prisma.product.delete({
      where: {
        id,
      },
    });

    // ========================================
    // DELETE CLOUDINARY IMAGE
    // ========================================

    if (
      product.imagePublicId
    ) {
      try {
        await cloudinary.uploader.destroy(
          product.imagePublicId,
          {
            resource_type: "image",
          }
        );
      } catch (cloudinaryError) {
        console.error(
          "DELETE CLOUDINARY IMAGE ERROR:",
          cloudinaryError
        );
      }
    }

    return NextResponse.json({
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE PRODUCT ERROR:",
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
            error.status
        }
      );
    }

    return NextResponse.json(
      {
        message:
          "Failed to delete product",
      },
      {
        status: 500,
      }
    );
  }
}