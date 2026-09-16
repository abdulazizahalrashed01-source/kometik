import Link from "next/link";
import {
  ArrowUpRight,
  FileText,
  Plus,
  Star,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

// ============================================================
// HELPERS
// ============================================================

function formatDate(date: Date | null) {
  if (!date) return "غير محدد";

  return new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

// ============================================================
// PAGE
// ============================================================

export default async function AdminBlogPage() {
  const [posts, categories] = await Promise.all([
    prisma.blogPost.findMany({
      orderBy: [
        {
          featured: "desc",
        },
        {
          publishedAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      include: {
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    }),

    prisma.blogCategory.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    }),
  ]);

  const publishedCount = posts.filter(
    (post) => post.published
  ).length;

  const draftCount =
    posts.length - publishedCount;

  const featuredCount = posts.filter(
    (post) => post.featured
  ).length;

  return (
    <main
      dir="rtl"
      className="mx-auto max-w-7xl"
    >
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <section className="mb-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--brick-500)">
              Kometik Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-(--olive-900) sm:text-4xl">
              المدونة
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-(--olive-600)">
              إدارة مقالات ومحتوى Kometik Journal من مكان واحد.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/blog/categories"
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-(--olive-200)
                px-4
                py-3
                text-xs
                font-semibold
                text-(--olive-700)
                transition
                hover:border-(--olive-300)
                hover:bg-(--olive-50)
              "
            >
              <FileText
                size={16}
                strokeWidth={1.8}
              />
              <span>تصنيفات المدونة</span>
            </Link>

            <Link
              href="/admin/blog/new"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-(--brick-600)
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-(--brick-700)
              "
            >
              <Plus
                size={17}
                strokeWidth={2}
              />
              <span>مقال جديد</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================== */}
      {/* STATS */}
      {/* ====================================================== */}

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* TOTAL */}

        <div className="rounded-2xl border border-(--olive-200) bg-white p-5">
          <p className="text-xs text-(--olive-500)">
            إجمالي المقالات
          </p>

          <div className="mt-3 flex items-end justify-between">
            <span className="text-3xl font-bold text-(--olive-900)">
              {posts.length}
            </span>

            <FileText
              size={20}
              strokeWidth={1.5}
              className="text-(--olive-400)"
            />
          </div>
        </div>

        {/* PUBLISHED */}

        <div className="rounded-2xl border border-(--olive-200) bg-white p-5">
          <p className="text-xs text-(--olive-500)">
            منشورة
          </p>

          <div className="mt-3">
            <span className="text-3xl font-bold text-(--olive-900)">
              {publishedCount}
            </span>
          </div>
        </div>

        {/* DRAFTS */}

        <div className="rounded-2xl border border-(--olive-200) bg-white p-5">
          <p className="text-xs text-(--olive-500)">
            مسودات
          </p>

          <div className="mt-3">
            <span className="text-3xl font-bold text-(--olive-900)">
              {draftCount}
            </span>
          </div>
        </div>

        {/* FEATURED */}

        <div className="rounded-2xl border border-(--olive-200) bg-white p-5">
          <p className="text-xs text-(--olive-500)">
            مقالات مميزة
          </p>

          <div className="mt-3 flex items-end justify-between">
            <span className="text-3xl font-bold text-(--olive-900)">
              {featuredCount}
            </span>

            <Star
              size={20}
              strokeWidth={1.5}
              className="text-(--brick-500)"
            />
          </div>
        </div>
      </section>

      {/* ====================================================== */}
      {/* CONTENT */}
      {/* ====================================================== */}

      <section className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* ==================================================== */}
        {/* POSTS */}
        {/* ==================================================== */}

        <div className="overflow-hidden rounded-2xl border border-(--olive-200) bg-white">
          <div className="border-b border-(--olive-200) px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-(--olive-900)">
                  المقالات
                </h2>

                <p className="mt-1 text-xs text-(--olive-500)">
                  جميع مقالات Kometik Journal
                </p>
              </div>

              <span className="text-xs text-(--olive-400)">
                {posts.length} مقال
              </span>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <FileText
                size={34}
                strokeWidth={1.3}
                className="mx-auto text-(--olive-300)"
              />

              <h3 className="mt-5 text-lg font-semibold text-(--olive-900)">
                لا توجد مقالات بعد
              </h3>

              <p className="mt-2 text-sm text-(--olive-500)">
                أنشئ أول مقال لبدء بناء محتوى المدونة.
              </p>

              <Link
                href="/admin/blog/new"
                className="
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-(--brick-600)
                  px-5
                  py-3
                  text-xs
                  font-semibold
                  text-white
                  transition
                  hover:bg-(--brick-700)
                "
              >
                <Plus
                  size={17}
                  strokeWidth={2}
                />
                <span>مقال جديد</span>
              </Link>
            </div>
          ) : (
            <div>
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="
                    border-b
                    border-(--olive-100)
                    px-5
                    py-5
                    last:border-b-0
                    sm:px-6
                  "
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    {/* POST INFO */}

                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        {/* STATUS */}

                        <span
                          className={`
                            inline-flex
                            rounded-full
                            px-2.5
                            py-1
                            text-[11px]
                            font-semibold
                            ${
                              post.published
                                ? "bg-(--olive-100) text-(--olive-700)"
                                : "bg-gray-100 text-gray-500"
                            }
                          `}
                        >
                          {post.published
                            ? "منشور"
                            : "مسودة"}
                        </span>

                        {/* FEATURED */}

                        {post.featured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-(--brick-50) px-2.5 py-1 text-[11px] font-semibold text-(--brick-600)">
                            <Star
                              size={12}
                              fill="currentColor"
                            />
                            مميز
                          </span>
                        )}

                        {/* CATEGORY */}

                        <span className="text-[11px] text-(--olive-400)">
                          {post.category.name}
                        </span>
                      </div>

                      {/* TITLE */}

                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="group inline-flex max-w-3xl items-start gap-2"
                      >
                        <h3
                          dir="rtl"
                          className="
                            text-base
                            font-semibold
                            leading-7
                            text-(--olive-900)
                            transition
                            group-hover:text-(--brick-600)
                          "
                        >
                          {post.title}
                        </h3>

                        <ArrowUpRight
                          size={14}
                          strokeWidth={1.5}
                          className="
                            mt-1
                            shrink-0
                            text-(--olive-300)
                            transition
                            group-hover:-translate-y-0.5
                            group-hover:translate-x-0.5
                            group-hover:text-(--brick-500)
                          "
                        />
                      </Link>

                      {/* META */}

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-(--olive-400)">
                        <span>
                          {formatDate(
                            post.publishedAt ||
                              post.createdAt
                          )}
                        </span>

                        <span>
                          {post._count.products} منتجات مرتبطة
                        </span>

                        <span dir="ltr">
                          /blog/{post.slug}
                        </span>
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-(--olive-200)
                          px-4
                          py-2.5
                          text-xs
                          font-semibold
                          text-(--olive-700)
                          transition
                          hover:border-(--olive-300)
                          hover:bg-(--olive-50)
                        "
                      >
                        <span>عرض</span>

                        <ArrowUpRight
                          size={14}
                          strokeWidth={1.5}
                        />
                      </Link>

                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="
                          inline-flex
                          items-center
                          rounded-xl
                          bg-(--olive-900)
                          px-4
                          py-2.5
                          text-xs
                          font-semibold
                          text-white
                          transition
                          hover:bg-black
                        "
                      >
                        تعديل
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* CATEGORIES */}
        {/* ==================================================== */}

        <aside className="h-fit rounded-2xl border border-(--olive-200) bg-white">
          <div className="border-b border-(--olive-200) px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-(--olive-900)">
                  التصنيفات
                </h2>

                <p className="mt-1 text-xs text-(--olive-500)">
                  {categories.length} تصنيف
                </p>
              </div>

              <Link
                href="/admin/blog/categories"
                className="
                  text-xs
                  font-semibold
                  text-(--brick-600)
                  transition
                  hover:text-(--brick-700)
                "
              >
                إدارة
              </Link>
            </div>
          </div>

          <div className="kometik-divide-y kometik-separator-gray">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p
                    dir="rtl"
                    className="text-sm font-medium text-(--olive-800)"
                  >
                    {category.name}
                  </p>

                  <p
                    dir="ltr"
                    className="mt-1 truncate text-[10px] text-(--olive-400)"
                  >
                    /{category.slug}
                  </p>
                </div>

                <span className="shrink-0 text-xs text-(--olive-400)">
                  {category._count.posts}
                </span>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-(--olive-400)">
                لا توجد تصنيفات.
              </div>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}