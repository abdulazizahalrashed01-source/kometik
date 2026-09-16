"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Edit3,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";

// ==========================================
// TYPES
// ==========================================

type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    posts: number;
  };
};

// ==========================================
// SLUG
// ==========================================

function makeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

// ==========================================
// PAGE
// ==========================================

export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ========================================
  // LOAD
  // ========================================

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/blog/categories",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load categories"
        );
      }

      setCategories(data.categories || []);
    } catch (error) {
      console.error("LOAD BLOG CATEGORIES ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load categories"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  // ========================================
  // RESET
  // ========================================

  function resetForm() {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setError("");
    setSuccess("");
  }

  // ========================================
  // EDIT
  // ========================================

  function startEdit(category: BlogCategory) {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description || "");
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ========================================
  // SUBMIT
  // ========================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("اسم التصنيف مطلوب.");
      return;
    }

    setSaving(true);

    try {
      const finalSlug =
        slug.trim() || makeSlug(trimmedName);

      const response = await fetch(
        editingId
          ? `/api/admin/blog/categories/${encodeURIComponent(
              editingId
            )}`
          : "/api/admin/blog/categories",
        {
          method: editingId ? "PUT" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            slug: finalSlug,
            description: description.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "تعذر حفظ التصنيف."
        );

        return;
      }

      setSuccess(
        editingId
          ? "تم تحديث التصنيف بنجاح."
          : "تم إنشاء التصنيف بنجاح."
      );

      resetForm();

      await loadCategories();
    } catch (error) {
      console.error(
        "SAVE BLOG CATEGORY ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "تعذر الاتصال بالخادم."
      );
    } finally {
      setSaving(false);
    }
  }

  // ========================================
  // DELETE
  // ========================================

  async function handleDelete(
    category: BlogCategory
  ) {
    setError("");
    setSuccess("");

    if (category._count.posts > 0) {
      setError(
        `لا يمكن حذف «${category.name}» لأنه مرتبط بـ ${category._count.posts} مقال.`
      );

      return;
    }

    const confirmed = window.confirm(
      `هل تريد حذف التصنيف «${category.name}»؟`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/blog/categories/${encodeURIComponent(
          category.id
        )}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "تعذر حذف التصنيف."
        );

        return;
      }

      if (editingId === category.id) {
        resetForm();
      }

      setSuccess("تم حذف التصنيف.");

      await loadCategories();
    } catch (error) {
      console.error(
        "DELETE BLOG CATEGORY ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "تعذر الاتصال بالخادم."
      );
    }
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-(--background) text-(--foreground)"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* HEADER */}
        <header className="mb-10">
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-2 text-sm text-(--olive-500) transition hover:text-(--brick-600)"
          >
            <ArrowRight className="h-4 w-4" />
            العودة إلى الـBlog
          </Link>

          <div className="mt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-(--brick-500)">
              KOMETIK JOURNAL
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-(--olive-900) sm:text-4xl">
              تصنيفات المقالات
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-(--olive-600)">
              أنشئ ونظّم تصنيفات الـJournal التي تستخدمها في
              المقالات المنشورة.
            </p>
          </div>
        </header>

        {/* MESSAGES */}
        {(error || success) && (
          <div
            className={`mb-6 rounded-2xl border px-5 py-4 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <p>{error || success}</p>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                }}
                className="shrink-0"
                aria-label="إغلاق"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* FORM */}
        <section className="mb-10 rounded-3xl border border-(--olive-200) bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-(--brick-500)">
                {editingId ? "EDIT CATEGORY" : "NEW CATEGORY"}
              </p>

              <h2 className="mt-2 text-xl font-bold text-(--olive-900)">
                {editingId
                  ? "تعديل التصنيف"
                  : "إضافة تصنيف جديد"}
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-(--olive-200) px-4 py-2.5 text-sm font-semibold text-(--olive-700) transition hover:bg-(--olive-50)"
              >
                <X className="h-4 w-4" />
                إلغاء التعديل
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-6 lg:grid-cols-2"
          >
            <div>
              <label
                htmlFor="blog-category-name"
                className="mb-2 block text-sm font-semibold text-(--olive-900)"
              >
                اسم التصنيف
              </label>

              <input
                id="blog-category-name"
                value={name}
                onChange={(event) => {
                  const value = event.target.value;

                  setName(value);

                  if (!editingId && !slug) {
                    setSlug(makeSlug(value));
                  }
                }}
                placeholder="مثال: العناية بالبشرة"
                className="w-full rounded-2xl border border-(--olive-200) bg-(--olive-50) px-4 py-3.5 text-sm text-(--olive-900) outline-none transition placeholder:text-(--olive-400) focus:border-(--brick-400) focus:bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="blog-category-slug"
                className="mb-2 block text-sm font-semibold text-(--olive-900)"
              >
                Slug
              </label>

              <input
                id="blog-category-slug"
                dir="ltr"
                value={slug}
                onChange={(event) =>
                  setSlug(makeSlug(event.target.value))
                }
                placeholder="skincare"
                className="w-full rounded-2xl border border-(--olive-200) bg-(--olive-50) px-4 py-3.5 text-sm text-(--olive-900) outline-none transition placeholder:text-(--olive-400) focus:border-(--brick-400) focus:bg-white"
              />
            </div>

            <div className="lg:col-span-2">
              <label
                htmlFor="blog-category-description"
                className="mb-2 block text-sm font-semibold text-(--olive-900)"
              >
                الوصف
              </label>

              <textarea
                id="blog-category-description"
                rows={4}
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="وصف مختصر للتصنيف..."
                className="w-full resize-y rounded-2xl border border-(--olive-200) bg-(--olive-50) px-4 py-3.5 text-sm leading-7 text-(--olive-900) outline-none transition placeholder:text-(--olive-400) focus:border-(--brick-400) focus:bg-white"
              />
            </div>

            <div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--brick-600) px-6 py-3 text-sm font-semibold text-white transition hover:bg-(--brick-700) disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}

                {saving
                  ? "جارٍ الحفظ..."
                  : editingId
                    ? "حفظ التعديلات"
                    : "إنشاء التصنيف"}
              </button>
            </div>
          </form>
        </section>

        {/* LIST */}
        <section className="rounded-3xl border border-(--olive-200) bg-white shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-4 border-b border-(--olive-100) px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-(--brick-500)">
                CATEGORIES
              </p>

              <h2 className="mt-1 text-xl font-bold text-(--olive-900)">
                {categories.length} تصنيف
              </h2>
            </div>

            <button
              type="button"
              onClick={loadCategories}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-(--olive-200) px-4 py-2.5 text-sm font-semibold text-(--olive-700) transition hover:bg-(--olive-50) disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
              />
              تحديث
            </button>
          </div>

          {loading ? (
            <div className="px-8 py-14 text-center text-sm text-(--olive-500)">
              جارٍ تحميل التصنيفات...
            </div>
          ) : categories.length === 0 ? (
            <div className="px-8 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-(--olive-50)">
                <Plus className="h-6 w-6 text-(--olive-500)" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-(--olive-900)">
                لا توجد تصنيفات بعد
              </h3>

              <p className="mt-2 text-sm text-(--olive-500)">
                أنشئ أول تصنيف للـJournal من النموذج أعلاه.
              </p>
            </div>
          ) : (
            <div className="kometik-divide-y kometik-separator-gray">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className="px-6 py-6 transition hover:bg-(--olive-50)/50 sm:px-8"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-semibold tracking-[0.15em] text-(--olive-400)">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold text-(--olive-900)">
                            {category.name}
                          </h3>

                          <p
                            dir="ltr"
                            className="mt-1 truncate text-xs text-(--olive-400)"
                          >
                            /{category.slug}
                          </p>
                        </div>
                      </div>

                      {category.description && (
                        <p className="mt-4 max-w-3xl text-sm leading-7 text-(--olive-600)">
                          {category.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full border border-(--olive-200) bg-(--olive-50) px-3 py-1.5 text-xs font-semibold text-(--olive-600)">
                        {category._count.posts} مقال
                      </span>

                      <button
                        type="button"
                        onClick={() => startEdit(category)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-(--olive-200) px-4 py-2.5 text-sm font-semibold text-(--olive-700) transition hover:border-(--brick-300) hover:bg-white hover:text-(--brick-700)"
                      >
                        <Edit3 className="h-4 w-4" />
                        تعديل
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}