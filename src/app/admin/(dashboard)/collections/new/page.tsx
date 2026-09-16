"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";


// ==========================================
// TYPES
// ==========================================

type Tag = {
  id: string;
  name: string;
  slug: string;
};

type CollectionType =
  | "MANUAL"
  | "TAG";


// ==========================================
// PAGE
// ==========================================

export default function NewCollectionPage() {
  const router = useRouter();


  // ==========================================
  // FORM
  // ==========================================

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [active, setActive] =
    useState(true);

  const [type, setType] =
    useState<CollectionType>("MANUAL");

  const [tagId, setTagId] =
    useState("");


  // ==========================================
  // TAGS
  // ==========================================

  const [tags, setTags] =
    useState<Tag[]>([]);

  const [loadingTags, setLoadingTags] =
    useState(false);


  // ==========================================
  // UI
  // ==========================================

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==========================================
  // LOAD TAGS
  // ==========================================

  useEffect(() => {

    async function loadTags() {

      try {

        setLoadingTags(true);
        setError("");


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
              "تعذر تحميل الوسوم."
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


        setError(
          error instanceof Error
            ? error.message
            : "تعذر تحميل الوسوم."
        );

      } finally {

        setLoadingTags(false);

      }

    }


    loadTags();

  }, []);


  // ==========================================
  // HANDLE TYPE CHANGE
  // ==========================================

  function handleTypeChange(
    newType: CollectionType
  ) {

    setType(newType);

    setError("");


    // ----------------------------------------
    // Manual collections do not need a tag
    // ----------------------------------------

    if (
      newType === "MANUAL"
    ) {
      setTagId("");
    }

  }


  // ==========================================
  // SUBMIT
  // ==========================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError("");


    const trimmedName =
      name.trim();

    const trimmedDescription =
      description.trim();


    // ----------------------------------------
    // Validate name
    // ----------------------------------------

    if (!trimmedName) {

      setError(
        "اسم المجموعة مطلوب."
      );

      return;
    }


    // ----------------------------------------
    // Validate TAG collection
    // ----------------------------------------

    if (
      type === "TAG" &&
      !tagId
    ) {

      setError(
        "يرجى اختيار الوسم المرتبط بالمجموعة."
      );

      return;
    }


    setSaving(true);


    try {

      const response =
        await fetch(
          "/api/admin/collections",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials: "include",

            body:
              JSON.stringify({

                name:
                  trimmedName,

                description:
                  trimmedDescription ||
                  null,

                active,

                type,

                tagId:
                  type === "TAG"
                    ? tagId
                    : null,

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
            "تعذر إنشاء المجموعة."
        );

        return;
      }


      // --------------------------------------
      // SUCCESS
      // --------------------------------------

      router.push(
        "/admin/collections"
      );

      router.refresh();

    } catch (error) {

      console.error(
        "CREATE COLLECTION ERROR:",
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


  // ==========================================
  // UI
  // ==========================================

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-(--background)
        px-4
        py-8
        sm:px-6
        lg:px-8
      "
    >

      <div className="mx-auto max-w-2xl">


        {/* ====================================
            BACK
        ==================================== */}

        <Link
          href="/admin/collections"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-medium
            text-(--olive-600)
            transition
            hover:text-(--brick-600)
          "
        >
          ← العودة إلى المجموعات
        </Link>


        {/* ====================================
            HEADER
        ==================================== */}

        <div className="mt-6 mb-8">

          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.2em]
              text-(--brick-500)
            "
          >
            Kometik Admin
          </p>


          <h1
            className="
              mt-2
              text-3xl
              font-bold
              text-(--olive-900)
            "
          >
            إضافة مجموعة جديدة
          </h1>


          <p
            className="
              mt-2
              text-sm
              leading-6
              text-(--olive-600)
            "
          >
            أنشئ مجموعة يدوية أو اربطها
            بوسم لتعرض المنتجات تلقائيًا.
          </p>

        </div>


        {/* ====================================
            FORM
        ==================================== */}

        <form
          onSubmit={handleSubmit}
          className="
            rounded-3xl
            border
            border-(--olive-200)
            bg-white
            p-6
            shadow-[var(--shadow-card)]
            sm:p-8
          "
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
                font-semibold
                text-(--olive-900)
              "
            >
              اسم المجموعة
            </label>


            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="مثال: جديدنا"
              required
              className="
                w-full
                rounded-xl
                border
                border-(--olive-300)
                bg-(--olive-50)
                px-4
                py-3
                text-sm
                text-(--olive-900)
                outline-none
                transition
                placeholder:text-(--olive-500)
                focus:border-(--brick-400)
                focus:bg-white
                focus:ring-2
                focus:ring-(--brick-100)
              "
            />

          </div>


          {/* ==================================
              DESCRIPTION
          ================================== */}

          <div className="mt-6">

            <label
              htmlFor="description"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-(--olive-900)
              "
            >
              وصف المجموعة
            </label>


            <textarea
              id="description"
              rows={5}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="وصف مختصر يظهر في لوحة الإدارة أو صفحة المجموعة."
              className="
                w-full
                resize-none
                rounded-xl
                border
                border-(--olive-300)
                bg-(--olive-50)
                px-4
                py-3
                text-sm
                leading-6
                text-(--olive-900)
                outline-none
                transition
                placeholder:text-(--olive-500)
                focus:border-(--brick-400)
                focus:bg-white
                focus:ring-2
                focus:ring-(--brick-100)
              "
            />

          </div>


          {/* ==================================
              COLLECTION TYPE
          ================================== */}

          <div className="mt-6">

            <label
              className="
                mb-3
                block
                text-sm
                font-semibold
                text-(--olive-900)
              "
            >
              نوع المجموعة
            </label>


            <div
              className="
                grid
                gap-3
                sm:grid-cols-2
              "
            >

              {/* MANUAL */}

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
                    type === "MANUAL"
                      ? "border-(--brick-500) bg-(--brick-50) ring-2 ring-(--brick-100)"
                      : "border-(--olive-200) bg-white hover:border-(--olive-400)"
                  }
                `}
              >

                <p
                  className="
                    text-sm
                    font-bold
                    text-(--olive-900)
                  "
                >
                  مجموعة يدوية
                </p>


                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-(--olive-600)
                  "
                >
                  المنتجات يتم ربطها
                  بالمجموعة يدويًا.
                </p>

              </button>


              {/* TAG */}

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
                    type === "TAG"
                      ? "border-(--brick-500) bg-(--brick-50) ring-2 ring-(--brick-100)"
                      : "border-(--olive-200) bg-white hover:border-(--olive-400)"
                  }
                `}
              >

                <p
                  className="
                    text-sm
                    font-bold
                    text-(--olive-900)
                  "
                >
                  حسب الوسم
                </p>


                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-(--olive-600)
                  "
                >
                  تظهر تلقائيًا المنتجات
                  التي تحمل وسمًا محددًا.
                </p>

              </button>

            </div>

          </div>


          {/* ==================================
              TAG SELECT
          ================================== */}

          {type === "TAG" && (

            <div
              className="
                mt-5
                rounded-2xl
                border
                border-(--olive-200)
                bg-(--olive-50)
                p-4
              "
            >

              <label
                htmlFor="tag"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-(--olive-900)
                "
              >
                الوسم المرتبط بالمجموعة
              </label>


              <select
                id="tag"
                value={tagId}
                disabled={
                  loadingTags ||
                  tags.length === 0
                }
                onChange={(event) =>
                  setTagId(
                    event.target.value
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-(--olive-300)
                  bg-white
                  px-4
                  py-3
                  text-sm
                  text-(--olive-900)
                  outline-none
                  transition
                  focus:border-(--brick-400)
                  focus:ring-2
                  focus:ring-(--brick-100)
                  disabled:cursor-not-allowed
                  disabled:bg-gray-100
                "
              >

                <option value="">
                  {loadingTags
                    ? "جارٍ تحميل الوسوم..."
                    : tags.length === 0
                      ? "لا توجد وسوم"
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


              {tags.length === 0 &&
                !loadingTags && (

                  <p
                    className="
                      mt-2
                      text-xs
                      text-(--olive-500)
                    "
                  >
                    أنشئ وسمًا أولًا من صفحة
                    إدارة الوسوم.
                  </p>

                )}

            </div>

          )}


          {/* ==================================
              ACTIVE
          ================================== */}

          <div
            className="
              mt-6
              rounded-2xl
              border
              border-(--olive-200)
              bg-(--olive-50)
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
                    text-(--olive-900)
                  "
                >
                  المجموعة نشطة
                </p>


                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-(--olive-600)
                  "
                >
                  يمكن إيقافها لاحقًا بدون حذفها.
                </p>

              </div>


              <input
                type="checkbox"
                checked={active}
                onChange={(event) =>
                  setActive(
                    event.target.checked
                  )
                }
                className="
                  h-5
                  w-5
                  accent-(--brick-600)
                "
              />

            </label>

          </div>


          {/* ==================================
              ERROR
          ================================== */}

          {error && (

            <div
              className="
                mt-6
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


          {/* ==================================
              ACTIONS
          ================================== */}

          <div
            className="
              mt-8
              flex
              flex-col
              gap-3
              sm:flex-row
            "
          >

            <button
              type="submit"
              disabled={
                saving ||
                (
                  type === "TAG" &&
                  (
                    loadingTags ||
                    !tagId
                  )
                )
              }
              className="
                flex
                flex-1
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-(--brick-600)
                px-6
                py-3.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-(--brick-700)
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >

              {saving && (

                <span
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-white/40
                    border-t-white
                  "
                />

              )}


              {saving
                ? "جارٍ إنشاء المجموعة..."
                : "إنشاء المجموعة"}

            </button>


            <Link
              href="/admin/collections"
              className="
                flex
                flex-1
                items-center
                justify-center
                rounded-xl
                border
                border-(--olive-300)
                bg-white
                px-6
                py-3.5
                text-center
                text-sm
                font-semibold
                text-(--olive-700)
                transition
                hover:bg-(--olive-50)
              "
            >
              إلغاء
            </Link>

          </div>

        </form>

      </div>

    </main>
  );
}