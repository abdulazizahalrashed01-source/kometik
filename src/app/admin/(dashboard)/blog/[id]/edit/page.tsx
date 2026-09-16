import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowRight,
  Check,
  ExternalLink,
  Save,
  Star,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import BlogCoverImageField from "@/components/admin/BlogCoverImageField";
import BlogRichTextEditor from "@/components/admin/BlogRichTextEditor";

type EditBlogPostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBlogPostPage({
  params,
}: EditBlogPostPageProps) {
  const { id } = await params;

  const [post, categories, products] =
    await Promise.all([
      prisma.blogPost.findUnique({
        where: {
          id,
        },
        include: {
          category: true,
          products: {
            select: {
              productId: true,
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
        },
      }),

      prisma.product.findMany({
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          price: true,
        },
      }),
    ]);

  if (!post) {
    notFound();
  }

  const existingPublishedAt =
    post.publishedAt;

  const selectedProductIds = new Set(
    post.products.map(
      (item) => item.productId
    )
  );

  async function updatePost(
    formData: FormData
  ) {
    "use server";

    const title = String(
      formData.get("title") || ""
    ).trim();

    const slug = String(
      formData.get("slug") || ""
    ).trim();

    const excerpt = String(
      formData.get("excerpt") || ""
    ).trim();

    const content = String(
      formData.get("content") || ""
    ).trim();

    const seoTitle =
      String(
        formData.get("seoTitle") || ""
      ).trim() || null;

    const seoDescription =
      String(
        formData.get("seoDescription") || ""
      ).trim() || null;

    const coverImageUrl =
      String(
        formData.get("coverImageUrl") || ""
      ).trim() || null;

    const coverImagePublicId =
      String(
        formData.get("coverImagePublicId") || ""
      ).trim() || null;

    const categoryId = String(
      formData.get("categoryId") || ""
    ).trim();

    const featured =
      formData.get("featured") === "on";

    const published =
      formData.get("published") === "on";

    const productIds = formData
      .getAll("productIds")
      .map(String)
      .filter(Boolean);

    // ==========================================
    // VALIDATION
    // ==========================================

    if (
      !title ||
      !slug ||
      !content ||
      !categoryId
    ) {
      throw new Error(
        "العنوان والـSlug والمحتوى والتصنيف حقول مطلوبة."
      );
    }

    // ==========================================
    // CHECK CATEGORY
    // ==========================================

    const category =
      await prisma.blogCategory.findUnique({
        where: {
          id: categoryId,
        },
        select: {
          id: true,
        },
      });

    if (!category) {
      throw new Error(
        "التصنيف المحدد غير موجود."
      );
    }

    // ==========================================
    // CHECK SLUG
    // ==========================================

    const duplicateSlug =
      await prisma.blogPost.findFirst({
        where: {
          slug,
          NOT: {
            id,
          },
        },
        select: {
          id: true,
        },
      });

    if (duplicateSlug) {
      throw new Error(
        "هذا الـSlug مستخدم بالفعل في مقال آخر."
      );
    }

    // ==========================================
    // VALID PRODUCTS
    // ==========================================

    const validProducts =
      await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
        select: {
          id: true,
        },
      });

    const validProductIds =
      validProducts.map(
        (product) => product.id
      );

    // ==========================================
    // UPDATE
    // ==========================================

    await prisma.$transaction(
      async (tx) => {
        await tx.blogPostProduct.deleteMany({
          where: {
            postId: id,
          },
        });

        await tx.blogPost.update({
          where: {
            id,
          },
          data: {
            title,
            slug,
            excerpt: excerpt || null,
            content,

            coverImageUrl,
            coverImagePublicId,

            seoTitle,
            seoDescription,

            featured,
            published,

            publishedAt: published
              ? existingPublishedAt ||
                new Date()
              : null,

            categoryId,

            products: {
              create:
                validProductIds.map(
                  (productId) => ({
                    productId,
                  })
                ),
            },
          },
        });
      }
    );

    redirect(
      `/admin/blog/${id}/edit?saved=1`
    );
  }

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
            <Link
              href="/admin/blog"
              className="
                inline-flex
                items-center
                gap-2
                text-sm
                text-(--olive-500)
                transition
                hover:text-(--brick-600)
              "
            >
              <ArrowRight
                size={15}
                strokeWidth={1.6}
              />

              العودة إلى المدونة
            </Link>

            <p
              className="
                mt-5
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.28em]
                text-(--brick-500)
              "
            >
              Editing Article
            </p>

            <h1
              className="
                mt-2
                max-w-4xl
                text-3xl
                font-bold
                tracking-tight
                text-(--olive-900)
                sm:text-4xl
              "
            >
              {post.title}
            </h1>

            <p
              dir="ltr"
              className="
                mt-2
                text-xs
                text-(--olive-400)
              "
            >
              /blog/{post.slug}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
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
                bg-white
                px-4
                py-3
                text-xs
                font-semibold
                text-(--olive-700)
                transition
                hover:bg-(--olive-50)
              "
            >
              <ExternalLink
                size={15}
                strokeWidth={1.5}
              />

              عرض المقال
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================== */}
      {/* SAVED STATE */}
      {/* ====================================================== */}

      <div
        className="
          mb-6
          flex
          items-center
          gap-2
          rounded-xl
          border
          border-(--olive-200)
          bg-(--olive-50)
          px-4
          py-3
          text-sm
          text-(--olive-700)
        "
      >
        <Check
          size={16}
          strokeWidth={1.7}
        />

        <span>
          يمكنك تعديل المقال ثم حفظ التغييرات.
        </span>
      </div>

      {/* ====================================================== */}
      {/* FORM */}
      {/* ====================================================== */}

      <form
        action={updatePost}
        className="
          grid
          gap-6
          lg:grid-cols-[1fr_330px]
        "
      >
        {/* ==================================================== */}
        {/* MAIN */}
        {/* ==================================================== */}

        <div className="kometik-space-y-6">
          {/* ARTICLE */}

          <section
            className="
              rounded-2xl
              border
              border-(--olive-200)
              bg-white
              p-6
              sm:p-8
            "
          >
            <div className="mb-7">
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.25em]
                  text-(--brick-500)
                "
              >
                Article
              </p>

              <h2
                className="
                  mt-2
                  text-xl
                  font-bold
                  text-(--olive-900)
                "
              >
                محتوى المقال
              </h2>
            </div>

            <div className="kometik-space-y-6">
              {/* TITLE */}

              <div>
                <label
                  htmlFor="title"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-(--olive-900)
                  "
                >
                  عنوان المقال
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  defaultValue={post.title}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-(--olive-200)
                    px-4
                    py-3
                    text-sm
                    text-(--olive-900)
                    outline-none
                    transition
                    placeholder:text-(--olive-300)
                    focus:border-(--brick-500)
                    focus:ring-2
                    focus:ring-(--brick-100)
                  "
                />
              </div>

              {/* SLUG */}

              <div>
                <label
                  htmlFor="slug"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-(--olive-900)
                  "
                >
                  Slug
                </label>

                <input
                  id="slug"
                  name="slug"
                  type="text"
                  dir="ltr"
                  required
                  defaultValue={post.slug}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-(--olive-200)
                    px-4
                    py-3
                    text-left
                    text-sm
                    text-(--olive-900)
                    outline-none
                    transition
                    focus:border-(--brick-500)
                    focus:ring-2
                    focus:ring-(--brick-100)
                  "
                />

                <p
                  className="
                    mt-2
                    text-[11px]
                    text-(--olive-400)
                  "
                >
                  يستخدم هذا الجزء في رابط المقال.
                </p>
              </div>

              {/* EXCERPT */}

              <div>
                <label
                  htmlFor="excerpt"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-(--olive-900)
                  "
                >
                  المقدمة المختصرة
                </label>

                <textarea
                  id="excerpt"
                  name="excerpt"
                  rows={4}
                  defaultValue={
                    post.excerpt || ""
                  }
                  className="
                    w-full
                    resize-y
                    rounded-xl
                    border
                    border-(--olive-200)
                    px-4
                    py-3
                    text-sm
                    leading-7
                    text-(--olive-900)
                    outline-none
                    transition
                    placeholder:text-(--olive-300)
                    focus:border-(--brick-500)
                    focus:ring-2
                    focus:ring-(--brick-100)
                  "
                />
              </div>

              {/* CONTENT */}

              <div>
                <label
                  htmlFor="content"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-(--olive-900)
                  "
                >
                  محتوى المقال
                </label>

                <BlogRichTextEditor
                  name="content"
                  defaultValue={post.content}
                />

                <p
                  className="
                    mt-2
                    text-[11px]
                    leading-5
                    text-(--olive-400)
                  "
                >
                  استخدم شريط الأدوات لتنسيق العناوين
                  والنصوص والقوائم والروابط.
                </p>
              </div>
            </div>
          </section>

          {/* SEO */}

          <section
            className="
              rounded-2xl
              border
              border-(--olive-200)
              bg-white
              p-6
              sm:p-8
            "
          >
            <div className="mb-7">
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.25em]
                  text-(--brick-500)
                "
              >
                Search
              </p>

              <h2
                className="
                  mt-2
                  text-xl
                  font-bold
                  text-(--olive-900)
                "
              >
                إعدادات SEO
              </h2>
            </div>

            <div className="kometik-space-y-6">
              <div>
                <label
                  htmlFor="seoTitle"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-(--olive-900)
                  "
                >
                  SEO Title
                </label>

                <input
                  id="seoTitle"
                  name="seoTitle"
                  type="text"
                  defaultValue={
                    post.seoTitle || ""
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-(--olive-200)
                    px-4
                    py-3
                    text-sm
                    text-(--olive-900)
                    outline-none
                    transition
                    focus:border-(--brick-500)
                    focus:ring-2
                    focus:ring-(--brick-100)
                  "
                />
              </div>

              <div>
                <label
                  htmlFor="seoDescription"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-(--olive-900)
                  "
                >
                  SEO Description
                </label>

                <textarea
                  id="seoDescription"
                  name="seoDescription"
                  rows={4}
                  defaultValue={
                    post.seoDescription ||
                    ""
                  }
                  className="
                    w-full
                    resize-y
                    rounded-xl
                    border
                    border-(--olive-200)
                    px-4
                    py-3
                    text-sm
                    leading-7
                    text-(--olive-900)
                    outline-none
                    transition
                    focus:border-(--brick-500)
                    focus:ring-2
                    focus:ring-(--brick-100)
                  "
                />
              </div>
            </div>
          </section>
        </div>

        {/* ==================================================== */}
        {/* SIDEBAR */}
        {/* ==================================================== */}

        <aside className="kometik-space-y-6">
          {/* STATUS */}

          <section
            className="
              rounded-2xl
              border
              border-(--olive-200)
              bg-white
              p-6
            "
          >
            <div className="mb-6">
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.25em]
                  text-(--brick-500)
                "
              >
                Publishing
              </p>

              <h2
                className="
                  mt-2
                  text-lg
                  font-bold
                  text-(--olive-900)
                "
              >
                النشر
              </h2>
            </div>

            <div className="kometik-space-y-5">
              <label
                className="
                  flex
                  cursor-pointer
                  items-center
                  justify-between
                  gap-4
                  border-b
                  border-(--olive-100)
                  pb-5
                "
              >
                <div>
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-(--olive-900)
                    "
                  >
                    نشر المقال
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-(--olive-500)
                    "
                  >
                    سيظهر المقال مباشرة للعامة.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={post.published}
                  className="
                    h-4
                    w-4
                    accent-(--olive-700)
                  "
                />
              </label>

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
                  <div className="flex items-center gap-2">
                    <Star
                      size={15}
                      strokeWidth={1.5}
                      className="text-(--brick-500)"
                    />

                    <p
                      className="
                        text-sm
                        font-semibold
                        text-(--olive-900)
                      "
                    >
                      Featured
                    </p>
                  </div>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-(--olive-500)
                    "
                  >
                    اجعل المقال ضمن المقالات المميزة.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={post.featured}
                  className="
                    h-4
                    w-4
                    accent-(--brick-600)
                  "
                />
              </label>
            </div>
          </section>

          {/* CATEGORY */}

          <section
            className="
              rounded-2xl
              border
              border-(--olive-200)
              bg-white
              p-6
            "
          >
            <div className="mb-5">
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.25em]
                  text-(--brick-500)
                "
              >
                Category
              </p>

              <h2
                className="
                  mt-2
                  text-lg
                  font-bold
                  text-(--olive-900)
                "
              >
                التصنيف
              </h2>
            </div>

            <select
              name="categoryId"
              required
              defaultValue={post.categoryId}
              className="
                w-full
                rounded-xl
                border
                border-(--olive-200)
                bg-white
                px-4
                py-3
                text-sm
                text-(--olive-900)
                outline-none
                transition
                focus:border-(--brick-500)
                focus:ring-2
                focus:ring-(--brick-100)
              "
            >
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
          </section>

          {/* COVER */}

          <section
            className="
              rounded-2xl
              border
              border-(--olive-200)
              bg-white
              p-6
            "
          >
            <div className="mb-5">
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.25em]
                  text-(--brick-500)
                "
              >
                Cover
              </p>

              <h2
                className="
                  mt-2
                  text-lg
                  font-bold
                  text-(--olive-900)
                "
              >
                صورة الغلاف
              </h2>

              <p
                className="
                  mt-2
                  text-xs
                  leading-6
                  text-(--olive-500)
                "
              >
                يمكنك تغيير صورة المقال من Cloudinary.
              </p>
            </div>

            <BlogCoverImageField
              imageUrl={post.coverImageUrl}
              imagePublicId={
                post.coverImagePublicId
              }
            />
          </section>

          {/* PRODUCTS */}

          <section
            className="
              rounded-2xl
              border
              border-(--olive-200)
              bg-white
              p-6
            "
          >
            <div className="mb-5">
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.25em]
                  text-(--brick-500)
                "
              >
                Commerce
              </p>

              <h2
                className="
                  mt-2
                  text-lg
                  font-bold
                  text-(--olive-900)
                "
              >
                المنتجات المرتبطة
              </h2>

              <p
                className="
                  mt-2
                  text-xs
                  leading-6
                  text-(--olive-500)
                "
              >
                اختر المنتجات التي تريد ظهورها داخل المقال.
              </p>
            </div>

            <div
              className="
                max-h-[420px]
                kometik-space-y-2
                overflow-y-auto
                pr-1
              "
            >
              {products.map((product) => (
                <label
                  key={product.id}
                  className="
                    flex
                    cursor-pointer
                    items-center
                    gap-3
                    rounded-xl
                    border
                    border-(--olive-100)
                    p-3
                    transition
                    hover:border-(--olive-300)
                    hover:bg-(--olive-50)
                  "
                >
                  <input
                    type="checkbox"
                    name="productIds"
                    value={product.id}
                    defaultChecked={selectedProductIds.has(
                      product.id
                    )}
                    className="
                      h-4
                      w-4
                      shrink-0
                      accent-(--olive-700)
                    "
                  />

                  <span className="min-w-0 flex-1">
                    <span
                      className="
                        block
                        truncate
                        text-sm
                        font-medium
                        text-(--olive-900)
                      "
                    >
                      {product.name}
                    </span>

                    <span
                      dir="ltr"
                      className="
                        mt-1
                        block
                        text-[11px]
                        text-(--olive-400)
                      "
                    >
                      ${product.price.toFixed(2)}
                    </span>
                  </span>
                </label>
              ))}

              {products.length === 0 && (
                <p
                  className="
                    py-6
                    text-center
                    text-sm
                    text-(--olive-400)
                  "
                >
                  لا توجد منتجات حاليًا.
                </p>
              )}
            </div>
          </section>

          {/* SAVE */}

          <section
            className="
              rounded-2xl
              border
              border-(--olive-200)
              bg-(--olive-50)
              p-6
            "
          >
            <button
              type="submit"
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-(--brick-600)
                px-5
                py-3.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-(--brick-700)
              "
            >
              <Save
                size={17}
                strokeWidth={1.8}
              />

              حفظ التغييرات
            </button>

            <Link
              href="/admin/blog"
              className="
                mt-3
                flex
                w-full
                items-center
                justify-center
                rounded-xl
                border
                border-(--olive-200)
                bg-white
                px-5
                py-3.5
                text-sm
                font-semibold
                text-(--olive-700)
                transition
                hover:bg-(--olive-100)
              "
            >
              إلغاء
            </Link>
          </section>
        </aside>
      </form>
    </main>
  );
}