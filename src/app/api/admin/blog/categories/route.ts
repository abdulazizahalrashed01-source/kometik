import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/admin-auth";

// ==========================================
// AUTH
// ==========================================

async function requireAdmin(
  request: NextRequest
) {
  const admin = await getCurrentAdmin(request);

  if (!admin) {
    return NextResponse.json(
      {
        message: "Admin authentication required",
      },
      {
        status: 401,
      }
    );
  }

  return null;
}

// ==========================================
// SLUG
// ==========================================

function makeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

// ==========================================
// GET
// ==========================================

export async function GET(
  request: NextRequest
) {
  try {
    const authError = await requireAdmin(request);

    if (authError) {
      return authError;
    }

    const categories = await prisma.blogCategory.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    return NextResponse.json({
      categories,
    });
  } catch (error) {
    console.error(
      "GET BLOG CATEGORIES ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to load blog categories",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// POST
// ==========================================

export async function POST(
  request: NextRequest
) {
  try {
    const authError = await requireAdmin(request);

    if (authError) {
      return authError;
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const requestedSlug =
      typeof body.slug === "string"
        ? body.slug.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        {
          message: "Category name is required",
        },
        {
          status: 400,
        }
      );
    }

    const slug = makeSlug(
      requestedSlug || name
    );

    if (!slug) {
      return NextResponse.json(
        {
          message: "A valid slug is required",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await prisma.blogCategory.findFirst({
        where: {
          OR: [
            {
              name: {
                equals: name,
                mode: "insensitive",
              },
            },
            {
              slug: {
                equals: slug,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          message:
            "A category with this name or slug already exists",
        },
        {
          status: 409,
        }
      );
    }

    const category =
      await prisma.blogCategory.create({
        data: {
          name,
          slug,
          description: description || null,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              posts: true,
            },
          },
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
      "CREATE BLOG CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to create blog category",
      },
      {
        status: 500,
      }
    );
  }
}