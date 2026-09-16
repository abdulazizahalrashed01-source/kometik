"use client";

import Link from "next/link";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpLeft,
  Check,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import ProductImageUpload from "@/components/admin/ProductImageUpload";
import CloudinaryProductImage from "@/components/CloudinaryProductImage";

// ==========================================
// TYPES
// ==========================================

type Tag = {
  id: string;
  name: string;
  slug: string;
};

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  category: Category;
};

type CollectionProduct = {
  product: Product;
  sortOrder: number;
};

type CollectionType =
  | "MANUAL"
  | "TAG";

type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;

  imageUrl: string | null;
  imagePublicId: string | null;

  active: boolean;
  type: CollectionType;

  tagId: string | null;
  tag: Tag | null;

  products: CollectionProduct[];
};

// ==========================================
// PAGE
// ==========================================

export default function CollectionDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const collectionId =
    typeof params.id === "string"
      ? params.id
      : "";

  // ========================================
  // STATE
  // ========================================

  const [collection, setCollection] =
    useState<Collection | null>(null);

  const [tags, setTags] =
    useState<Tag[]>([]);

  const [allProducts, setAllProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingTags, setLoadingTags] =
    useState(false);

  const [loadingProducts, setLoadingProducts] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [addingProducts, setAddingProducts] =
    useState(false);

  const [removingProductId, setRemovingProductId] =
    useState<string | null>(null);

  const [reordering, setReordering] =
    useState(false);

  const [productSearch, setProductSearch] =
    useState("");

  const [selectedProductIds, setSelectedProductIds] =
    useState<string[]>([]);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] =
    useState({
      name: "",
      description: "",
      active: true,
      type: "MANUAL" as CollectionType,
      tagId: "",
      imageUrl: "",
      imagePublicId: "",
    });

  // ========================================
  // LOAD COLLECTION
  // ========================================

  useEffect(() => {
    async function loadCollection() {
      if (!collectionId) {
        setError("Invalid collection.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `/api/admin/collections/${encodeURIComponent(
              collectionId
            )}`,
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
              data.error ||
              "Failed to load collection"
          );
        }

        const loadedCollection:
          Collection =
          data.collection;

        setCollection(
          loadedCollection
        );

        setForm({
          name:
            loadedCollection.name,

          description:
            loadedCollection.description ||
            "",

          active:
            loadedCollection.active,

          type:
            loadedCollection.type,

          tagId:
            loadedCollection.tagId ||
            "",

          imageUrl:
            loadedCollection.imageUrl ||
            "",

          imagePublicId:
            loadedCollection.imagePublicId ||
            "",
        });
      } catch (error) {
        console.error(
          "LOAD COLLECTION ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load collection"
        );
      } finally {
        setLoading(false);
      }
    }

    loadCollection();
  }, [collectionId]);

  // ========================================
  // LOAD TAGS
  // ========================================

  useEffect(() => {
    async function loadTags() {
      try {
        setLoadingTags(true);

        const response =
          await fetch(
            "/api/admin/tags",
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
              data.error ||
              "Failed to load tags"
          );
        }

        setTags(
          data.tags || []
        );
      } catch (error) {
        console.error(
          "LOAD TAGS ERROR:",
          error
        );
      } finally {
        setLoadingTags(false);
      }
    }

    loadTags();
  }, []);

  // ========================================
  // LOAD ALL PRODUCTS
  // ========================================

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoadingProducts(true);

        const response =
          await fetch(
            "/api/admin/products",
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
              data.error ||
              "Failed to load products"
          );
        }

        const products =
          Array.isArray(data.products)
            ? data.products
            : Array.isArray(data)
              ? data
              : [];

        setAllProducts(products);
      } catch (error) {
        console.error(
          "LOAD PRODUCTS ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load products"
        );
      } finally {
        setLoadingProducts(false);
      }
    }

    loadProducts();
  }, []);

  // ========================================
  // TYPE CHANGE
  // ========================================

  function handleTypeChange(
    newType: CollectionType
  ) {
    setForm((current) => ({
      ...current,

      type: newType,

      tagId:
        newType === "MANUAL"
          ? ""
          : current.tagId,
    }));

    setSelectedProductIds([]);
    setProductSearch("");
    setError("");
    setSuccess("");
  }

  // ========================================
  // IMAGE
  // ========================================

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
    setSuccess("");
  }

  // ========================================
  // SAVE COLLECTION
  // ========================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError(
        "Collection name is required."
      );

      return;
    }

    if (
      form.type === "TAG" &&
      !form.tagId
    ) {
      setError(
        "Please select a tag."
      );

      return;
    }

    setSaving(true);

    try {
      const response =
        await fetch(
          `/api/admin/collections/${encodeURIComponent(
            collectionId
          )}`,
          {
            method: "PUT",

            credentials: "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                name:
                  form.name.trim(),

                description:
                  form.description.trim() ||
                  null,

                active:
                  form.active,

                type:
                  form.type,

                tagId:
                  form.type === "TAG"
                    ? form.tagId
                    : null,

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

      if (!response.ok) {
        setError(
          data.message ||
            data.error ||
            "Failed to update collection"
        );

        return;
      }

      setSuccess(
        "تم حفظ إعدادات المجموعة بنجاح."
      );

      setCollection(
        (current) =>
          current
            ? {
                ...current,

                ...data.collection,

                products:
                  current.products,
              }
            : current
      );

      router.refresh();
    } catch (error) {
      console.error(
        "UPDATE COLLECTION ERROR:",
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

  // ========================================
  // CURRENT PRODUCT IDS
  // ========================================

  const currentProductIds = useMemo(
    () =>
      new Set(
        (collection?.products || []).map(
          (item) =>
            item.product.id
        )
      ),
    [collection?.products]
  );

  // ========================================
  // FILTER PRODUCTS
  // ========================================

  const filteredProducts = useMemo(() => {
    const search =
      productSearch
        .trim()
        .toLowerCase();

    if (!search) {
      return allProducts;
    }

    return allProducts.filter(
      (product) =>
        product.name
          .toLowerCase()
          .includes(search) ||
        product.category.name
          .toLowerCase()
          .includes(search)
    );
  }, [
    allProducts,
    productSearch,
  ]);

  // ========================================
  // TOGGLE PRODUCT
  // ========================================

  function toggleProductSelection(
    productId: string
  ) {
    setSelectedProductIds(
      (current) =>
        current.includes(productId)
          ? current.filter(
              (id) =>
                id !== productId
            )
          : [
              ...current,
              productId,
            ]
    );
  }

  // ========================================
  // ADD PRODUCTS
  // ========================================

  async function handleAddProducts() {
    if (
      form.type !== "MANUAL" ||
      selectedProductIds.length === 0
    ) {
      return;
    }

    setAddingProducts(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          `/api/admin/collections/${encodeURIComponent(
            collectionId
          )}/products`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              productIds:
                selectedProductIds,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to add products"
        );
      }

      const addedCount =
        data.added ??
        selectedProductIds.length;

      setSelectedProductIds([]);
      setProductSearch("");

      await refreshCollection();

      setSuccess(
        `تمت إضافة ${addedCount} منتج بنجاح.`
      );
    } catch (error) {
      console.error(
        "ADD PRODUCTS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to add products"
      );
    } finally {
      setAddingProducts(false);
    }
  }

  // ========================================
  // REMOVE PRODUCT FROM COLLECTION
  // ========================================

  async function handleRemoveProduct(
    productId: string
  ) {
    if (
      form.type !== "MANUAL" ||
      !productId
    ) {
      return;
    }

    setRemovingProductId(productId);
    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          `/api/admin/collections/${encodeURIComponent(
            collectionId
          )}/products/${encodeURIComponent(
            productId
          )}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to remove product"
        );
      }

      /*
       * Remove the product immediately from the
       * current UI so the list updates without
       * waiting for a page refresh.
       */
      setCollection(
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            products:
              current.products.filter(
                (item) =>
                  item.product.id !==
                  productId
              ),
          };
        }
      );

      setSelectedProductIds(
        (current) =>
          current.filter(
            (id) =>
              id !== productId
          )
      );

      setSuccess(
        "تمت إزالة المنتج من قائمة المجموعة."
      );

      /*
       * Refresh from the server after the optimistic
       * update to keep sort order and server state exact.
       */
      await refreshCollection();
    } catch (error) {
      console.error(
        "REMOVE PRODUCT ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to remove product"
      );
    } finally {
      setRemovingProductId(null);
    }
  }

  // ========================================
  // MOVE PRODUCT
  // ========================================

  async function handleMoveProduct(
    index: number,
    direction: "up" | "down"
  ) {
    if (
      form.type !== "MANUAL" ||
      !collection
    ) {
      return;
    }

    const products =
      [...collection.products];

    const targetIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= products.length
    ) {
      return;
    }

    [
      products[index],
      products[targetIndex],
    ] = [
      products[targetIndex],
      products[index],
    ];

    const reordered =
      products.map(
        (item, itemIndex) => ({
          ...item,
          sortOrder: itemIndex,
        })
      );

    setCollection(
      (current) =>
        current
          ? {
              ...current,
              products:
                reordered,
            }
          : current
    );

    setReordering(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await fetch(
          `/api/admin/collections/${encodeURIComponent(
            collectionId
          )}/products`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              items:
                reordered.map(
                  (item) => ({
                    productId:
                      item.product.id,
                    sortOrder:
                      item.sortOrder,
                  })
                ),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to update product order"
        );
      }

      setSuccess(
        "تم تحديث ترتيب المنتجات."
      );
    } catch (error) {
      console.error(
        "REORDER PRODUCTS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update product order"
      );

      await refreshCollection();
    } finally {
      setReordering(false);
    }
  }

  // ========================================
  // REFRESH COLLECTION
  // ========================================

  async function refreshCollection() {
    const response =
      await fetch(
        `/api/admin/collections/${encodeURIComponent(
          collectionId
        )}`,
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
          data.error ||
          "Failed to refresh collection"
      );
    }

    const refreshedCollection:
      Collection =
      data.collection;

    setCollection(
      refreshedCollection
    );

    setForm((current) => ({
      ...current,

      name:
        refreshedCollection.name,

      description:
        refreshedCollection.description ||
        "",

      active:
        refreshedCollection.active,

      type:
        refreshedCollection.type,

      tagId:
        refreshedCollection.tagId ||
        "",

      imageUrl:
        refreshedCollection.imageUrl ||
        "",

      imagePublicId:
        refreshedCollection.imagePublicId ||
        "",
    }));
  }

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div
        dir="rtl"
        className="
          mx-auto
          max-w-7xl
          px-4
          py-12
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            rounded-[28px]
            bg-white
            p-10
            text-center
            shadow-[var(--shadow-soft)]
          "
        >
          <p className="text-sm text-[var(--olive-dark)]/60">
            جاري تحميل المجموعة...
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // NOT FOUND
  // ========================================

  if (!collection) {
    return (
      <div
        dir="rtl"
        className="
          mx-auto
          max-w-7xl
          px-4
          py-10
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            rounded-[30px]
            bg-white
            p-8
            text-center
            shadow-[var(--shadow-card)]
          "
        >
          <h1
            className="
              text-xl
              font-semibold
              text-[var(--ink)]
            "
          >
            المجموعة غير موجودة
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-[var(--olive-dark)]/60
            "
          >
            {error ||
              "هذه المجموعة غير موجودة."}
          </p>

          <Link
            href="/admin/collections"
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-[var(--olive-dark)]
              px-5
              py-3
              text-sm
              font-medium
              text-white
              transition
              hover:bg-[var(--brick-dark)]
            "
          >
            العودة إلى المجموعات

            <ArrowUpLeft
              size={15}
              strokeWidth={1.6}
            />
          </Link>
        </div>
      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-[var(--background)]
        px-3
        py-5
        sm:px-6
        sm:py-8
        lg:px-8
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
        "
      >

        {/* ==================================
            HEADER
        ================================== */}

        <header
          className="
            mb-7
            flex
            flex-col
            gap-5
            sm:mb-9
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div className="min-w-0">

            <Link
              href="/admin/collections"
              className="
                inline-flex
                items-center
                gap-2
                text-sm
                font-medium
                text-[var(--olive-dark)]
                transition
                hover:text-[var(--brick-dark)]
              "
            >
              <ArrowUpLeft
                size={15}
                strokeWidth={1.6}
              />

              العودة إلى المجموعات
            </Link>

            <p
              className="
                mt-5
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.3em]
                text-[var(--brick)]
              "
            >
              KOMETIK COLLECTION
            </p>

            <h1
              className="
                mt-2
                text-3xl
                font-medium
                tracking-[-0.04em]
                text-[var(--ink)]
                sm:text-4xl
              "
            >
              {collection.name}.
            </h1>

            <p
              dir="ltr"
              className="
                mt-2
                text-[11px]
                text-[var(--olive-dark)]/45
              "
            >
              /collections/{collection.slug}
            </p>

          </div>

          <div
            className={`
              inline-flex
              self-start
              items-center
              gap-2
              rounded-full
              px-4
              py-2
              text-xs
              font-semibold
              ${
                collection.active
                  ? "bg-[var(--olive)]/10 text-[var(--olive-dark)]"
                  : "bg-black/5 text-black/45"
              }
            `}
          >
            <span
              className={`
                h-1.5
                w-1.5
                rounded-full
                ${
                  collection.active
                    ? "bg-[var(--brick)]"
                    : "bg-black/25"
                }
              `}
            />

            {collection.active
              ? "نشطة"
              : "متوقفة"}
          </div>
        </header>

        {/* ==================================
            MESSAGES
        ================================== */}

        {(error || success) && (
          <div className="mb-6">

            {error && (
              <div
                className="
                  rounded-2xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  leading-6
                  text-red-600
                "
              >
                {error}
              </div>
            )}

            {!error && success && (
              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-2xl
                  border
                  border-[var(--olive)]/15
                  bg-[var(--olive)]/5
                  px-4
                  py-3
                  text-sm
                  leading-6
                  text-[var(--olive-dark)]
                "
              >
                <Check
                  size={16}
                  strokeWidth={1.8}
                />

                {success}
              </div>
            )}

          </div>
        )}

        {/* ==================================
            MAIN
        ================================== */}

        <div
          className="
            grid
            gap-7
            lg:grid-cols-[minmax(0,1fr)_390px]
          "
        >

          {/* ==================================
              PRODUCTS
          ================================== */}

          <section
            className="
              min-w-0
              rounded-[30px]
              bg-white
              p-5
              shadow-[var(--shadow-soft)]
              sm:p-7
            "
          >

            {/* PRODUCTS HEADER */}

            <div
              className="
                flex
                items-end
                justify-between
                gap-5
              "
            >
              <div>

                <p
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.3em]
                    text-[var(--brick)]
                  "
                >
                  THE SELECTION
                </p>

                <h2
                  className="
                    mt-2
                    text-2xl
                    font-medium
                    tracking-[-0.04em]
                    text-[var(--ink)]
                  "
                >
                  منتجات المجموعة.
                </h2>

              </div>

              <span
                className="
                  flex
                  h-9
                  min-w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--cream)]
                  px-3
                  text-xs
                  font-semibold
                  text-[var(--olive-dark)]
                "
              >
                {collection.products.length}
              </span>
            </div>

            {/* TAG INFO */}

            {form.type === "TAG" && (
              <div
                className="
                  mt-6
                  rounded-[24px]
                  bg-[var(--cream)]/70
                  p-5
                "
              >
                <p
                  className="
                    text-sm
                    font-semibold
                    text-[var(--ink)]
                  "
                >
                  هذه مجموعة تلقائية
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-6
                    text-[var(--olive-dark)]/65
                  "
                >
                  المنتجات يتم جلبها تلقائيًا من الوسم{" "}
                  <span
                    className="
                      font-semibold
                      text-[var(--brick-dark)]
                    "
                  >
                    #{collection.tag?.name ||
                      "المحدد"}
                  </span>
                  .
                </p>
              </div>
            )}

            {/* MANUAL SEARCH */}

            {form.type === "MANUAL" && (
              <div className="mt-7">

                <label
                  htmlFor="product-search"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-[var(--olive-dark)]
                  "
                >
                  إضافة منتجات
                </label>

                <div className="relative">

                  <Search
                    size={16}
                    strokeWidth={1.6}
                    className="
                      pointer-events-none
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-[var(--olive-dark)]/35
                    "
                  />

                  <input
                    id="product-search"
                    type="search"
                    value={productSearch}
                    onChange={(event) =>
                      setProductSearch(
                        event.target.value
                      )
                    }
                    placeholder="ابحث باسم المنتج أو التصنيف..."
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-[var(--sand)]
                      bg-[var(--cream)]/45
                      py-3.5
                      pl-4
                      pr-11
                      text-sm
                      text-[var(--ink)]
                      outline-none
                      transition
                      placeholder:text-[var(--olive-dark)]/35
                      focus:border-[var(--brick)]/40
                      focus:bg-white
                    "
                  />

                </div>

                {/* SEARCH RESULTS */}

                <div
                  className="
                    mt-3
                    max-h-72
                    overflow-y-auto
                    rounded-[22px]
                    border
                    border-[var(--sand)]
                    bg-[var(--cream)]/30
                  "
                >

                  {loadingProducts ? (
                    <div
                      className="
                        p-7
                        text-center
                        text-sm
                        text-[var(--olive-dark)]/50
                      "
                    >
                      جاري تحميل المنتجات...
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div
                      className="
                        p-7
                        text-center
                      "
                    >
                      <p
                        className="
                          text-sm
                          font-semibold
                          text-[var(--ink)]
                        "
                      >
                        لا توجد منتجات
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          text-[var(--olive-dark)]/50
                        "
                      >
                        جرّب كلمة بحث أخرى.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--sand)]/60">

                      {filteredProducts.map(
                        (product) => {
                          const alreadyAdded =
                            currentProductIds.has(
                              product.id
                            );

                          const selected =
                            selectedProductIds.includes(
                              product.id
                            );

                          return (
                            <label
                              key={product.id}
                              className={`
                                flex
                                cursor-pointer
                                items-center
                                gap-3
                                p-3
                                transition
                                ${
                                  alreadyAdded
                                    ? "cursor-not-allowed opacity-45"
                                    : selected
                                      ? "bg-[var(--brick)]/5"
                                      : "hover:bg-white"
                                }
                              `}
                            >

                              <input
                                type="checkbox"
                                checked={
                                  selected
                                }
                                disabled={
                                  alreadyAdded
                                }
                                onChange={() =>
                                  toggleProductSelection(
                                    product.id
                                  )
                                }
                                className="
                                  h-4
                                  w-4
                                  shrink-0
                                  accent-[var(--brick)]
                                "
                              />

                              <div
                                className="
                                  relative
                                  h-11
                                  w-11
                                  shrink-0
                                  overflow-hidden
                                  rounded-xl
                                  bg-white
                                "
                              >
                                {product.imagePublicId ||
                                product.imageUrl ? (
                                  <CloudinaryProductImage
                                    imagePublicId={
                                      product.imagePublicId
                                    }
                                    imageUrl={
                                      product.imageUrl
                                    }
                                    alt={
                                      product.name
                                    }
                                    fill
                                    sizes="44px"
                                    className="object-contain p-1"
                                  />
                                ) : null}
                              </div>

                              <div className="min-w-0 flex-1">

                                <p
                                  className="
                                    truncate
                                    text-xs
                                    font-semibold
                                    text-[var(--ink)]
                                  "
                                >
                                  {product.name}
                                </p>

                                <p
                                  className="
                                    mt-1
                                    text-[10px]
                                    text-[var(--olive-dark)]/50
                                  "
                                >
                                  {product.category.name}
                                </p>

                              </div>

                              <div className="shrink-0">

                                {alreadyAdded ? (
                                  <span
                                    className="
                                      rounded-full
                                      bg-[var(--olive)]/10
                                      px-2.5
                                      py-1
                                      text-[9px]
                                      font-semibold
                                      text-[var(--olive-dark)]
                                    "
                                  >
                                    مضاف
                                  </span>
                                ) : (
                                  <span
                                    className="
                                      text-xs
                                      font-semibold
                                      text-[var(--brick-dark)]
                                    "
                                    dir="ltr"
                                  >
                                    $
                                    {product.price.toFixed(
                                      2
                                    )}
                                  </span>
                                )}

                              </div>

                            </label>
                          );
                        }
                      )}

                    </div>
                  )}

                </div>

                {/* ADD BUTTON */}

                <button
                  type="button"
                  onClick={
                    handleAddProducts
                  }
                  disabled={
                    addingProducts ||
                    selectedProductIds.length === 0
                  }
                  className="
                    mt-3
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-[var(--brick-dark)]
                    px-5
                    py-3.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-[var(--brick)]
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <Plus
                    size={16}
                    strokeWidth={1.8}
                  />

                  {addingProducts
                    ? "جاري إضافة المنتجات..."
                    : selectedProductIds.length > 0
                      ? `إضافة ${selectedProductIds.length} منتج`
                      : "اختر منتجات للإضافة"}
                </button>

              </div>
            )}

            {/* CURRENT PRODUCTS */}

            <div className="mt-8">

              <div
                className="
                  mb-4
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >
                <h3
                  className="
                    text-sm
                    font-semibold
                    text-[var(--ink)]
                  "
                >
                  المنتجات الحالية
                </h3>

                {form.type === "MANUAL" &&
                  collection.products.length > 1 && (
                    <span
                      className="
                        text-[10px]
                        text-[var(--olive-dark)]/45
                      "
                    >
                      استخدم الأسهم لتغيير الترتيب
                    </span>
                  )}
              </div>

              {collection.products.length === 0 ? (
                <div
                  className="
                    rounded-[24px]
                    border
                    border-dashed
                    border-[var(--sand)]
                    bg-[var(--cream)]/35
                    p-10
                    text-center
                  "
                >
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-[var(--ink)]
                    "
                  >
                    لا توجد منتجات
                  </p>

                  <p
                    className="
                      mt-2
                      text-xs
                      leading-6
                      text-[var(--olive-dark)]/50
                    "
                  >
                    {form.type === "MANUAL"
                      ? "ابحث عن المنتجات أعلاه ثم اختر ما تريد إضافته."
                      : "لا توجد منتجات مرتبطة بهذا الوسم حاليًا."}
                  </p>
                </div>
              ) : (
                <div
                  className="
                    grid
                    grid-cols-2
                    gap-x-3
                    gap-y-7
                    sm:grid-cols-3
                    lg:grid-cols-3
                    xl:grid-cols-4
                  "
                >
                  {collection.products.map(
                    (item, index) => {
                      const product =
                        item.product;

                      const isRemoving =
                        removingProductId ===
                        product.id;

                      return (
                        <article
                          key={product.id}
                          className="
                            group
                            relative
                            min-w-0
                          "
                        >

                          {/* IMAGE */}

                          <div
                            className="
                              relative
                              aspect-[4/5]
                              overflow-hidden
                              rounded-[24px]
                              bg-white
                            "
                          >

                            <Link
                              href={`/shop/products/${product.id}`}
                              target="_blank"
                              aria-label={`عرض ${product.name}`}
                              className="
                                absolute
                                inset-0
                                z-0
                              "
                            >
                              {product.imagePublicId ||
                              product.imageUrl ? (
                                <CloudinaryProductImage
                                  imagePublicId={
                                    product.imagePublicId
                                  }
                                  imageUrl={
                                    product.imageUrl
                                  }
                                  alt={
                                    product.name
                                  }
                                  fill
                                  sizes="
                                    (max-width: 640px) 50vw,
                                    (max-width: 1024px) 33vw,
                                    25vw
                                  "
                                  className="
                                    object-contain
                                    p-4
                                    transition-transform
                                    duration-700
                                    ease-[var(--ease-editorial)]
                                    group-hover:scale-[1.055]
                                  "
                                />
                              ) : (
                                <div
                                  className="
                                    flex
                                    h-full
                                    items-center
                                    justify-center
                                    text-xs
                                    text-[var(--olive-dark)]/40
                                  "
                                >
                                  لا توجد صورة
                                </div>
                              )}
                            </Link>

                            {/* ORDER */}

                            <span
                              className="
                                pointer-events-none
                                absolute
                                right-3
                                top-3
                                z-20
                                flex
                                h-7
                                min-w-7
                                items-center
                                justify-center
                                rounded-full
                                bg-[var(--cream)]/90
                                px-2
                                text-[9px]
                                font-semibold
                                text-[var(--olive-dark)]
                                backdrop-blur-md
                              "
                            >
                              {index + 1}
                            </span>

                            {/* STOCK */}

                            <span
                              className="
                                pointer-events-none
                                absolute
                                bottom-3
                                right-3
                                z-20
                                rounded-full
                                bg-[var(--cream)]/90
                                px-2.5
                                py-1
                                text-[8px]
                                font-medium
                                uppercase
                                tracking-[0.12em]
                                text-[var(--olive-dark)]/70
                                backdrop-blur-md
                              "
                            >
                              {product.stock > 0
                                ? "IN STOCK"
                                : "SOLD OUT"}
                            </span>

                            {/* REMOVE FROM COLLECTION */}

                            {form.type === "MANUAL" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveProduct(
                                    product.id
                                  )
                                }
                                disabled={
                                  isRemoving ||
                                  reordering
                                }
                                aria-label={`إزالة ${product.name} من قائمة المجموعة`}
                                title="إزالة من المجموعة"
                                className="
                                  absolute
                                  left-3
                                  top-3
                                  z-[200]
                                  flex
                                  h-9
                                  w-9
                                  items-center
                                  justify-center
                                  rounded-full
                                  bg-white/95
                                  text-[var(--olive-dark)]
                                  shadow-[0_8px_24px_rgba(0,0,0,0.10)]
                                  backdrop-blur-md
                                  transition-all
                                  duration-300
                                  hover:scale-105
                                  hover:bg-red-50
                                  hover:text-red-500
                                  active:scale-95
                                  disabled:cursor-not-allowed
                                  disabled:opacity-40
                                "
                              >
                                {isRemoving ? (
                                  <span
                                    className="
                                      text-[10px]
                                      font-semibold
                                    "
                                  >
                                    ...
                                  </span>
                                ) : (
                                  <Trash2
                                    size={14}
                                    strokeWidth={1.7}
                                  />
                                )}
                              </button>
                            )}

                          </div>

                          {/* PRODUCT INFO */}

                          <div className="pt-3">

                            <p
                              className="
                                text-[8px]
                                uppercase
                                tracking-[0.2em]
                                text-[var(--olive-dark)]/50
                              "
                            >
                              {
                                product.category
                                  .name
                              }
                            </p>

                            <div
                              className="
                                mt-1
                                flex
                                items-start
                                justify-between
                                gap-2
                              "
                            >

                              <Link
                                href={`/shop/products/${product.id}`}
                                target="_blank"
                                className="min-w-0"
                              >
                                <h4
                                  className="
                                    line-clamp-2
                                    text-xs
                                    font-medium
                                    leading-5
                                    text-[var(--ink)]
                                    transition
                                    group-hover:text-[var(--brick-dark)]
                                    sm:text-sm
                                  "
                                >
                                  {product.name}
                                </h4>
                              </Link>

                              <ArrowUpLeft
                                size={13}
                                strokeWidth={1.5}
                                className="
                                  mt-0.5
                                  shrink-0
                                  text-[var(--olive-dark)]/20
                                  transition
                                  group-hover:-translate-x-1
                                  group-hover:-translate-y-1
                                  group-hover:text-[var(--brick)]
                                "
                              />

                            </div>

                            <div
                              className="
                                mt-2
                                flex
                                items-center
                                justify-between
                                gap-2
                              "
                            >

                              <p
                                className="
                                  text-sm
                                  font-semibold
                                  text-[var(--brick-dark)]
                                "
                                dir="ltr"
                              >
                                $
                                {product.price.toFixed(
                                  2
                                )}
                              </p>

                              {form.type ===
                                "MANUAL" && (
                                <div
                                  className="
                                    flex
                                    items-center
                                    gap-1
                                  "
                                >

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleMoveProduct(
                                        index,
                                        "up"
                                      )
                                    }
                                    disabled={
                                      index === 0 ||
                                      reordering ||
                                      removingProductId !==
                                        null
                                    }
                                    title="نقل للأعلى"
                                    className="
                                      flex
                                      h-7
                                      w-7
                                      items-center
                                      justify-center
                                      rounded-full
                                      bg-[var(--cream)]
                                      text-[var(--olive-dark)]
                                      transition
                                      hover:bg-[var(--olive)]
                                      hover:text-white
                                      disabled:cursor-not-allowed
                                      disabled:opacity-25
                                    "
                                  >
                                    <ArrowUp
                                      size={12}
                                      strokeWidth={1.7}
                                    />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleMoveProduct(
                                        index,
                                        "down"
                                      )
                                    }
                                    disabled={
                                      index ===
                                        collection.products.length -
                                          1 ||
                                      reordering ||
                                      removingProductId !==
                                        null
                                    }
                                    title="نقل للأسفل"
                                    className="
                                      flex
                                      h-7
                                      w-7
                                      items-center
                                      justify-center
                                      rounded-full
                                      bg-[var(--cream)]
                                      text-[var(--olive-dark)]
                                      transition
                                      hover:bg-[var(--olive)]
                                      hover:text-white
                                      disabled:cursor-not-allowed
                                      disabled:opacity-25
                                    "
                                  >
                                    <ArrowDown
                                      size={12}
                                      strokeWidth={1.7}
                                    />
                                  </button>

                                </div>
                              )}

                            </div>

                          </div>

                        </article>
                      );
                    }
                  )}
                </div>
              )}

            </div>

          </section>

          {/* ==================================
              SETTINGS
          ================================== */}

          <section
            className="
              h-fit
              rounded-[30px]
              bg-white
              p-5
              shadow-[var(--shadow-soft)]
              sm:p-7
            "
          >

            <div className="mb-7">

              <p
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.3em]
                  text-[var(--brick)]
                "
              >
                COLLECTION SETTINGS
              </p>

              <h2
                className="
                  mt-2
                  text-2xl
                  font-medium
                  tracking-[-0.04em]
                  text-[var(--ink)]
                "
              >
                إعدادات المجموعة.
              </h2>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* NAME */}

              <div>

                <label
                  htmlFor="name"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-[var(--olive-dark)]
                  "
                >
                  اسم المجموعة
                </label>

                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name:
                        event.target.value,
                    }))
                  }
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-[var(--sand)]
                    bg-[var(--cream)]/35
                    px-4
                    py-3
                    text-sm
                    text-[var(--ink)]
                    outline-none
                    transition
                    focus:border-[var(--brick)]/40
                    focus:bg-white
                  "
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label
                  htmlFor="description"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-[var(--olive-dark)]
                  "
                >
                  وصف المجموعة
                </label>

                <textarea
                  id="description"
                  rows={5}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description:
                        event.target.value,
                    }))
                  }
                  className="
                    w-full
                    resize-none
                    rounded-2xl
                    border
                    border-[var(--sand)]
                    bg-[var(--cream)]/35
                    px-4
                    py-3
                    text-sm
                    leading-6
                    text-[var(--ink)]
                    outline-none
                    transition
                    focus:border-[var(--brick)]/40
                    focus:bg-white
                  "
                />

              </div>

              {/* TYPE */}

              <div>

                <label
                  className="
                    mb-3
                    block
                    text-xs
                    font-semibold
                    text-[var(--olive-dark)]
                  "
                >
                  نوع المجموعة
                </label>

                <div
                  className="
                    grid
                    gap-2
                    sm:grid-cols-2
                  "
                >

                  <button
                    type="button"
                    onClick={() =>
                      handleTypeChange(
                        "MANUAL"
                      )
                    }
                    className={`
                      rounded-2xl
                      border
                      p-4
                      text-right
                      transition
                      ${
                        form.type === "MANUAL"
                          ? "border-[var(--brick)]/50 bg-[var(--brick)]/5"
                          : "border-[var(--sand)] bg-white hover:bg-[var(--cream)]/40"
                      }
                    `}
                  >
                    <p
                      className="
                        text-sm
                        font-semibold
                        text-[var(--ink)]
                      "
                    >
                      يدوية
                    </p>

                    <p
                      className="
                        mt-1
                        text-[10px]
                        leading-5
                        text-[var(--olive-dark)]/55
                      "
                    >
                      أنت تحدد المنتجات بنفسك.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleTypeChange(
                        "TAG"
                      )
                    }
                    className={`
                      rounded-2xl
                      border
                      p-4
                      text-right
                      transition
                      ${
                        form.type === "TAG"
                          ? "border-[var(--brick)]/50 bg-[var(--brick)]/5"
                          : "border-[var(--sand)] bg-white hover:bg-[var(--cream)]/40"
                      }
                    `}
                  >
                    <p
                      className="
                        text-sm
                        font-semibold
                        text-[var(--ink)]
                      "
                    >
                      حسب الوسم
                    </p>

                    <p
                      className="
                        mt-1
                        text-[10px]
                        leading-5
                        text-[var(--olive-dark)]/55
                      "
                    >
                      المنتجات تظهر تلقائيًا حسب الوسم.
                    </p>
                  </button>

                </div>

              </div>

              {/* TAG */}

              {form.type === "TAG" && (
                <div>

                  <label
                    htmlFor="tag"
                    className="
                      mb-2
                      block
                      text-xs
                      font-semibold
                      text-[var(--olive-dark)]
                    "
                  >
                    الوسم
                  </label>

                  <select
                    id="tag"
                    value={form.tagId}
                    disabled={
                      loadingTags
                    }
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        tagId:
                          event.target.value,
                      }))
                    }
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-[var(--sand)]
                      bg-white
                      px-4
                      py-3
                      text-sm
                      text-[var(--ink)]
                      outline-none
                      focus:border-[var(--brick)]/40
                      disabled:bg-[var(--cream)]
                    "
                  >

                    <option value="">
                      {loadingTags
                        ? "جاري تحميل الوسوم..."
                        : "اختر الوسم"}
                    </option>

                    {tags.map(
                      (tag) => (
                        <option
                          key={tag.id}
                          value={tag.id}
                        >
                          {tag.name}
                        </option>
                      )
                    )}

                  </select>

                </div>
              )}

              {/* ACTIVE */}

              <div
                className="
                  rounded-[22px]
                  bg-[var(--cream)]/55
                  p-4
                "
              >

                <label
                  className="
                    flex
                    cursor-pointer
                    items-center
                    justify-between
                    gap-4
                  "
                >

                  <div>

                    <p
                      className="
                        text-sm
                        font-semibold
                        text-[var(--ink)]
                      "
                    >
                      المجموعة نشطة
                    </p>

                    <p
                      className="
                        mt-1
                        text-[10px]
                        leading-5
                        text-[var(--olive-dark)]/55
                      "
                    >
                      يمكن إيقاف ظهورها دون حذفها.
                    </p>

                  </div>

                  <input
                    type="checkbox"
                    checked={
                      form.active
                    }
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        active:
                          event.target.checked,
                      }))
                    }
                    className="
                      h-5
                      w-5
                      accent-[var(--brick)]
                    "
                  />

                </label>

              </div>

              {/* IMAGE */}

              <div>

                <div className="mb-3">

                  <label
                    className="
                      block
                      text-xs
                      font-semibold
                      text-[var(--olive-dark)]
                    "
                  >
                    صورة المجموعة
                  </label>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      leading-5
                      text-[var(--olive-dark)]/50
                    "
                  >
                    ارفع صورة المجموعة باستخدام Cloudinary.
                  </p>

                </div>

                <ProductImageUpload
                  imageUrl={
                    form.imageUrl ||
                    null
                  }
                  onUpload={
                    handleImageUpload
                  }
                />

              </div>

              {/* SAVE */}

              <div
                className="
                  flex
                  flex-col
                  gap-2
                "
              >

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-[var(--brick-dark)]
                    px-6
                    py-3.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-[var(--brick)]
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <Check
                    size={16}
                    strokeWidth={1.8}
                  />

                  {saving
                    ? "جاري الحفظ..."
                    : "حفظ التغييرات"}
                </button>

                <Link
                  href="/admin/collections"
                  className="
                    flex
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-[var(--sand)]
                    bg-white
                    px-6
                    py-3.5
                    text-sm
                    font-semibold
                    text-[var(--olive-dark)]
                    transition
                    hover:bg-[var(--cream)]/60
                  "
                >
                  إلغاء
                </Link>

              </div>

            </form>

          </section>

        </div>

      </div>
    </main>
  );
}
