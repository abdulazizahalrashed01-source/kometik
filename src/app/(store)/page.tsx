import { prisma } from "@/lib/prisma";

import HeroSection from "@/components/HeroSection";
import HomeShopIntro from "@/components/home/HomeShopIntro";
import HomeCategories from "@/components/home/HomeCategories";
import CategoryRail from "@/components/home/CategoryRail";
import HomeProducts from "@/components/home/HomeProducts";
import HomeEditorial from "@/components/home/HomeEditorial";
import HomeBrands from "@/components/home/HomeBrands";

export default async function HomePage() {
  const [
    products,
    categories,
  ] = await Promise.all([
    prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        imageUrl: true,
        imagePublicId: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    }),

    prisma.category.findMany({
      where: {
        parentId: null,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        parentId: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    }),
  ]);

  const categoryRailItems = [
    {
      id: "all",
      number: "01",
      name: "الكل",
    },
    ...categories.slice(0, 5).map(
      (category, index) => ({
        id: category.id,
        number: String(
          index + 2
        ).padStart(2, "0"),
        name: category.name,
      })
    ),
  ];

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        overflow-x-clip
        bg-[var(--cream)]
        text-[var(--ink)]
      "
    >
      {/* =================================================
          HERO
      ================================================== */}

      <HeroSection />

      {/* =================================================
          SHOP INTRO
      ================================================== */}

      <HomeShopIntro />

      {/* =================================================
          CATEGORIES
      ================================================== */}

      <HomeCategories
        categories={categories}
      />

      {/* =================================================
          CATEGORY RAIL
      ================================================== */}

      <CategoryRail
        items={categoryRailItems}
      />

      {/* =================================================
          PRODUCTS
      ================================================== */}

      <HomeProducts
        products={products}
      />

      {/* =================================================
          EDITORIAL
      ================================================== */}

      <HomeEditorial />

      {/* =================================================
          BRANDS
      ================================================== */}

      <HomeBrands />
    </main>
  );
}