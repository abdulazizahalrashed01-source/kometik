import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import { prisma } from "@/lib/prisma";

import {
  AdminAuthError,
  requireAdmin,
} from "@/lib/admin-auth";


// ==========================================
// CLOUDINARY
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
// GET COLLECTION
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

    const collection =
      await prisma.collection.findUnique({
        where: {
          id,
        },

        include: {
          tag: true,

          products: {
            orderBy: {
              sortOrder: "asc",
            },

            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

    if (!collection) {
      return NextResponse.json(
        {
          message: "Collection not found",
        },
        {
          status: 404,
        }
      );
    }


    // ========================================
    // TAG COLLECTION
    // ========================================

    if (
      collection.type === "TAG" &&
      collection.tagId
    ) {
      const taggedProducts =
        await prisma.product.findMany({
          where: {
            tags: {
              some: {
                tagId:
                  collection.tagId,
              },
            },
          },

          include: {
            category: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        });


      return NextResponse.json({
        collection: {
          ...collection,

          products: taggedProducts.map(
            (product) => ({
              product,
              sortOrder: 0,
            })
          ),
        },
      });
    }


    return NextResponse.json({
      collection,
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
          status:
            error.status,
        }
      );
    }


    console.error(
      "GET COLLECTION ERROR:",
      error
    );


    return NextResponse.json(
      {
        message:
          "Failed to load collection",
      },
      {
        status: 500,
      }
    );
  }
}


// ==========================================
// UPDATE COLLECTION
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


    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const imageUrl =
      typeof body.imageUrl === "string"
        ? body.imageUrl.trim()
        : "";

    const imagePublicId =
      typeof body.imagePublicId === "string"
        ? body.imagePublicId.trim()
        : "";

    const active =
      typeof body.active === "boolean"
        ? body.active
        : true;

    const type =
      body.type === "TAG"
        ? "TAG"
        : "MANUAL";

    const tagId =
      typeof body.tagId === "string" &&
      body.tagId.trim()
        ? body.tagId.trim()
        : null;


    // ========================================
    // VALIDATION
    // ========================================

    if (!name) {
      return NextResponse.json(
        {
          message:
            "Collection name is required",
        },
        {
          status: 400,
        }
      );
    }


    if (
      type === "TAG" &&
      !tagId
    ) {
      return NextResponse.json(
        {
          message:
            "A tag is required for a TAG collection",
        },
        {
          status: 400,
        }
      );
    }


    if (
      type === "MANUAL" &&
      tagId
    ) {
      return NextResponse.json(
        {
          message:
            "A MANUAL collection cannot have a tag",
        },
        {
          status: 400,
        }
      );
    }


    // ========================================
    // EXISTING COLLECTION
    // ========================================

    const existingCollection =
      await prisma.collection.findUnique({
        where: {
          id,
        },
      });

    if (!existingCollection) {
      return NextResponse.json(
        {
          message:
            "Collection not found",
        },
        {
          status: 404,
        }
      );
    }


    // ========================================
    // TAG CHECK
    // ========================================

    if (type === "TAG") {
      const tag =
        await prisma.tag.findUnique({
          where: {
            id: tagId!,
          },
        });

      if (!tag) {
        return NextResponse.json(
          {
            message:
              "Tag not found",
          },
          {
            status: 404,
          }
        );
      }
    }


    // ========================================
    // DUPLICATE NAME
    // ========================================

    const duplicate =
      await prisma.collection.findFirst({
        where: {
          AND: [
            {
              id: {
                not: id,
              },
            },
            {
              name,
            },
          ],
        },
      });

    if (duplicate) {
      return NextResponse.json(
        {
          message:
            "Collection name already exists",
        },
        {
          status: 409,
        }
      );
    }


    // ========================================
    // UPDATE
    // ========================================

    const updatedCollection =
      await prisma.collection.update({
        where: {
          id,
        },

        data: {
          name,

          description:
            description || null,

          imageUrl:
            imageUrl || null,

          imagePublicId:
            imagePublicId || null,

          active,

          type,

          tagId:
            type === "TAG"
              ? tagId
              : null,
        },

        include: {
          tag: true,
        },
      });


    // ========================================
    // DELETE OLD IMAGE
    // ========================================

    const imageChanged =
      existingCollection.imagePublicId !==
      (imagePublicId || null);

    if (
      imageChanged &&
      existingCollection.imagePublicId
    ) {
      try {
        await cloudinary.uploader.destroy(
          existingCollection.imagePublicId,
          {
            resource_type: "image",
          }
        );
      } catch (cloudinaryError) {
        console.error(
          "DELETE OLD COLLECTION IMAGE ERROR:",
          cloudinaryError
        );
      }
    }


    return NextResponse.json({
      message:
        "Collection updated successfully",

      collection:
        updatedCollection,
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
          status:
            error.status,
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
            "Collection name or slug already exists",
        },
        {
          status: 409,
        }
      );
    }


    console.error(
      "UPDATE COLLECTION ERROR:",
      error
    );


    return NextResponse.json(
      {
        message:
          "Failed to update collection",
      },
      {
        status: 500,
      }
    );
  }
}