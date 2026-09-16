import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { prisma } from "@/lib/prisma";
import CloudinaryProductImage from "@/components/CloudinaryProductImage";
import AddToCartButton from "../../shop/products/[id]/AddToCartButton";

// ============================================================
// TYPES
// ============================================================

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// ============================================================
// HELPERS
// ============================================================

function getReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

// ============================================================
// SEO
// ============================================================

export async function generateMetadata({
  params,
}: BlogPostPageProps) {
  const { slug } = await params;

  const post = await prisma.blogPost.findFirst({
    where: {
      slug,
      published: true,
    },
    select: {
      title: true,
      seoTitle: true,
      seoDescription: true,
      excerpt: true,
      coverImageUrl: true,
    },
  });

  if (!post) {
    return {
      title: "Ø§Ù„Ù…Ù‚Ø§Ù„ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯ | Kometik",
    };
  }

  return {
    title: post.seoTitle || `${post.title} | Kometik`,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      images: post.coverImageUrl
        ? [
            {
              url: post.coverImageUrl,
            },
          ]
        : undefined,
    },
  };
}

// ============================================================
// PAGE
// ============================================================

export default async function BlogPostPage({
  params,
}: BlogPostPageProps) {
  const { slug } = await params;

  const post = await prisma.blogPost.findFirst({
    where: {
      slug,
      published: true,
    },
    include: {
      category: true,
      products: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              stock: true,
              imageUrl: true,
              imagePublicId: true,
            },
          },
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      published: true,
      categoryId: post.categoryId,
      slug: {
        not: post.slug,
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: 3,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImageUrl: true,
      publishedAt: true,
    },
  });

  const publishedDate = post.publishedAt || post.createdAt;
  const readingTime = getReadingTime(post.content);

  const paragraphs = post.content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-background">
      {/* ====================================================== */}
      {/* ARTICLE HEADER */}
      {/* ====================================================== */}

      <section className="border-b border-foreground/10">
        <div className="mx-auto max-w-7xl px-6 pb-12 pt-10 sm:px-8 lg:px-12 lg:pb-16 lg:pt-14">
          {/* Breadcrumb */}
          <div className="mb-12 flex items-center justify-between">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-foreground/55 transition-colors hover:text-foreground"
            >
              <ArrowLeft
                size={15}
                strokeWidth={1.5}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
              <span>Ø§Ù„Ø¹ÙˆØ¯Ø© Ø¥Ù„Ù‰ Journal</span>
            </Link>

            <span className="hidden text-[10px] uppercase tracking-[0.28em] text-foreground/35 sm:block">
              KOMETIK JOURNAL
            </span>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_0.34fr] lg:gap-20">
            <div>
              <div className="mb-7 flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.24em]">
                <span className="text-foreground">
                  {post.category.name}
                </span>

                <span className="h-px w-8 bg-foreground/20" />

                <span className="text-foreground/45">
                  {formatDate(publishedDate)}
                </span>

                <span className="h-px w-8 bg-foreground/20" />

                <span className="text-foreground/45">
                  {readingTime} Ø¯Ù‚ÙŠÙ‚Ø© Ù‚Ø±Ø§Ø¡Ø©
                </span>
              </div>

              <h1
                dir="rtl"
                className="max-w-5xl text-4xl font-light leading-[1.12] tracking-[-0.035em] sm:text-5xl md:text-6xl lg:text-[5.25rem]"
              >
                {post.title}
              </h1>

              <div className="mt-8 max-w-2xl lg:mt-10">
                <p
                  dir="rtl"
                  className="text-lg font-light leading-8 text-foreground/60 sm:text-xl"
                >
                  {post.excerpt}
                </p>
              </div>
            </div>

            <div className="flex items-end lg:justify-end">
              <div className="w-full border-t border-foreground/10 pt-5 lg:max-w-[220px]">
                <span className="text-[9px] uppercase tracking-[0.26em] text-foreground/35">
                  Kometik / Beauty Journal
                </span>

                <p
                  dir="rtl"
                  className="mt-4 text-sm font-light leading-7 text-foreground/55"
                >
                  Ù…Ø¹Ø±ÙØ© Ø£Ø¨Ø³Ø·.
                  <br />
                  Ø§Ø®ØªÙŠØ§Ø± Ø£ÙƒØ«Ø± ÙˆØ¹ÙŠÙ‹Ø§.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================== */}
      {/* COVER IMAGE */}
      {/* ====================================================== */}

      <section className="border-b border-foreground/10">
        <div className="mx-auto max-w-7xl px-0 sm:px-8 lg:px-12">
          {post.coverImageUrl ? (
            <div className="relative aspect-[16/8] overflow-hidden bg-muted">
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="relative flex aspect-[16/7] items-center justify-center overflow-hidden bg-[#e8e5dc]">
              <div className="absolute left-[8%] top-[12%] h-28 w-28 rounded-full bg-white/35 blur-xl" />
              <div className="absolute bottom-[8%] right-[13%] h-40 w-40 rounded-full bg-[#7f886e]/15 blur-3xl" />

              <div className="relative text-center">
                <p className="text-[10px] uppercase tracking-[0.45em] text-black/30">
                  KOMETIK
                </p>
                <p
                  dir="rtl"
                  className="mt-5 text-2xl font-light tracking-tight text-black/55 sm:text-3xl"
                >
                  Ù…Ø¬Ù„Ø© Ø§Ù„Ø¬Ù…Ø§Ù„ ÙˆØ§Ù„Ø¹Ù†Ø§ÙŠØ©
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ====================================================== */}
      {/* ARTICLE CONTENT */}
      {/* ====================================================== */}

      <article>
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="grid gap-14 lg:grid-cols-[180px_minmax(0,700px)_1fr] lg:gap-16">
            {/* Side Label */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 border-t border-foreground/15 pt-4">
                <span className="text-[9px] uppercase tracking-[0.3em] text-foreground/35">
                  The Article
                </span>

                <div className="mt-6 h-px w-8 bg-foreground/30" />

                <p
                  dir="rtl"
                  className="mt-5 text-xs leading-6 text-foreground/45"
                >
                  Ù…Ø¹Ø±ÙØ© Ø£Ø³Ø§Ø³ÙŠØ© ØªØ³Ø§Ø¹Ø¯Ùƒ Ø¹Ù„Ù‰ Ø§ØªØ®Ø§Ø° Ù‚Ø±Ø§Ø±Ø§Øª Ø£ÙØ¶Ù„ ÙÙŠ Ø±ÙˆØªÙŠÙ†Ùƒ Ø§Ù„ÙŠÙˆÙ…ÙŠ.
                </p>
              </div>
            </aside>

            {/* Main Content */}
            <div dir="rtl">
              <div className="kometik-space-y-8">
                {paragraphs.map((paragraph, index) => (
                  <p
                    key={`${post.id}-${index}`}
                    className={
                      index === 0
                        ? "text-xl font-light leading-[2] text-foreground sm:text-2xl"
                        : "text-base font-light leading-[2.05] text-foreground/70 sm:text-lg"
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Closing Note */}
              <div className="mt-16 border-y border-foreground/10 py-10">
                <p className="text-[9px] uppercase tracking-[0.3em] text-foreground/35">
                  KOMETIK NOTE
                </p>

                <p className="mt-4 text-base font-light leading-8 text-foreground/60">
                  Ø§Ù„Ù‡Ø¯Ù Ù„ÙŠØ³ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù…Ø²ÙŠØ¯ Ù…Ù† Ø§Ù„Ù…Ù†ØªØ¬Ø§ØªØŒ Ø¨Ù„ ÙÙ‡Ù… Ø¨Ø´Ø±ØªÙƒ ÙˆØ§Ø®ØªÙŠØ§Ø±
                  Ù…Ø§ ÙŠÙ†Ø§Ø³Ø¨Ù‡Ø§ Ø¨Ø´ÙƒÙ„ Ø£ÙØ¶Ù„.
                </p>
              </div>
            </div>

            {/* Right Rail */}
            <aside className="lg:pt-2">
              <div className="border-t border-foreground/15 pt-4">
                <span className="text-[9px] uppercase tracking-[0.3em] text-foreground/35">
                  Explore
                </span>

                <Link
                  href={`/blog/category/${post.category.slug}`}
                  className="group mt-5 flex items-center justify-between border-b border-foreground/10 pb-5"
                >
                  <span
                    dir="rtl"
                    className="text-sm font-light text-foreground/65 transition-colors group-hover:text-foreground"
                  >
                    {post.category.name}
                  </span>

                  <ArrowUpRight
                    size={15}
                    strokeWidth={1.4}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* ====================================================== */}
      {/* RELATED PRODUCTS */}
      {/* ====================================================== */}

      {post.products.length > 0 && (
        <section className="border-t border-foreground/10">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
            <div className="mb-12 max-w-2xl">
              <p className="text-[9px] uppercase tracking-[0.32em] text-foreground/35">
                Featured Products
              </p>

              <h2
                dir="rtl"
                className="mt-4 text-3xl font-light tracking-[-0.02em] sm:text-4xl"
              >
                منتجات مرتبطة بالمقال
              </h2>

              <p
                dir="rtl"
                className="mt-4 text-sm font-light leading-7 text-foreground/50"
              >
                اختيارات مرتبطة بالموضوع تساعدك على تحويل المعرفة إلى روتين
                عملي.
              </p>
            </div>

            <div className="grid gap-0 border-t border-foreground/10 sm:grid-cols-2 lg:grid-cols-4">
              {post.products.slice(0, 4).map(({ product }, index) => (
                <article
                  key={product.id}
                  className="group border-b border-foreground/10 sm:border-r lg:border-b-0"
                >
                  <Link href={`/shop/products/${product.id}`}>
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#f1eee7]">
                      {product.imagePublicId || product.imageUrl ? (
                        <CloudinaryProductImage
                          imagePublicId={product.imagePublicId}
                          imageUrl={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-contain p-8 transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="text-[9px] uppercase tracking-[0.3em] text-black/25">
                            KOMETIK
                          </span>
                        </div>
                      )}

                      <span className="absolute left-4 top-4 text-[9px] tracking-[0.18em] text-black/35">
                        0{index + 1}
                      </span>
                    </div>
                  </Link>

                  <div className="p-6">
                    <Link href={`/shop/products/${product.id}`}>
                      <h3
                        dir="rtl"
                        className="min-h-12 text-base font-light leading-7 tracking-[-0.01em] transition-opacity duration-300 group-hover:opacity-60"
                      >
                        {product.name}
                      </h3>
                    </Link>

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <span
                        dir="ltr"
                        className="text-sm font-medium tracking-wide text-foreground"
                      >
                        ${product.price.toFixed(2)}
                      </span>

                      {product.stock > 0 ? (
                        <span className="text-[9px] uppercase tracking-[0.18em] text-foreground/35">
                          متوفر
                        </span>
                      ) : (
                        <span className="text-[9px] uppercase tracking-[0.18em] text-foreground/35">
                          نفد
                        </span>
                      )}
                    </div>

                    <div className="mt-5">
                      <AddToCartButton
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        stock={product.stock}
                        imageUrl={product.imageUrl}
                        imagePublicId={product.imagePublicId}
                        compact
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* ====================================================== */}
      {/* RELATED ARTICLES */}
      {/* ====================================================== */}

      {relatedPosts.length > 0 && (
        <section className="border-t border-foreground/10">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12 lg:py-24">
            <div className="mb-12 flex items-end justify-between gap-8">
              <div>
                <p className="text-[9px] uppercase tracking-[0.32em] text-foreground/35">
                  Continue Reading
                </p>

                <h2
                  dir="rtl"
                  className="mt-4 text-3xl font-light tracking-[-0.02em] sm:text-4xl"
                >
                  Ù…Ù‚Ø§Ù„Ø§Øª Ù‚Ø¯ ØªÙ‡Ù…Ùƒ
                </h2>
              </div>

              <Link
                href="/blog"
                className="group hidden items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-foreground/50 transition-colors hover:text-foreground sm:flex"
              >
                <span>ÙƒÙ„ Ø§Ù„Ù…Ù‚Ø§Ù„Ø§Øª</span>
                <ArrowLeft
                  size={14}
                  strokeWidth={1.4}
                  className="transition-transform duration-300 group-hover:-translate-x-1"
                />
              </Link>
            </div>

            <div className="grid gap-0 border-t border-foreground/10 md:grid-cols-3 md:border-l">
              {relatedPosts.map((relatedPost, index) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group border-b border-foreground/10 md:border-r md:border-b-0"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {relatedPost.coverImageUrl ? (
                      <img
                        src={relatedPost.coverImageUrl}
                        alt={relatedPost.title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#e8e5dc]">
                        <span className="text-[9px] uppercase tracking-[0.35em] text-black/25">
                          KOMETIK
                        </span>
                      </div>
                    )}

                    <span className="absolute left-5 top-5 text-[9px] tracking-[0.18em] text-black/40">
                      0{index + 1}
                    </span>
                  </div>

                  <div className="p-7 sm:p-8">
                    <div className="mb-4 flex items-center justify-between gap-5">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-foreground/35">
                        {relatedPost.publishedAt
                          ? formatDate(relatedPost.publishedAt)
                          : ""}
                      </span>

                      <ArrowUpRight
                        size={15}
                        strokeWidth={1.4}
                        className="opacity-40 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                      />
                    </div>

                    <h3
                      dir="rtl"
                      className="text-lg font-light leading-8 tracking-[-0.01em] transition-opacity duration-300 group-hover:opacity-65"
                    >
                      {relatedPost.title}
                    </h3>

                    <p
                      dir="rtl"
                      className="mt-4 line-clamp-2 text-sm font-light leading-7 text-foreground/50"
                    >
                      {relatedPost.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====================================================== */}
      {/* FINAL CTA */}
      {/* ====================================================== */}

      <section className="border-t border-foreground/10 bg-[#1f211c] text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12 lg:py-20">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] text-white/35">
                KOMETIK JOURNAL
              </p>

              <h2
                dir="rtl"
                className="mt-5 max-w-2xl text-3xl font-light leading-tight tracking-[-0.025em] sm:text-4xl lg:text-5xl"
              >
                Ø§ÙƒØªØ´ÙÙŠ Ø§Ù„Ù…Ø²ÙŠØ¯ Ù…Ù† Ø§Ù„Ø­ÙƒØ§ÙŠØ§Øª
                <br />
                Ø­ÙˆÙ„ Ø§Ù„Ø¹Ù†Ø§ÙŠØ© ÙˆØ§Ù„Ø¬Ù…Ø§Ù„.
              </h2>
            </div>

            <Link
              href="/blog"
              className="group inline-flex w-fit items-center gap-4 border-b border-white/25 pb-3 text-[10px] uppercase tracking-[0.24em] text-white/75 transition-colors hover:text-white"
            >
              <span>Explore Journal</span>

              <ArrowLeft
                size={15}
                strokeWidth={1.4}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}