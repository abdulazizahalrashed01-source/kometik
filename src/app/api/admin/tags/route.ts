import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  requireAdmin,
  AdminAuthError,
} from "@/lib/admin-auth";


// ==========================================
// GET /api/admin/tags
// Get all tags
// ==========================================

export async function GET(
  request: NextRequest
) {
  try {
    await requireAdmin(request);

    const tags =
      await prisma.tag.findMany({
        orderBy: {
          name: "asc",
        },

        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

    return NextResponse.json({
      tags,
    });

  } catch (error) {

    if (
      error instanceof AdminAuthError
    ) {
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
      "GET TAGS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load tags",
      },
      {
        status: 500,
      }
    );
  }
}


// ==========================================
// POST /api/admin/tags
// Create new tag
// ==========================================

export async function POST(
  request: NextRequest
) {
  try {

    // ----------------------------------------
    // Check admin authentication
    // ----------------------------------------

    await requireAdmin(request);


    // ----------------------------------------
    // Read body
    // ----------------------------------------

    const body =
      await request.json();


    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";


    // ----------------------------------------
    // Validate name
    // ----------------------------------------

    if (!name) {

      return NextResponse.json(
        {
          message:
            "Tag name is required",
        },
        {
          status: 400,
        }
      );

    }


    // ----------------------------------------
    // Create slug
    // ----------------------------------------

    const slug =
      name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(
          /[^\p{L}\p{N}-]/gu,
          ""
        )
        .replace(
          /-+/g,
          "-"
        )
        .replace(
          /^-|-$/g,
          ""
        );


    // ----------------------------------------
    // Validate slug
    // ----------------------------------------

    if (!slug) {

      return NextResponse.json(
        {
          message:
            "Unable to create tag slug",
        },
        {
          status: 400,
        }
      );

    }


    // ----------------------------------------
    // Check duplicate
    // ----------------------------------------

    const existingTag =
      await prisma.tag.findFirst({
        where: {
          OR: [
            {
              name,
            },
            {
              slug,
            },
          ],
        },
      });


    if (existingTag) {

      return NextResponse.json(
        {
          message:
            "Tag already exists",
        },
        {
          status: 409,
        }
      );

    }


    // ----------------------------------------
    // Create tag
    // ----------------------------------------

    const tag =
      await prisma.tag.create({
        data: {
          name,
          slug,
        },
      });


    // ----------------------------------------
    // Return created tag
    // ----------------------------------------

    return NextResponse.json(
      {
        message:
          "Tag created successfully",

        tag,
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    // ----------------------------------------
    // Admin authentication error
    // ----------------------------------------

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


    // ----------------------------------------
    // Prisma unique constraint
    // ----------------------------------------

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {

      return NextResponse.json(
        {
          message:
            "Tag already exists",
        },
        {
          status: 409,
        }
      );

    }


    // ----------------------------------------
    // Unexpected error
    // ----------------------------------------

    console.error(
      "CREATE TAG ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to create tag",
      },
      {
        status: 500,
      }
    );
  }
}
