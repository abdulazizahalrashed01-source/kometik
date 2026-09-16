import Link from "next/link";
import { ArrowLeft, ArrowUpLeft, Clock3 } from "lucide-react";

import { prisma } from "@/lib/prisma";

export default async function BlogPage() {
  const [featuredPost, latestPosts, categories] = await Promise.all([
    prisma.blogPost.findFirst({
      where: {
        published: true,
        featured: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        publishedAt: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),

    prisma.blogPost.findMany({
      where: {
        published: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 8,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        publishedAt: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),

    prisma.blogCategory.findMany({
      orderBy: {
        name: "asc",
      },
      take: 6,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
    }),
  ]);

  const latestWithoutFeatured = latestPosts.filter(
    (post) => post.id !== featuredPost?.id,
  );

  const featured =
    featuredPost ?? latestPosts[0] ?? null;

  const secondaryPosts = featured
    ? latestWithoutFeatured.slice(0, 3)
    : [];

  const remainingPosts = featured
    ? latestWithoutFeatured.slice(3)
    : latestPosts;

  function formatDate(date: Date | null) {
    if (!date) return "";

    return new Intl.DateTimeFormat("ar", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-(--background) text-(--foreground)"
    >
      {/* =========================================================
          INTRO
      ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14 lg:px-8 lg:pt-16">
        <div className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-(--brick-500) sm:text-xs">
              KOMETIK JOURNAL
            </p>

            <h1 className="mt-4 max-w-md text-4xl font-medium leading-[1.05] tracking-tight text-(--olive-900) sm:text-5xl lg:text-6xl">
              أفكار صغيرة،
              <br />
              لجمال أوضح.
            </h1>
          </div>

          <div className="flex flex-col justify-end gap-4 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-xl text-sm leading-8 text-(--olive-500)">
              مساحة Kometik للتعلّم، واكتشاف المكونات، وفهم روتين العناية
              بالبشرة بطريقة أبسط.
            </p>

            <Link
              href="/shop"
              className="inline-flex w-fit shrink-0 items-center gap-2 border-b border-(--olive-300) pb-2 text-sm font-medium text-(--olive-900) transition hover:border-(--brick-400) hover:text-(--brick-700)"
            >
              اكتشف المنتجات
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          CATEGORY NAV
      ========================================================= */}
      {categories.length > 0 && (
        <section className="border-y border-(--olive-200)">
          <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-max items-center gap-7 py-4">
              <Link
                href="/blog"
                className="text-xs font-semibold text-(--olive-900)"
              >
                الكل
              </Link>

              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog/category/${category.slug}`}
                  className="text-xs text-(--olive-500) transition hover:text-(--brick-700)"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          EMPTY STATE
      ========================================================= */}
      {!featured && latestPosts.length === 0 && (
        <section className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-(--brick-500)">
            KOMETIK JOURNAL
          </p>

          <h2 className="mt-4 text-3xl font-medium tracking-tight text-(--olive-900) sm:text-4xl">
            قريبًا...
          </h2>

          <p className="mx-auto mt-4 max-w-md text-sm leading-8 text-(--olive-500)">
            نعمل على إعداد أولى مقالات Kometik لتكون بداية هذا الـJournal.
          </p>

          <Link
            href="/shop"
            className="mt-7 inline-flex items-center gap-2 bg-(--olive-900) px-6 py-3.5 text-sm font-medium text-white transition hover:bg-(--brick-700)"
          >
            العودة إلى المتجر
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </section>
      )}

      {/* =========================================================
          FEATURED ARTICLE
      ========================================================= */}
      {featured && (
        <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
          <Link
            href={`/blog/${featured.slug}`}
            className="group block"
          >
            <div className="grid overflow-hidden bg-(--olive-100) lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative min-h-[320px] overflow-hidden bg-(--olive-200) sm:min-h-[430px] lg:order-2 lg:min-h-[560px]">
                {featured.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.coverImageUrl}
                    alt={featured.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-(--olive-100)">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-(--olive-400)">
                      KOMETIK JOURNAL
                    </span>
                  </div>
                )}

                <div className="absolute bottom-5 right-5 bg-white/90 px-4 py-2 backdrop-blur">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-(--brick-500)">
                    FEATURED
                  </p>
                </div>
              </div>

              <div className="flex min-h-[320px] flex-col justify-between p-7 sm:p-10 lg:min-h-[560px] lg:p-14">
                <div>
                  <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-(--olive-400)">
                    <span>{featured.category.name}</span>

                    <span className="h-px w-6 bg-(--olive-300)" />

                    <span>
                      {formatDate(featured.publishedAt)}
                    </span>
                  </div>

                  <h2 className="mt-7 max-w-xl text-3xl font-medium leading-[1.12] tracking-tight text-(--olive-900) sm:text-4xl lg:text-5xl">
                    {featured.title}
                  </h2>

                  {featured.excerpt && (
                    <p className="mt-5 max-w-lg text-sm leading-8 text-(--olive-600)">
                      {featured.excerpt}
                    </p>
                  )}
                </div>

                <div className="mt-10 flex items-center justify-between gap-4 border-t border-(--olive-200) pt-5">
                  <span className="text-sm font-medium text-(--olive-900)">
                    اقرأ المقال
                  </span>

                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-(--olive-300) transition duration-300 group-hover:-translate-x-1 group-hover:border-(--brick-300)">
                    <ArrowUpLeft className="h-4 w-4 text-(--olive-600) transition group-hover:text-(--brick-600)" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* =========================================================
          LATEST NOTES
      ========================================================= */}
      {secondaryPosts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 sm:pt-24 lg:px-8">
          <div className="flex items-end justify-between border-b border-(--olive-200) pb-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-(--brick-500) sm:text-xs">
                LATEST NOTES
              </p>

              <h2 className="mt-3 text-3xl font-medium tracking-tight text-(--olive-900) sm:text-4xl">
                أحدث المقالات.
              </h2>
            </div>
          </div>

          <div className="grid border-l border-(--olive-200) sm:grid-cols-3">
            {secondaryPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group border-b border-(--olive-200) p-5 transition hover:bg-(--olive-50) sm:border-l sm:p-7"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-(--olive-100)">
                  {post.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-[9px] uppercase tracking-[0.25em] text-(--olive-400)">
                        0{index + 1}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-(--olive-400)">
                      {post.category.name}
                    </p>

                    <ArrowUpLeft className="h-4 w-4 text-(--olive-300) transition group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:text-(--brick-500)" />
                  </div>

                  <h3 className="mt-3 text-lg font-medium leading-7 text-(--olive-900)">
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="mt-2 line-clamp-3 text-xs leading-6 text-(--olive-500)">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="mt-5 flex items-center gap-2 text-[9px] uppercase tracking-[0.15em] text-(--olive-400)">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatDate(post.publishedAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================
          CATEGORY EDIT
      ========================================================= */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 sm:pt-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.55fr_1.45fr]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-(--brick-500) sm:text-xs">
                EXPLORE THE JOURNAL
              </p>

              <h2 className="mt-4 text-3xl font-medium leading-tight tracking-tight text-(--olive-900) sm:text-4xl">
                اختاري موضوعًا،
                <br />
                وابدئي من هناك.
              </h2>
            </div>

            <div className="border-t border-(--olive-200)">
              {categories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/blog/category/${category.slug}`}
                  className="group grid grid-cols-[45px_1fr_auto] items-center gap-4 border-b border-(--olive-200) py-6 sm:grid-cols-[70px_1fr_1.2fr_auto] sm:gap-6"
                >
                  <span className="text-xs text-(--brick-500)">
                    0{index + 1}
                  </span>

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.22em] text-(--olive-400)">
                      JOURNAL
                    </p>

                    <h3 className="mt-1 text-lg font-medium text-(--olive-900) transition group-hover:text-(--brick-700)">
                      {category.name}
                    </h3>
                  </div>

                  <p className="hidden max-w-sm text-xs leading-6 text-(--olive-500) sm:block">
                    {category.description ||
                      "اكتشفي المزيد من المقالات والاختيارات في هذا القسم."}
                  </p>

                  <ArrowUpLeft className="h-4 w-4 text-(--olive-400) transition group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:text-(--brick-500)" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          MORE ARTICLES
      ========================================================= */}
      {remainingPosts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-14 pt-20 sm:px-6 sm:pt-24 lg:px-8">
          <div className="flex items-end justify-between border-b border-(--olive-200) pb-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-(--brick-500) sm:text-xs">
                MORE TO READ
              </p>

              <h2 className="mt-3 text-3xl font-medium tracking-tight text-(--olive-900) sm:text-4xl">
                المزيد من الـJournal.
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {remainingPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-(--olive-100)">
                  {post.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-[9px] uppercase tracking-[0.25em] text-(--olive-400)">
                        KOMETIK
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-(--olive-400)">
                    {post.category.name}
                  </p>

                  <h3 className="mt-2 text-base font-medium leading-7 text-(--olive-900) transition group-hover:text-(--brick-700)">
                    {post.title}
                  </h3>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-[0.15em] text-(--olive-400)">
                      {formatDate(post.publishedAt)}
                    </span>

                    <ArrowUpLeft className="h-4 w-4 text-(--olive-300)" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================
          JOURNAL CTA
      ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="border-y border-(--olive-200) py-14 text-center sm:py-16">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-(--brick-500) sm:text-xs">
            KOMETIK
          </p>

          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-medium tracking-tight text-(--olive-900) sm:text-4xl">
            العناية أبسط عندما تفهمينها.
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-8 text-(--olive-500)">
            اكتشفي المنتجات، افهمي المكونات، وابني روتينك بطريقتك.
          </p>

          <Link
            href="/shop"
            className="mt-7 inline-flex items-center gap-2 bg-(--olive-900) px-6 py-3.5 text-sm font-medium text-white transition hover:bg-(--brick-700)"
          >
            اكتشفي المتجر
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
