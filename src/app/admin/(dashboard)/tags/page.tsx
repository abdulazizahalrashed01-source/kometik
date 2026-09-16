"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";


// ==========================================
// TYPES
// ==========================================

type Tag = {
  id: string;
  name: string;
  slug: string;
  _count?: {
    products: number;
  };
};


// ==========================================
// PAGE
// ==========================================

export default function AdminTagsPage() {

  // ==========================================
  // STATE
  // ==========================================

  const [tags, setTags] =
    useState<Tag[]>([]);

  const [name, setName] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ==========================================
  // LOAD TAGS
  // ==========================================

  async function loadTags() {

    try {

      setLoading(true);
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


      setError(
        error instanceof Error
          ? error.message
          : "Failed to load tags"
      );

    } finally {

      setLoading(false);

    }
  }


  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadTags();
  }, []);


  // ==========================================
  // CREATE TAG
  // ==========================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    const trimmedName =
      name.trim();


    if (!trimmedName) {

      setError(
        "Tag name is required."
      );

      setSuccess("");

      return;
    }


    try {

      setSaving(true);
      setError("");
      setSuccess("");


      const response =
        await fetch(
          "/api/admin/tags",
          {
            method: "POST",

            credentials: "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                name: trimmedName,
              }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        setError(
          data.message ||
            "Failed to create tag"
        );

        return;
      }


      setSuccess(
        "Tag created successfully."
      );

      setName("");


      await loadTags();

    } catch (error) {

      console.error(
        "CREATE TAG ERROR:",
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
  // PAGE
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

      <div className="mx-auto max-w-6xl">


        {/* ====================================
            HEADER
        ==================================== */}

        <div className="mb-8">

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
            وسوم المنتجات
          </h1>


          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-(--olive-600)
            "
          >
            أنشئ الوسوم التي تستخدمها لتصنيف
            المنتجات ضمن المجموعات والعروض.
          </p>

        </div>


        {/* ====================================
            CREATE TAG
        ==================================== */}

        <div
          className="
            mb-8
            rounded-2xl
            border
            border-(--olive-200)
            bg-white
            p-6
            shadow-[var(--shadow-soft)]
            sm:p-8
          "
        >

          <h2
            className="
              text-lg
              font-bold
              text-(--olive-900)
            "
          >
            إضافة وسم جديد
          </h2>


          <form
            onSubmit={handleSubmit}
            className="
              mt-5
              flex
              flex-col
              gap-3
              sm:flex-row
            "
          >

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="مثال: جديد"
              className="
                min-w-0
                flex-1
                rounded-xl
                border
                border-(--olive-200)
                px-4
                py-3
                text-sm
                outline-none
                transition
                focus:border-(--brick-500)
                focus:ring-1
                focus:ring-(--brick-500)
              "
            />


            <button
              type="submit"
              disabled={saving}
              className="
                rounded-xl
                bg-(--brick-600)
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-(--brick-700)
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving
                ? "جارٍ الإضافة..."
                : "إضافة الوسم"}
            </button>

          </form>


          {/* MESSAGES */}

          {error && (

            <div
              className="
                mt-4
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                text-red-600
              "
            >
              {error}
            </div>

          )}


          {success && (

            <div
              className="
                mt-4
                rounded-xl
                border
                border-green-200
                bg-green-50
                px-4
                py-3
                text-sm
                text-green-700
              "
            >
              {success}
            </div>

          )}

        </div>


        {/* ====================================
            TAGS LIST
        ==================================== */}

        <div
          className="
            rounded-2xl
            border
            border-(--olive-200)
            bg-white
            shadow-[var(--shadow-soft)]
          "
        >

          <div
            className="
              border-b
              border-(--olive-200)
              px-6
              py-5
              sm:px-8
            "
          >

            <h2
              className="
                text-lg
                font-bold
                text-(--olive-900)
              "
            >
              الوسوم الحالية
            </h2>

          </div>


          {loading ? (

            <div
              className="
                px-6
                py-12
                text-center
                text-sm
                text-(--olive-500)
              "
            >
              جارٍ تحميل الوسوم...
            </div>

          ) : tags.length === 0 ? (

            <div
              className="
                px-6
                py-12
                text-center
              "
            >

              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-(--olive-100)
                  text-xl
                  text-(--brick-600)
                "
              >
                #
              </div>


              <h3
                className="
                  mt-4
                  text-base
                  font-bold
                  text-(--olive-900)
                "
              >
                لا توجد وسوم بعد
              </h3>


              <p
                className="
                  mt-2
                  text-sm
                  text-(--olive-600)
                "
              >
                أضف أول وسم من النموذج أعلاه.
              </p>

            </div>

          ) : (

            <div
              className="
                kometik-divide-y
                kometik-separator-gray
              "
            >

              {tags.map(
                (tag) => (

                  <div
                    key={tag.id}
                    className="
                      flex
                      flex-col
                      gap-4
                      px-6
                      py-5
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                      sm:px-8
                    "
                  >

                    <div>

                      <h3
                        className="
                          font-semibold
                          text-(--olive-900)
                        "
                      >
                        {tag.name}
                      </h3>


                      <p
                        dir="ltr"
                        className="
                          mt-1
                          text-xs
                          text-(--olive-500)
                        "
                      >
                        /tag/
                        {tag.slug}
                      </p>

                    </div>


                    <div
                      className="
                        inline-flex
                        w-fit
                        items-center
                        rounded-full
                        bg-(--olive-100)
                        px-3
                        py-1.5
                        text-xs
                        font-semibold
                        text-(--olive-700)
                      "
                    >
                      {tag._count?.products ?? 0}
                      {" "}
                      منتج
                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

    </main>
  );
}