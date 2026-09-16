"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";

import ProductImageUpload from "@/components/admin/ProductImageUpload";

// ==========================================
// TYPES
// ==========================================

type Category = {
  id: string;
  name: string;
};

type Tag = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl: string | null;
  imagePublicId: string | null;

  category: Category | null;

  tags: {
    tag: Tag;
  }[];
};

// ==========================================
// PAGE
// ==========================================

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();

  const productId =
    typeof params.id === "string"
      ? params.id
      : "";

  // ==========================================
  // PRODUCT
  // ==========================================

  const [loadingProduct, setLoadingProduct] =
    useState(true);

  const [product, setProduct] =
    useState<Product | null>(null);

  // ==========================================
  // CATEGORIES
  // ==========================================

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  // ==========================================
  // TAGS
  // ==========================================

  const [tags, setTags] =
    useState<Tag[]>([]);

  const [loadingTags, setLoadingTags] =
    useState(true);

  // ==========================================
  // FORM
  // ==========================================

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "0",
    categoryId: "",
    tags: [] as string[],
    imageUrl: "",
    imagePublicId: "",
  });

  // ==========================================
  // LOAD PRODUCT
  // ==========================================

  useEffect(() => {
    if (!productId) {
      setError("Product ID is missing.");
      setLoadingProduct(false);
      return;
    }

    async function loadProduct() {
      try {
        setLoadingProduct(true);
        setError("");

        const response =
          await fetch(
            `/api/admin/products/${productId}`,
            {
              credentials: "include",
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load product"
          );
        }

        const loadedProduct =
          data.product as Product;

        if (!loadedProduct) {
          throw new Error(
            "Product not found"
          );
        }

        setProduct(loadedProduct);

        setForm({
          name:
            loadedProduct.name ?? "",

          description:
            loadedProduct.description ??
            "",

          price:
            String(
              loadedProduct.price ?? ""
            ),

          stock:
            String(
              loadedProduct.stock ?? 0
            ),

          categoryId:
            loadedProduct.categoryId ??
            "",

          tags:
            loadedProduct.tags?.map(
              (item) => item.tag.id
            ) ?? [],

          imageUrl:
            loadedProduct.imageUrl ??
            "",

          imagePublicId:
            loadedProduct.imagePublicId ??
            "",
        });
      } catch (error) {
        console.error(
          "LOAD PRODUCT ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load product"
        );
      } finally {
        setLoadingProduct(false);
      }
    }

    loadProduct();
  }, [productId]);

  // ==========================================
  // LOAD CATEGORIES + TAGS
  // ==========================================

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingCategories(true);
        setLoadingTags(true);

        // --------------------------------------
        // CATEGORIES
        // --------------------------------------

        const categoriesResponse =
          await fetch(
            "/api/admin/categories",
            {
              credentials: "include",
              cache: "no-store",
            }
          );

        const categoriesData =
          await categoriesResponse.json();

        if (!categoriesResponse.ok) {
          throw new Error(
            categoriesData.message ||
              "Failed to load categories"
          );
        }

        setCategories(
          categoriesData.categories || []
        );

        // --------------------------------------
        // TAGS
        // --------------------------------------

        const tagsResponse =
          await fetch(
            "/api/admin/tags",
            {
              credentials: "include",
              cache: "no-store",
            }
          );

        const tagsData =
          await tagsResponse.json();

        if (!tagsResponse.ok) {
          throw new Error(
            tagsData.message ||
              "Failed to load tags"
          );
        }

        setTags(
          tagsData.tags || []
        );
      } catch (error) {
        console.error(
          "LOAD PRODUCT FORM DATA ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load form data"
        );
      } finally {
        setLoadingCategories(false);
        setLoadingTags(false);
      }
    }

    loadData();
  }, []);

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  function handleChange(
    field: string,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  }

  // ==========================================
  // TOGGLE TAG
  // ==========================================

  function toggleTag(
    tagId: string
  ) {
    setForm((current) => {
      const alreadySelected =
        current.tags.includes(tagId);

      return {
        ...current,

        tags: alreadySelected
          ? current.tags.filter(
              (id) => id !== tagId
            )
          : [
              ...current.tags,
              tagId,
            ],
      };
    });

    setError("");
  }

  // ==========================================
  // HANDLE IMAGE UPLOAD
  // ==========================================

  function handleImageUpload({
    imageUrl,
    imagePublicId,
  }: {
    imageUrl: string;
    imagePublicId: string;
  }) {
    setForm((current) => ({
      ...current,
      imageUrl,
      imagePublicId,
    }));

    setError("");
  }

  // ==========================================
  // UPDATE PRODUCT
  // ==========================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!productId) {
      setError("Product ID is missing.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      // --------------------------------------
      // PRICE
      // --------------------------------------

      const price =
        Number(form.price);

      // --------------------------------------
      // STOCK
      // --------------------------------------

      const stock =
        Number(form.stock);

      // --------------------------------------
      // NAME
      // --------------------------------------

      if (!form.name.trim()) {
        setError(
          "Product name is required."
        );

        return;
      }

      // --------------------------------------
      // PRICE VALIDATION
      // --------------------------------------

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        setError(
          "Please enter a valid price."
        );

        return;
      }

      // --------------------------------------
      // STOCK VALIDATION
      // --------------------------------------

      if (
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        setError(
          "Stock must be a whole number greater than or equal to 0."
        );

        return;
      }

      // --------------------------------------
      // CATEGORY VALIDATION
      // --------------------------------------

      if (!form.categoryId) {
        setError(
          "Please select a category."
        );

        return;
      }

      // --------------------------------------
      // UPDATE
      // --------------------------------------

      const response =
        await fetch(
          `/api/admin/products/${productId}`,
          {
            method: "PUT",

            credentials: "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name:
                form.name.trim(),

              description:
                form.description.trim() ||
                null,

              price,

              stock,

              categoryId:
                form.categoryId,

              tags:
                form.tags,

              imageUrl:
                form.imageUrl.trim() ||
                null,

              imagePublicId:
                form.imagePublicId.trim() ||
                null,
            }),
          }
        );

      const data =
        await response.json();

      // --------------------------------------
      // API ERROR
      // --------------------------------------

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to update product"
        );

        return;
      }

      // --------------------------------------
      // SUCCESS
      // --------------------------------------

      router.push(
        "/admin/products"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to connect to server"
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loadingProduct) {
    return (
      <div className="mx-auto max-w-3xl">
        <div
          className="
            rounded-2xl
            bg-white
            p-10
            text-center
            shadow-sm
          "
        >
          <p className="text-gray-500">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // PRODUCT NOT FOUND
  // ==========================================

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl">
        <div
          className="
            rounded-2xl
            bg-white
            p-10
            text-center
            shadow-sm
          "
        >
          <h1 className="text-xl font-bold">
            Product not found
          </h1>

          {error && (
            <p className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <Link
            href="/admin/products"
            className="
              mt-6
              inline-block
              rounded-xl
              bg-black
              px-5
              py-3
              text-sm
              font-medium
              text-white
              hover:bg-gray-800
            "
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <div className="mx-auto max-w-3xl">

      {/* ====================================
          HEADER
      ==================================== */}

      <div className="mb-8">
        <Link
          href="/admin/products"
          className="
            text-sm
            text-gray-500
            transition
            hover:text-black
          "
        >
          ← Back to Products
        </Link>

        <h1 className="mt-4 text-3xl font-bold">
          Edit Product
        </h1>

        <p className="mt-2 text-gray-500">
          Update product information in your store.
        </p>
      </div>

      {/* ====================================
          FORM CARD
      ==================================== */}

      <div
        className="
          rounded-2xl
          bg-white
          p-6
          shadow-sm
          sm:p-8
        "
      >
        <form
          onSubmit={handleSubmit}
          className="kometik-space-y-6"
        >

          {/* ==================================
              NAME
          ================================== */}

          <div>
            <label
              htmlFor="name"
              className="
                mb-2
                block
                text-sm
                font-medium
              "
            >
              Product Name
            </label>

            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(event) =>
                handleChange(
                  "name",
                  event.target.value
                )
              }
              placeholder="Hyaluronic Acid Serum"
              className="
                w-full
                rounded-xl
                border
                border-gray-300
                px-4
                py-3
                outline-none
                transition
                focus:border-black
                focus:ring-1
                focus:ring-black
              "
            />
          </div>

          {/* ==================================
              DESCRIPTION
          ================================== */}

          <div>
            <label
              htmlFor="description"
              className="
                mb-2
                block
                text-sm
                font-medium
              "
            >
              Description
            </label>

            <textarea
              id="description"
              rows={5}
              value={form.description}
              onChange={(event) =>
                handleChange(
                  "description",
                  event.target.value
                )
              }
              placeholder="Product description..."
              className="
                w-full
                resize-none
                rounded-xl
                border
                border-gray-300
                px-4
                py-3
                outline-none
                transition
                focus:border-black
                focus:ring-1
                focus:ring-black
              "
            />
          </div>

          {/* ==================================
              PRICE + STOCK
          ================================== */}

          <div
            className="
              grid
              gap-5
              md:grid-cols-2
            "
          >

            <div>
              <label
                htmlFor="price"
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                "
              >
                Price
              </label>

              <input
                id="price"
                type="number"
                required
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) =>
                  handleChange(
                    "price",
                    event.target.value
                  )
                }
                placeholder="19.99"
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  px-4
                  py-3
                  outline-none
                  transition
                  focus:border-black
                  focus:ring-1
                  focus:ring-black
                "
              />
            </div>

            <div>
              <label
                htmlFor="stock"
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                "
              >
                Stock Quantity
              </label>

              <input
                id="stock"
                type="number"
                required
                min="0"
                step="1"
                value={form.stock}
                onChange={(event) =>
                  handleChange(
                    "stock",
                    event.target.value
                  )
                }
                placeholder="25"
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  px-4
                  py-3
                  outline-none
                  transition
                  focus:border-black
                  focus:ring-1
                  focus:ring-black
                "
              />

              <p
                className="
                  mt-1.5
                  text-xs
                  text-gray-400
                "
              >
                Number of pieces currently available.
              </p>
            </div>

          </div>

          {/* ==================================
              CATEGORY
          ================================== */}

          <div>
            <label
              htmlFor="category"
              className="
                mb-2
                block
                text-sm
                font-medium
              "
            >
              Category
            </label>

            <select
              id="category"
              required
              value={form.categoryId}
              disabled={
                loadingCategories
              }
              onChange={(event) =>
                handleChange(
                  "categoryId",
                  event.target.value
                )
              }
              className="
                w-full
                rounded-xl
                border
                border-gray-300
                bg-white
                px-4
                py-3
                outline-none
                transition
                focus:border-black
                focus:ring-1
                focus:ring-black
                disabled:bg-gray-100
              "
            >
              <option value="">
                {loadingCategories
                  ? "Loading categories..."
                  : "Select category"}
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* ==================================
              TAGS
          ================================== */}

          <div>
            <div className="mb-3">
              <label
                className="
                  block
                  text-sm
                  font-medium
                "
              >
                Product Tags
              </label>

              <p
                className="
                  mt-1
                  text-xs
                  text-gray-400
                "
              >
                Select one or more tags for this
                product.
              </p>
            </div>

            {loadingTags ? (
              <div
                className="
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  px-4
                  py-4
                  text-sm
                  text-gray-500
                "
              >
                Loading tags...
              </div>
            ) : tags.length === 0 ? (
              <div
                className="
                  rounded-xl
                  border
                  border-dashed
                  border-gray-300
                  bg-gray-50
                  px-4
                  py-5
                  text-sm
                  text-gray-500
                "
              >
                No tags available.
              </div>
            ) : (
              <div
                className="
                  grid
                  gap-3
                  sm:grid-cols-2
                "
              >
                {tags.map(
                  (tag) => {
                    const selected =
                      form.tags.includes(
                        tag.id
                      );

                    return (
                      <label
                        key={tag.id}
                        className={`
                          flex
                          cursor-pointer
                          items-center
                          gap-3
                          rounded-xl
                          border
                          px-4
                          py-3
                          transition
                          ${
                            selected
                              ? "border-black bg-gray-100"
                              : "border-gray-200 bg-white hover:border-gray-400"
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() =>
                            toggleTag(
                              tag.id
                            )
                          }
                          className="
                            h-4
                            w-4
                            accent-black
                          "
                        />

                        <span
                          className="
                            text-sm
                            font-medium
                          "
                        >
                          {tag.name}
                        </span>
                      </label>
                    );
                  }
                )}
              </div>
            )}

            {form.tags.length > 0 && (
              <p
                className="
                  mt-3
                  text-xs
                  text-gray-500
                "
              >
                {form.tags.length} tag
                {form.tags.length !== 1
                  ? "s"
                  : ""}{" "}
                selected
              </p>
            )}
          </div>

          {/* ==================================
              PRODUCT IMAGE
          ================================== */}

          <div>
            <div className="mb-3">
              <label
                className="
                  block
                  text-sm
                  font-medium
                "
              >
                Product Image
              </label>

              <p
                className="
                  mt-1
                  text-xs
                  text-gray-400
                "
              >
                Upload or replace the product image.
              </p>
            </div>

            <ProductImageUpload
              imageUrl={
                form.imageUrl || null
              }
              onUpload={
                handleImageUpload
              }
            />
          </div>

          {/* ==================================
              ERROR
          ================================== */}

          {error && (
            <div
              className="
                rounded-xl
                border
                border-red-200
                bg-red-50
                p-4
                text-sm
                text-red-600
              "
            >
              {error}
            </div>
          )}

          {/* ==================================
              BUTTONS
          ================================== */}

          <div
            className="
              flex
              flex-col
              gap-3
              border-t
              pt-6
              sm:flex-row
            "
          >
            <button
              type="submit"
              disabled={
                saving ||
                loadingCategories ||
                loadingTags ||
                loadingProduct
              }
              className="
                rounded-xl
                bg-black
                px-6
                py-3
                font-semibold
                text-white
                transition
                hover:bg-gray-800
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

            <Link
              href="/admin/products"
              className="
                rounded-xl
                border
                border-gray-300
                px-6
                py-3
                text-center
                font-semibold
                transition
                hover:bg-gray-50
              "
            >
              Cancel
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}