import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ShopCategoriesPage() {
  const categories = await prisma.category.findMany({
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

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">

      {/* HEADER */}

      <div className="mb-10">
        <h1 className="text-3xl font-bold">
          Categories
        </h1>

        <p className="mt-2 text-gray-500">
          Browse our products by category.
        </p>
      </div>


      {/* CATEGORIES */}

      {categories.length === 0 ? (

        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">

          <h2 className="text-xl font-semibold">
            No categories available
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Categories will appear here once they are added.
          </p>

        </div>

      ) : (

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {categories.map((category) => (

            <Link
              key={category.id}
              href={`/shop?category=${category.id}`}
              className="
                group
                rounded-2xl
                bg-white
                p-6
                shadow-sm
                transition
                hover:-translate-y-1
                hover:shadow-md
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <h2
                    className="
                      text-xl
                      font-semibold
                      transition
                      group-hover:text-gray-600
                    "
                  >
                    {category.name}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    {category._count.products}{" "}
                    {category._count.products === 1
                      ? "product"
                      : "products"}
                  </p>

                </div>


                <span
                  className="
                    text-xl
                    transition
                    group-hover:translate-x-1
                  "
                >
                  →
                </span>

              </div>

            </Link>

          ))}

        </div>

      )}

    </main>
  );
}