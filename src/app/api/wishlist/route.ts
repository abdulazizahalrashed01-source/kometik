import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/user";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      );
    }

    const wishlist = await prisma.wishlistItem.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error("GET /api/wishlist error:", error);

    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب المفضلة" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      );
    }

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("productId" in body) ||
      typeof body.productId !== "string" ||
      body.productId.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "معرّف المنتج غير صالح" },
        { status: 400 },
      );
    }

    const productId = body.productId.trim();

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "المنتج غير موجود" },
        { status: 404 },
      );
    }

    const wishlistItem = await prisma.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        productId,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(wishlistItem, { status: 201 });
  } catch (error) {
    console.error("POST /api/wishlist error:", error);

    return NextResponse.json(
      { error: "حدث خطأ أثناء إضافة المنتج للمفضلة" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 },
      );
    }

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("productId" in body) ||
      typeof body.productId !== "string" ||
      body.productId.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "معرّف المنتج غير صالح" },
        { status: 400 },
      );
    }

    const productId = body.productId.trim();

    await prisma.wishlistItem.deleteMany({
      where: {
        userId: user.id,
        productId,
      },
    });

    return NextResponse.json({
      success: true,
      productId,
    });
  } catch (error) {
    console.error("DELETE /api/wishlist error:", error);

    return NextResponse.json(
      { error: "حدث خطأ أثناء إزالة المنتج من المفضلة" },
      { status: 500 },
    );
  }
}
