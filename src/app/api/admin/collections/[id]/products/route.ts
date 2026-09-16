import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  requireAdmin,
  AdminAuthError,
} from "@/lib/admin-auth";

// ==========================================
// GET /api/admin/collections/[id]/products
// ==========================================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);

    const { id } = await context.params;

    const collection = await prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    if (collection.type === "TAG") {
      if (!collection.tagId) {
        return NextResponse.json({ products: [] });
      }

      const products = await prisma.product.findMany({
        where: {
          tags: {
            some: {
              tagId: collection.tagId,
            },
          },
        },
        include: {
          category: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      return NextResponse.json({
        products: products.map((product) => ({
          product,
          sortOrder: 0,
        })),
      });
    }

    const products = await prisma.productCollection.findMany({
      where: {
        collectionId: id,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          product: {
            name: "asc",
          },
        },
      ],
    });

    return NextResponse.json({
      products,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/collections/[id]/products:",
      error
    );

    if (error instanceof AdminAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch collection products" },
      { status: 500 }
    );
  }
}

// ==========================================
// POST /api/admin/collections/[id]/products
// ==========================================

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);

    const { id } = await context.params;

    const collection = await prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    if (collection.type !== "MANUAL") {
      return NextResponse.json(
        {
          error:
            "Products cannot be manually added to a TAG collection",
        },
        { status: 400 }
      );
    }

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("productIds" in body)
    ) {
      return NextResponse.json(
        { error: "productIds is required" },
        { status: 400 }
      );
    }

    const rawProductIds = (body as { productIds?: unknown }).productIds;

    if (!Array.isArray(rawProductIds)) {
      return NextResponse.json(
        { error: "productIds must be an array" },
        { status: 400 }
      );
    }

    const productIds: string[] = rawProductIds.filter(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0
    );

    const uniqueProductIds = [...new Set(productIds)];

    if (uniqueProductIds.length === 0) {
      return NextResponse.json(
        { error: "At least one product is required" },
        { status: 400 }
      );
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: uniqueProductIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (products.length !== uniqueProductIds.length) {
      return NextResponse.json(
        { error: "One or more products were not found" },
        { status: 404 }
      );
    }

    const existingRelations =
      await prisma.productCollection.findMany({
        where: {
          collectionId: id,
          productId: {
            in: uniqueProductIds,
          },
        },
        select: {
          productId: true,
        },
      });

    const existingIds = new Set(
      existingRelations.map(
        (item: { productId: string }) => item.productId
      )
    );

    const newProductIds = uniqueProductIds.filter(
      (productId) => !existingIds.has(productId)
    );

    if (newProductIds.length === 0) {
      return NextResponse.json({
        message: "All products are already in the collection",
        added: 0,
      });
    }

    const lastItem = await prisma.productCollection.findFirst({
      where: {
        collectionId: id,
      },
      orderBy: {
        sortOrder: "desc",
      },
      select: {
        sortOrder: true,
      },
    });

    let nextSortOrder = (lastItem?.sortOrder ?? -1) + 1;

    await prisma.productCollection.createMany({
      data: newProductIds.map((productId) => ({
        collectionId: id,
        productId,
        sortOrder: nextSortOrder++,
      })),
    });

    return NextResponse.json({
      message: "Products added successfully",
      added: newProductIds.length,
    });
  } catch (error) {
    console.error(
      "POST /api/admin/collections/[id]/products:",
      error
    );

    if (error instanceof AdminAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "Failed to add products" },
      { status: 500 }
    );
  }
}

// ==========================================
// PATCH /api/admin/collections/[id]/products
// ==========================================

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);

    const { id } = await context.params;

    const collection = await prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    if (collection.type !== "MANUAL") {
      return NextResponse.json(
        {
          error:
            "Product ordering cannot be changed for a TAG collection",
        },
        { status: 400 }
      );
    }

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("items" in body)
    ) {
      return NextResponse.json(
        { error: "items is required" },
        { status: 400 }
      );
    }

    const rawItems = (body as { items?: unknown }).items;

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json(
        { error: "items must be a non-empty array" },
        { status: 400 }
      );
    }

    type OrderItem = {
      productId: string;
      sortOrder: number;
    };

    const items: OrderItem[] = [];

    for (const rawItem of rawItems) {
      if (
        typeof rawItem !== "object" ||
        rawItem === null ||
        !("productId" in rawItem) ||
        !("sortOrder" in rawItem)
      ) {
        return NextResponse.json(
          { error: "Invalid item format" },
          { status: 400 }
        );
      }

      const value = rawItem as {
        productId?: unknown;
        sortOrder?: unknown;
      };

      if (
        typeof value.productId !== "string" ||
        typeof value.sortOrder !== "number" ||
        !Number.isFinite(value.sortOrder)
      ) {
        return NextResponse.json(
          { error: "Invalid productId or sortOrder" },
          { status: 400 }
        );
      }

      items.push({
        productId: value.productId,
        sortOrder: value.sortOrder,
      });
    }

    const productIds = items.map(
      (item: OrderItem) => item.productId
    );

    if (new Set(productIds).size !== productIds.length) {
      return NextResponse.json(
        { error: "Duplicate productId values are not allowed" },
        { status: 400 }
      );
    }

    const existingRelations =
      await prisma.productCollection.findMany({
        where: {
          collectionId: id,
          productId: {
            in: productIds,
          },
        },
        select: {
          productId: true,
        },
      });

    if (existingRelations.length !== productIds.length) {
      return NextResponse.json(
        {
          error:
            "One or more products do not belong to this collection",
        },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      items.map((item: OrderItem) =>
        prisma.productCollection.update({
          where: {
            productId_collectionId: {
              productId: item.productId,
              collectionId: id,
            },
          },
          data: {
            sortOrder: item.sortOrder,
          },
        })
      )
    );

    return NextResponse.json({
      message: "Product order updated successfully",
    });
  } catch (error) {
    console.error(
      "PATCH /api/admin/collections/[id]/products:",
      error
    );

    if (error instanceof AdminAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "Failed to update product order" },
      { status: 500 }
    );
  }
}