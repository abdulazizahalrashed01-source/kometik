"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Loader2,
  Search,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import CloudinaryProductImage from "@/components/CloudinaryProductImage";

type SearchProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  imagePublicId: string | null;
  category: {
    name: string;
  };
};

type SearchResponse = {
  products?: SearchProduct[];
};

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
  initialQuery?: string;
};

const POPULAR_SEARCHES = [
  "سيرومات",
  "واقي شمس",
  "مرطبات",
  "العناية بالبشرة",
  "La Roche-Posay",
  "نياسيناميد",
];

export default function SearchOverlay({
  open,
  onClose,
  initialQuery = "",
}: SearchOverlayProps) {
  const [query, setQuery] =
    useState(initialQuery);

  const [products, setProducts] =
    useState<
      SearchProduct[]
    >([]);

  const [
    suggestions,
    setSuggestions,
  ] = useState<
    SearchProduct[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [
    suggestionsLoading,
    setSuggestionsLoading,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const inputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    setQuery(initialQuery);

    const oldOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    const timer =
      window.setTimeout(
        () => {
          inputRef.current?.focus();
        },
        120
      );

    return () => {
      window.clearTimeout(
        timer
      );

      document.body.style.overflow =
        oldOverflow;
    };
  }, [
    open,
    initialQuery,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled =
      false;

    async function loadSuggestions() {
      setSuggestionsLoading(
        true
      );

      try {
        const response =
          await fetch(
            "/api/shop/products",
            {
              cache:
                "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Failed"
          );
        }

        const data:
          SearchResponse =
          await response.json();

        if (!cancelled) {
          setSuggestions(
            data.products?.slice(
              0,
              4
            ) ?? []
          );
        }
      } catch {
        if (!cancelled) {
          setSuggestions(
            []
          );
        }
      } finally {
        if (!cancelled) {
          setSuggestionsLoading(
            false
          );
        }
      }
    }

    loadSuggestions();

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const value =
      query.trim();

    if (!value) {
      setProducts([]);
      setError("");
      setLoading(false);
      return;
    }

    const controller =
      new AbortController();

    const timer =
      window.setTimeout(
        async () => {
          setLoading(true);
          setError("");

          try {
            const response =
              await fetch(
                `/api/shop/search?q=${encodeURIComponent(
                  value
                )}`,
                {
                  cache:
                    "no-store",
                  signal:
                    controller.signal,
                }
              );

            if (!response.ok) {
              throw new Error(
                "Search failed"
              );
            }

            const data:
              SearchResponse =
              await response.json();

            setProducts(
              data.products ?? []
            );
          } catch (
            searchError
          ) {
            if (
              searchError instanceof
                DOMException &&
              searchError.name ===
                "AbortError"
            ) {
              return;
            }

            setProducts([]);
            setError(
              "حدث خطأ أثناء البحث."
            );
          } finally {
            setLoading(
              false
            );
          }
        },
        300
      );

    return () => {
      window.clearTimeout(
        timer
      );

      controller.abort();
    };
  }, [
    query,
    open,
  ]);

  function submitSearch(
    value = query
  ) {
    const searchValue =
      value.trim();

    if (!searchValue) {
      return;
    }

    onClose();

    window.location.href =
      `/shop/products?search=${encodeURIComponent(
        searchValue
      )}`;
  }

  if (!open) {
    return null;
  }

  const hasQuery =
    query.trim().length >
    0;

  return (
    <div
      dir="rtl"
      className="
        fixed
        inset-0
        z-[120]
        bg-[var(--ink)]/30
        px-3
        pt-20
        backdrop-blur-[7px]
        sm:px-6
        sm:pt-24
      "
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="البحث في Kometik"
        className="
          mx-auto
          flex
          max-h-[84vh]
          w-full
          max-w-[1040px]
          flex-col
          overflow-hidden
          rounded-[30px]
          bg-[var(--cream)]
          shadow-[0_35px_110px_rgba(23,23,23,0.20)]
          animate-[searchDiscoveryIn_420ms_cubic-bezier(.22,1,.36,1)]
        "
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div
          className="
            flex
            items-center
            justify-between
            px-5
            pt-5
            sm:px-7
            sm:pt-7
          "
        >
          <div className="flex items-center gap-3">
            <span className="h-8 w-px bg-[var(--brick)]" />

            <div>
              <p
                className="
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.3em]
                  text-[var(--olive)]
                "
              >
                DISCOVER
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-medium
                  text-[var(--ink)]
                "
              >
                اكتشفي ما يناسبك
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق البحث"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-white
              text-[var(--olive-dark)]
              transition
              hover:bg-[var(--ink)]
              hover:text-white
            "
          >
            <X
              size={16}
              strokeWidth={1.7}
            />
          </button>
        </div>

        <div className="px-5 pb-4 pt-5 sm:px-7">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
          >
            <div
              className="
                relative
                overflow-hidden
                rounded-[22px]
                bg-white
                ring-1
                ring-black/[0.05]
              "
            >
              <Search
                size={19}
                strokeWidth={1.6}
                className="
                  pointer-events-none
                  absolute
                  right-5
                  top-1/2
                  -translate-y-1/2
                  text-[var(--olive)]
                "
              />

              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(
                  event
                ) =>
                  setQuery(
                    event.target.value
                  )
                }
                onKeyDown={(
                  event
                ) => {
                  if (
                    event.key ===
                    "Escape"
                  ) {
                    event.preventDefault();
                    onClose();
                  }
                }}
                placeholder="ابحث عن منتج، علامة أو مكوّن..."
                aria-label="البحث عن منتج أو علامة أو مكوّن"
                autoComplete="off"
                spellCheck={false}
                className="
                  h-16
                  w-full
                  bg-transparent
                  px-14
                  text-right
                  text-base
                  font-medium
                  text-[var(--ink)]
                  outline-none
                  placeholder:text-black/30
                  sm:h-[74px]
                  sm:text-lg
                "
              />

              {loading && (
                <Loader2
                  size={18}
                  className="
                    absolute
                    left-5
                    top-1/2
                    -translate-y-1/2
                    animate-spin
                    text-[var(--brick)]
                  "
                />
              )}
            </div>
          </form>

          <div
            className="
              mt-2
              flex
              justify-between
              text-[9px]
              text-[var(--olive-dark)]/50
            "
          >
            <span>
              Enter للبحث
            </span>

            <span>
              ESC للإغلاق
            </span>
          </div>
        </div>

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-5
            pb-7
            sm:px-7
          "
        >
          {!hasQuery ? (
            <div
              className="
                grid
                gap-8
                lg:grid-cols-[0.7fr_1.3fr]
              "
            >
              <section>
                <p
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.28em]
                    text-[var(--olive-dark)]/55
                  "
                >
                  POPULAR SEARCHES
                </p>

                <h2
                  className="
                    mt-2
                    text-2xl
                    font-medium
                    text-[var(--ink)]
                  "
                >
                  ماذا تبحثين عنه؟
                </h2>

                <div className="mt-5 flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          setQuery(
                            item
                          )
                        }
                        className="
                          rounded-full
                          bg-white/75
                          px-4
                          py-2.5
                          text-xs
                          font-medium
                          text-[var(--olive-dark)]
                          ring-1
                          ring-[var(--olive)]/10
                          transition
                          hover:-translate-y-0.5
                          hover:text-[var(--brick-dark)]
                          hover:ring-[var(--brick)]/30
                        "
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              </section>

              <section>
                <div className="flex items-end justify-between">
                  <div>
                    <p
                      className="
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.28em]
                        text-[var(--olive-dark)]/55
                      "
                    >
                      CURATED FOR YOU
                    </p>

                    <h2
                      className="
                        mt-2
                        text-xl
                        font-medium
                        text-[var(--ink)]
                      "
                    >
                      قد يعجبك أيضاً
                    </h2>
                  </div>

                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="
                      hidden
                      items-center
                      gap-2
                      text-xs
                      font-medium
                      text-[var(--olive-dark)]
                      hover:text-[var(--brick-dark)]
                      sm:inline-flex
                    "
                  >
                    كل المنتجات
                    <ArrowLeft
                      size={14}
                    />
                  </Link>
                </div>

                <div className="mt-4">
                  {suggestionsLoading ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[1, 2, 3, 4].map(
                        (item) => (
                          <div
                            key={item}
                            className="
                              aspect-[4/4.8]
                              animate-pulse
                              rounded-[18px]
                              bg-black/[0.05]
                            "
                          />
                        )
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {suggestions.map(
                        (product) => (
                          <Link
                            key={product.id}
                            href={`/shop/products/${product.id}`}
                            onClick={onClose}
                            className="group min-w-0"
                          >
                            <div
                              className="
                                relative
                                aspect-[4/4.8]
                                overflow-hidden
                                rounded-[18px]
                                bg-white
                              "
                            >
                              <CloudinaryProductImage
                                imageUrl={
                                  product.imageUrl
                                }
                                imagePublicId={
                                  product.imagePublicId
                                }
                                alt={
                                  product.name
                                }
                                fill
                                sizes="
                                  (max-width: 640px) 50vw,
                                  25vw
                                "
                                className="
                                  object-contain
                                  p-4
                                  transition
                                  duration-500
                                  group-hover:scale-[1.05]
                                "
                              />
                            </div>

                            <p className="mt-2 line-clamp-1 text-xs font-medium">
                              {product.name}
                            </p>

                            <p className="mt-1 text-[9px] text-[var(--olive-dark)]/55">
                              {
                                product
                                  .category
                                  .name
                              }
                            </p>

                            <p
                              className="mt-1 text-xs font-semibold text-[var(--brick-dark)]"
                              dir="ltr"
                            >
                              $
                              {product.price.toFixed(
                                2
                              )}
                            </p>
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>
          ) : (
            <section>
              <div
                className="
                  flex
                  items-center
                  justify-between
                  border-b
                  border-[var(--olive)]/10
                  pb-4
                "
              >
                <div>
                  <p
                    className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.28em]
                      text-[var(--olive-dark)]/55
                    "
                  >
                    SEARCH RESULTS
                  </p>

                  <h2
                    className="
                      mt-1
                      text-lg
                      font-medium
                      text-[var(--ink)]
                    "
                  >
                    نتائج البحث
                  </h2>
                </div>

                {!loading &&
                  products.length >
                    0 && (
                    <span className="text-xs text-[var(--olive-dark)]/50">
                      {
                        products.length
                      }{" "}
                      منتج
                    </span>
                  )}
              </div>

              {loading ? (
                <div className="kometik-space-y-3 pt-4">
                  {[1, 2, 3, 4].map(
                    (item) => (
                      <div
                        key={item}
                        className="
                          flex
                          gap-4
                          border-b
                          border-[var(--olive)]/10
                          pb-3
                        "
                      >
                        <div
                          className="
                            h-20
                            w-16
                            shrink-0
                            animate-pulse
                            rounded-xl
                            bg-black/[0.05]
                          "
                        />

                        <div className="flex-1 kometik-space-y-2 py-2">
                          <div className="h-3 w-1/2 animate-pulse rounded-full bg-black/[0.05]" />
                          <div className="h-2.5 w-3/4 animate-pulse rounded-full bg-black/[0.04]" />
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : error ? (
                <div className="py-16 text-center text-sm text-[var(--brick-dark)]">
                  {error}
                </div>
              ) : products.length ===
                0 ? (
                <div
                  className="
                    flex
                    min-h-[220px]
                    flex-col
                    items-center
                    justify-center
                    text-center
                  "
                >
                  <Search
                    size={22}
                    strokeWidth={1.4}
                    className="text-[var(--olive-dark)]/40"
                  />

                  <h3 className="mt-4 text-base font-medium">
                    لم نجد ما تبحثين عنه
                  </h3>

                  <p className="mt-2 max-w-sm text-xs leading-6 text-[var(--olive-dark)]/60">
                    جربي كلمة أخرى أو
                    تصفحي التصنيفات.
                  </p>
                </div>
              ) : (
                <div className="kometik-space-y-1 pt-4">
                  {products
                    .slice(0, 8)
                    .map(
                      (product) => (
                        <Link
                          key={product.id}
                          href={`/shop/products/${product.id}`}
                          onClick={onClose}
                          className="
                            group
                            flex
                            items-center
                            gap-4
                            rounded-2xl
                            px-2
                            py-3
                            transition
                            hover:bg-white/75
                          "
                        >
                          <div
                            className="
                              h-16
                              w-14
                              shrink-0
                              overflow-hidden
                              rounded-xl
                              bg-white
                            "
                          >
                            <CloudinaryProductImage
                              imageUrl={
                                product.imageUrl
                              }
                              imagePublicId={
                                product.imagePublicId
                              }
                              alt={
                                product.name
                              }
                              className="
                                h-full
                                w-full
                                object-contain
                                p-2
                                transition
                                duration-500
                                group-hover:scale-[1.04]
                              "
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {product.name}
                            </p>

                            <p className="mt-1 text-[10px] text-[var(--olive-dark)]/55">
                              {
                                product
                                  .category
                                  .name
                              }
                            </p>

                            <p
                              className="mt-1 text-xs font-semibold text-[var(--brick-dark)]"
                              dir="ltr"
                            >
                              $
                              {product.price.toFixed(
                                2
                              )}
                            </p>
                          </div>

                          <ArrowLeft
                            size={15}
                            strokeWidth={1.5}
                            className="
                              shrink-0
                              text-[var(--olive-dark)]/30
                              transition
                              group-hover:-translate-x-1
                              group-hover:text-[var(--brick)]
                            "
                          />
                        </Link>
                      )
                    )}
                </div>
              )}
            </section>
          )}
        </div>
      </section>
</div>
  );
}
