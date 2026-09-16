import Link from "next/link";

import { prisma } from "@/lib/prisma";

import CloudinaryProductImage from "@/components/CloudinaryProductImage";

// ==========================================
// ADMIN COLLECTIONS PAGE
// ==========================================

export default async function AdminCollectionsPage() {
  // ==========================================
  // GET COLLECTIONS
  // ==========================================

  const collections =
    await prisma.collection.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        tag: true,

        _count: {
          select: {
            products: true,
          },
        },
      },
    });

  // ==========================================
  // STATS
  // ==========================================

  const totalCollections =
    collections.length;

  const activeCollections =
    collections.filter(
      (collection) =>
        collection.active
    ).length;

  const manualCollections =
    collections.filter(
      (collection) =>
        collection.type === "MANUAL"
    ).length;

  const tagCollections =
    collections.filter(
      (collection) =>
        collection.type === "TAG"
    ).length;

  // ==========================================
  // UI
  // ==========================================

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-(--background)
        px-3
        py-5
        sm:px-6
        sm:py-8
        lg:px-8
      "
    >
      <div className="mx-auto max-w-7xl">

        {/* ====================================
            HEADER
        ==================================== */}

        <header
          className="
            mb-6
            flex
            flex-col
            gap-5
            sm:mb-8
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div className="min-w-0">
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-(--olive-200)
                bg-white/70
                px-3
                py-1.5
                text-[11px]
                font-bold
                tracking-[0.16em]
                text-(--brick-600)
              "
            >
              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-(--brick-600)
                "
              />

              KOMETIK ADMIN
            </div>

            <h1
              className="
                mt-3
                text-2xl
                font-bold
                tracking-tight
                text-(--olive-900)
                sm:text-3xl
                lg:text-4xl
              "
            >
              مجموعات المنتجات
            </h1>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-7
                text-(--olive-600)
                sm:text-[15px]
              "
            >
              أنشئ ونظّم مجموعات المنتجات لتقديم
              المتجر بطريقة أوضح وأكثر أناقة.
            </p>
          </div>

          <Link
            href="/admin/collections/new"
            className="
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-(--brick-600)
              px-5
              py-3.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              duration-200
              hover:bg-(--brick-700)
              hover:shadow-md
              sm:w-auto
            "
          >
            <span className="text-lg leading-none">
              +
            </span>

            إضافة مجموعة
          </Link>
        </header>

        {/* ====================================
            STATS
        ==================================== */}

        {collections.length > 0 && (
          <section
            className="
              mb-7
              -mx-3
              overflow-x-auto
              px-3
              pb-1
              scrollbar-none
              sm:mx-0
              sm:px-0
            "
          >
            <div
              className="
                flex
                min-w-max
                gap-3
                sm:grid
                sm:min-w-0
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >
              {/* TOTAL */}

              <div
                className="
                  w-[180px]
                  rounded-2xl
                  border
                  border-(--olive-200)
                  bg-white
                  p-4
                  shadow-[var(--shadow-soft)]
                  sm:w-auto
                  sm:p-5
                "
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className="
                        text-xs
                        font-semibold
                        text-(--olive-500)
                      "
                    >
                      إجمالي المجموعات
                    </p>

                    <p
                      className="
                        mt-2
                        text-2xl
                        font-bold
                        text-(--olive-900)
                      "
                    >
                      {totalCollections}
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-(--olive-100)
                      text-(--brick-600)
                    "
                  >
                    ✦
                  </div>
                </div>
              </div>

              {/* ACTIVE */}

              <div
                className="
                  w-[180px]
                  rounded-2xl
                  border
                  border-(--olive-200)
                  bg-white
                  p-4
                  shadow-[var(--shadow-soft)]
                  sm:w-auto
                  sm:p-5
                "
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className="
                        text-xs
                        font-semibold
                        text-(--olive-500)
                      "
                    >
                      المجموعات النشطة
                    </p>

                    <p
                      className="
                        mt-2
                        text-2xl
                        font-bold
                        text-(--olive-900)
                      "
                    >
                      {activeCollections}
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-emerald-50
                      text-emerald-600
                    "
                  >
                    ✓
                  </div>
                </div>
              </div>

              {/* MANUAL */}

              <div
                className="
                  w-[180px]
                  rounded-2xl
                  border
                  border-(--olive-200)
                  bg-white
                  p-4
                  shadow-[var(--shadow-soft)]
                  sm:w-auto
                  sm:p-5
                "
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className="
                        text-xs
                        font-semibold
                        text-(--olive-500)
                      "
                    >
                      مجموعات يدوية
                    </p>

                    <p
                      className="
                        mt-2
                        text-2xl
                        font-bold
                        text-(--olive-900)
                      "
                    >
                      {manualCollections}
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-(--olive-100)
                      text-(--brick-600)
                    "
                  >
                    ✦
                  </div>
                </div>
              </div>

              {/* TAG */}

              <div
                className="
                  w-[180px]
                  rounded-2xl
                  border
                  border-(--olive-200)
                  bg-white
                  p-4
                  shadow-[var(--shadow-soft)]
                  sm:w-auto
                  sm:p-5
                "
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className="
                        text-xs
                        font-semibold
                        text-(--olive-500)
                      "
                    >
                      حسب الوسم
                    </p>

                    <p
                      className="
                        mt-2
                        text-2xl
                        font-bold
                        text-(--olive-900)
                      "
                    >
                      {tagCollections}
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-(--brick-50)
                      text-(--brick-600)
                    "
                  >
                    #
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ====================================
            EMPTY STATE
        ==================================== */}

        {collections.length === 0 ? (
          <section
            className="
              rounded-3xl
              border
              border-(--olive-200)
              bg-white
              px-5
              py-16
              text-center
              shadow-[var(--shadow-soft)]
              sm:px-8
              sm:py-20
            "
          >
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-(--olive-100)
                text-2xl
                text-(--brick-600)
              "
            >
              ✦
            </div>

            <h2
              className="
                mt-5
                text-xl
                font-bold
                text-(--olive-900)
              "
            >
              لا توجد مجموعات بعد
            </h2>

            <p
              className="
                mx-auto
                mt-2
                max-w-md
                text-sm
                leading-7
                text-(--olive-600)
              "
            >
              أنشئ أول مجموعة للبدء بتنظيم
              منتجاتك وعرضها بشكل أفضل داخل المتجر.
            </p>

            <Link
              href="/admin/collections/new"
              className="
                mt-6
                inline-flex
                items-center
                justify-center
                rounded-xl
                bg-(--brick-600)
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-(--brick-700)
              "
            >
              إنشاء أول مجموعة
            </Link>
          </section>
        ) : (
          /* ====================================
             COLLECTIONS
          ==================================== */

          <section
            className="
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
              sm:gap-5
            "
          >
            {collections.map(
              (collection) => (
                <article
                  key={collection.id}
                  className="
                    group
                    overflow-hidden
                    rounded-3xl
                    border
                    border-(--olive-200)
                    bg-white
                    shadow-[var(--shadow-soft)]
                    transition
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-[var(--shadow-card)]
                  "
                >
                  {/* ==================================
                      IMAGE
                  ================================== */}

                  <div
                    className="
                      relative
                      aspect-[1.15/1]
                      overflow-hidden
                      bg-(--olive-100)
                      sm:aspect-[4/3]
                    "
                  >
                    {collection.imagePublicId ||
                    collection.imageUrl ? (
                      <CloudinaryProductImage
                        imagePublicId={
                          collection.imagePublicId
                        }
                        imageUrl={
                          collection.imageUrl
                        }
                        alt={
                          collection.name
                        }
                        fill
                        sizes="
                          (max-width: 640px) 100vw,
                          (max-width: 1024px) 50vw,
                          25vw
                        "
                        className="
                          object-cover
                          transition
                          duration-500
                          group-hover:scale-105
                        "
                      />
                    ) : (
                      <div
                        className="
                          flex
                          h-full
                          items-center
                          justify-center
                          text-4xl
                          text-(--brick-500)
                        "
                      >
                        ✦
                      </div>
                    )}

                    {/* OVERLAY */}

                    <div
                      className="
                        pointer-events-none
                        absolute
                        inset-x-0
                        bottom-0
                        h-24
                        bg-gradient-to-t
                        from-black/20
                        to-transparent
                      "
                    />

                    {/* STATUS */}

                    <div
                      className="
                        absolute
                        right-3
                        top-3
                      "
                    >
                      <span
                        className={`
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          px-3
                          py-1.5
                          text-[11px]
                          font-bold
                          shadow-sm
                          backdrop-blur-md
                          ${
                            collection.active
                              ? "bg-white/90 text-(--olive-700)"
                              : "bg-black/55 text-white"
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
                                ? "bg-emerald-500"
                                : "bg-white/70"
                            }
                          `}
                        />

                        {collection.active
                          ? "نشطة"
                          : "متوقفة"}
                      </span>
                    </div>
                  </div>

                  {/* ==================================
                      CONTENT
                  ================================== */}

                  <div className="p-4 sm:p-5">

                    {/* NAME */}

                    <div
                      className="
                        flex
                        items-start
                        gap-3
                      "
                    >
                      <div className="min-w-0 flex-1">

                        <h2
                          className="
                            truncate
                            text-[17px]
                            font-bold
                            text-(--olive-900)
                            sm:text-lg
                          "
                        >
                          {collection.name}
                        </h2>

                        <p
                          dir="ltr"
                          className="
                            mt-1
                            truncate
                            text-[11px]
                            text-(--olive-500)
                          "
                        >
                          /collections/
                          {collection.slug}
                        </p>
                      </div>

                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-(--olive-100)
                          text-sm
                          font-bold
                          text-(--brick-600)
                        "
                      >
                        {collection.type ===
                        "TAG"
                          ? "#"
                          : "✦"}
                      </div>
                    </div>

                    {/* TYPE + TAG */}

                    <div
                      className="
                        mt-4
                        flex
                        flex-wrap
                        items-center
                        gap-2
                      "
                    >
                      <span
                        className="
                          inline-flex
                          rounded-full
                          bg-(--olive-100)
                          px-3
                          py-1.5
                          text-[11px]
                          font-bold
                          text-(--olive-700)
                        "
                      >
                        {collection.type ===
                        "TAG"
                          ? "حسب الوسم"
                          : "يدوية"}
                      </span>

                      {collection.type ===
                        "TAG" && (
                        <span
                          className="
                            min-w-0
                            max-w-[150px]
                            truncate
                            rounded-full
                            bg-(--brick-50)
                            px-3
                            py-1.5
                            text-[11px]
                            font-bold
                            text-(--brick-700)
                          "
                        >
                          #
                          {collection.tag
                            ?.name ??
                            "غير محدد"}
                        </span>
                      )}
                    </div>

                    {/* DESCRIPTION */}

                    <div className="mt-4">
                      {collection.description ? (
                        <p
                          className="
                            line-clamp-2
                            text-sm
                            leading-6
                            text-(--olive-600)
                          "
                        >
                          {
                            collection.description
                          }
                        </p>
                      ) : (
                        <p
                          className="
                            text-sm
                            leading-6
                            text-(--olive-400)
                          "
                        >
                          لا يوجد وصف لهذه المجموعة.
                        </p>
                      )}
                    </div>

                    {/* FOOTER */}

                    <div
                      className="
                        mt-5
                        border-t
                        border-(--olive-200)
                        pt-4
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                      >
                        <div className="min-w-0">
                          <p
                            className="
                              text-[11px]
                              font-medium
                              text-(--olive-500)
                            "
                          >
                            المنتجات
                          </p>

                          <p
                            className="
                              mt-1
                              text-lg
                              font-bold
                              text-(--olive-900)
                            "
                          >
                            {
                              collection._count
                                .products
                            }
                          </p>
                        </div>

                        <Link
                          href={`/admin/collections/${collection.id}`}
                          className="
                            inline-flex
                            min-h-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-(--olive-900)
                            px-4
                            py-2.5
                            text-xs
                            font-semibold
                            text-white
                            transition
                            duration-200
                            hover:bg-(--brick-700)
                          "
                        >
                          إدارة المجموعة
                        </Link>
                      </div>
                    </div>

                  </div>
                </article>
              )
            )}
          </section>
        )}
      </div>
    </main>
  );
}