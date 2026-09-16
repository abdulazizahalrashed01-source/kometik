import Link from "next/link";

import { prisma } from "@/lib/prisma";
import DeleteProductButton from "./DeleteProductButton";
import CloudinaryProductImage from "@/components/CloudinaryProductImage";

// ==========================================
// ADMIN PRODUCTS PAGE
// ==========================================

export default async function AdminProductsPage() {
  const products =
    await prisma.product.findMany({
      orderBy: {
        id: "desc",
      },

      include: {
        category: true,
      },
    });

  return (
    <div className="mx-auto max-w-7xl">

      {/* ====================================
          HEADER
      ==================================== */}

      <div
        className="
          mb-8
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <h1 className="text-3xl font-bold">
            Products
          </h1>

          <p className="mt-2 text-gray-500">
            Manage products in your store.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="
            inline-flex
            items-center
            justify-center
            rounded-lg
            bg-black
            px-5
            py-3
            font-medium
            text-white
            transition
            hover:bg-gray-800
          "
        >
          + Add Product
        </Link>
      </div>

      {/* ====================================
          PRODUCTS
      ==================================== */}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">

        {products.length === 0 ? (

          <div className="p-10 text-center">

            <h2 className="text-lg font-semibold">
              No products found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Create your first product.
            </p>

            <Link
              href="/admin/products/new"
              className="
                mt-5
                inline-block
                rounded-lg
                bg-black
                px-5
                py-3
                text-sm
                font-medium
                text-white
                hover:bg-gray-800
              "
            >
              Add Product
            </Link>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              {/* ==================================
                  TABLE HEADER
              ================================== */}

              <thead className="border-b bg-gray-50">

                <tr>

                  <th className="p-4 text-left text-sm font-semibold">
                    Product
                  </th>

                  <th className="p-4 text-left text-sm font-semibold">
                    Category
                  </th>

                  <th className="p-4 text-left text-sm font-semibold">
                    Price
                  </th>

                  <th className="p-4 text-left text-sm font-semibold">
                    Stock
                  </th>

                  <th className="p-4 text-right text-sm font-semibold">
                    Actions
                  </th>

                </tr>

              </thead>

              {/* ==================================
                  TABLE BODY
              ================================== */}

              <tbody className="kometik-divide-y">

                {products.map((product) => (

                  <tr
                    key={product.id}
                    className="hover:bg-gray-50"
                  >

                    {/* ==================================
                        PRODUCT
                    ================================== */}

                    <td className="p-4">

                      <div
                        className="
                          flex
                          items-center
                          gap-4
                        "
                      >

                        {/* IMAGE */}

                        <div
                          className="
                            relative
                            h-16
                            w-16
                            shrink-0
                            overflow-hidden
                            rounded-xl
                            bg-gray-100
                          "
                        >

                          <CloudinaryProductImage
                            imagePublicId={
                              product.imagePublicId
                            }
                            imageUrl={
                              product.imageUrl
                            }
                            alt={product.name}
                            fill
                            sizes="64px"
                            className="object-contain p-2"
                          />

                        </div>

                        {/* INFO */}

                        <div>

                          <p className="font-medium">
                            {product.name}
                          </p>

                          {product.description && (
                            <p
                              className="
                                mt-1
                                max-w-md
                                truncate
                                text-sm
                                text-gray-500
                              "
                            >
                              {product.description}
                            </p>
                          )}

                        </div>

                      </div>

                    </td>

                    {/* ==================================
                        CATEGORY
                    ================================== */}

                    <td className="p-4">

                      <span
                        className="
                          rounded-full
                          bg-gray-100
                          px-3
                          py-1
                          text-sm
                        "
                      >
                        {product.category.name}
                      </span>

                    </td>

                    {/* ==================================
                        PRICE
                    ================================== */}

                    <td className="p-4 font-medium">
                      ${product.price.toFixed(2)}
                    </td>

                    {/* ==================================
                        STOCK
                    ================================== */}

                    <td className="p-4">

                      {product.stock === 0 ? (

                        <div className="flex flex-col">

                          <span
                            className="
                              w-fit
                              rounded-full
                              bg-red-50
                              px-3
                              py-1
                              text-sm
                              font-semibold
                              text-red-600
                            "
                          >
                            Out of stock
                          </span>

                          <span
                            className="
                              mt-1
                              text-xs
                              text-gray-400
                            "
                          >
                            0 pieces
                          </span>

                        </div>

                      ) : product.stock <= 5 ? (

                        <div className="flex flex-col">

                          <span
                            className="
                              w-fit
                              rounded-full
                              bg-orange-50
                              px-3
                              py-1
                              text-sm
                              font-semibold
                              text-orange-600
                            "
                          >
                            Low stock
                          </span>

                          <span
                            className="
                              mt-1
                              text-xs
                              text-gray-500
                            "
                          >
                            {product.stock}{" "}
                            {product.stock === 1
                              ? "piece"
                              : "pieces"}
                          </span>

                        </div>

                      ) : (

                        <div className="flex flex-col">

                          <span
                            className="
                              w-fit
                              rounded-full
                              bg-gray-100
                              px-3
                              py-1
                              text-sm
                              font-semibold
                              text-gray-900
                            "
                          >
                            In stock
                          </span>

                          <span
                            className="
                              mt-1
                              text-xs
                              text-gray-500
                            "
                          >
                            {product.stock} pieces
                          </span>

                        </div>

                      )}

                    </td>

                    {/* ==================================
                        ACTIONS
                    ================================== */}

                    <td className="p-4">

                      <div
                        className="
                          flex
                          justify-end
                          gap-2
                        "
                      >

                        <Link
                          href={`/admin/products/${product.id}`}
                          className="
                            rounded-lg
                            border
                            px-3
                            py-2
                            text-sm
                            hover:bg-gray-50
                          "
                        >
                          Edit
                        </Link>

                        <DeleteProductButton
                          productId={product.id}
                          productName={product.name}
                        />

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}