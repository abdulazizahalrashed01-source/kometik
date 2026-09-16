"use client";

import Link from "next/link";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";

import {
  ArrowRight,
  Camera,
  Check,
  Save,
  UserRound,
  X,
} from "lucide-react";

// ==========================================
// USER TYPE
// ==========================================

type User = {
  id: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
};

// ==========================================
// PROFILE PAGE
// ==========================================

export default function ProfilePage() {
  // ==========================================
  // FORM STATE
  // ==========================================

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [imageUrl, setImageUrl] = useState("");

  // ==========================================
  // IMAGE STATE
  // ==========================================

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [removeCurrentImage, setRemoveCurrentImage] =
    useState(false);

  // ==========================================
  // UI STATE
  // ==========================================

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ==========================================
  // FILE INPUT
  // ==========================================

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  // ==========================================
  // LOAD PROFILE
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/account/profile",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "تعذر تحميل الملف الشخصي."
          );
        }

        if (cancelled) {
          return;
        }

        const user: User = data.user;

        setName(user.name || "");

        setEmail(user.email);

        setImageUrl(user.imageUrl || "");

        setSelectedImage(null);

        setRemoveCurrentImage(false);
      } catch (error) {
        console.error(
          "LOAD PROFILE ERROR:",
          error
        );

        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "تعذر تحميل الملف الشخصي."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================
  // CHANGE PROFILE IMAGE
  // ==========================================

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    // ========================================
    // IMAGE TYPE
    // ========================================

    if (!file.type.startsWith("image/")) {
      setError(
        "يرجى اختيار ملف صورة صالح."
      );

      event.target.value = "";

      return;
    }

    // ========================================
    // IMAGE SIZE
    //
    // Maximum: 10 MB
    // ========================================

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "يجب ألا يتجاوز حجم الصورة 10 ميغابايت."
      );

      event.target.value = "";

      return;
    }

    // ========================================
    // STORE FILE
    // ========================================

    setSelectedImage(file);

    setRemoveCurrentImage(false);

    setError("");

    setSuccess("");

    // ========================================
    // PREVIEW
    // ========================================

    const reader =
      new FileReader();

    reader.onload = () => {
      const result =
        reader.result;

      if (
        typeof result === "string"
      ) {
        setImageUrl(result);
      }
    };

    reader.onerror = () => {
      setError(
        "تعذر قراءة الصورة."
      );
    };

    reader.readAsDataURL(file);
  }

  // ==========================================
  // OPEN FILE PICKER
  // ==========================================

  function openImagePicker() {
    fileInputRef.current?.click();
  }

  // ==========================================
  // REMOVE IMAGE
  // ==========================================

  function removeImage() {
    setImageUrl("");

    setSelectedImage(null);

    setRemoveCurrentImage(true);

    setError("");

    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    setSuccess("");

    setSaving(true);

    try {
      // ======================================
      // FORM DATA
      // ======================================

      const formData =
        new FormData();

      formData.append(
        "name",
        name.trim()
      );

      // ======================================
      // NEW IMAGE
      // ======================================

      if (selectedImage) {
        formData.append(
          "image",
          selectedImage
        );
      }

      // ======================================
      // REMOVE IMAGE
      // ======================================

      if (removeCurrentImage) {
        formData.append(
          "removeImage",
          "true"
        );
      }

      // ======================================
      // REQUEST
      // ======================================

      const response =
        await fetch(
          "/api/account/profile",
          {
            method: "PATCH",

            credentials: "include",

            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "تعذر تحديث الملف الشخصي."
        );
      }

      // ======================================
      // UPDATE LOCAL STATE
      // ======================================

      setName(
        data.user.name || ""
      );

      setEmail(
        data.user.email
      );

      setImageUrl(
        data.user.imageUrl || ""
      );

      setSelectedImage(null);

      setRemoveCurrentImage(false);

      // ======================================
      // RESET FILE INPUT
      // ======================================

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // ======================================
      // SUCCESS
      // ======================================

      setSuccess(
        "تم تحديث الملف الشخصي بنجاح."
      );
    } catch (error) {
      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "تعذر تحديث الملف الشخصي."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // AVATAR LETTER
  // ==========================================

  const avatarLetter = (
    name ||
    email ||
    "U"
  )
    .charAt(0)
    .toUpperCase();

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main
        dir="rtl"
        className="
          min-h-screen
          bg-(--background)
          px-4
          py-10
          sm:px-6
          lg:px-8
          lg:py-14
        "
      >
        <div className="mx-auto max-w-2xl">
          <div
            className="
              overflow-hidden
              rounded-[1.75rem]
              border
              border-(--olive-200)
              bg-white
              shadow-[var(--shadow-soft)]
            "
          >
            <div
              className="
                h-1.5
                bg-(--brick-600)
              "
            />

            <div className="p-6 sm:p-8">
              <div className="animate-pulse">
                <div
                  className="
                    h-7
                    w-40
                    rounded-lg
                    bg-(--olive-200)
                  "
                />

                <div
                  className="
                    mt-3
                    h-4
                    w-64
                    rounded
                    bg-(--olive-100)
                  "
                />

                <div
                  className="
                    mt-8
                    flex
                    items-center
                    gap-5
                  "
                >
                  <div
                    className="
                      h-28
                      w-28
                      rounded-full
                      bg-(--olive-200)
                    "
                  />

                  <div className="flex-1">
                    <div
                      className="
                        h-5
                        w-32
                        rounded
                        bg-(--olive-200)
                      "
                    />

                    <div
                      className="
                        mt-3
                        h-4
                        w-48
                        rounded
                        bg-(--olive-100)
                      "
                    />
                  </div>
                </div>

                <div
                  className="
                    mt-8
                    h-12
                    rounded-xl
                    bg-(--olive-100)
                  "
                />

                <div
                  className="
                    mt-5
                    h-12
                    rounded-xl
                    bg-(--olive-100)
                  "
                />

                <div
                  className="
                    mt-8
                    h-12
                    rounded-xl
                    bg-(--olive-200)
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
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
        py-10
        sm:px-6
        lg:px-8
        lg:py-14
      "
    >
      <div className="mx-auto max-w-2xl">

        {/* ====================================
            BACK
        ==================================== */}

        <Link
          href="/account"
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-(--olive-200)
            bg-white
            px-4
            py-2.5
            text-sm
            font-medium
            text-(--olive-700)
            shadow-sm
            transition
            hover:border-(--brick-200)
            hover:bg-(--olive-50)
            hover:text-(--brick-700)
          "
        >
          <ArrowRight
            size={16}
            strokeWidth={1.9}
          />

          العودة إلى حسابي
        </Link>

        {/* ====================================
            HEADER
        ==================================== */}

        <div className="mb-8">
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.25em]
              text-(--brick-500)
            "
          >
            Kometik
          </p>

          <h1
            className="
              mt-2
              text-3xl
              font-bold
              tracking-tight
              text-(--olive-900)
              sm:text-4xl
            "
          >
            الملف الشخصي
          </h1>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-(--olive-600)
            "
          >
            إدارة معلوماتك الشخصية وصورتك.
          </p>
        </div>

        {/* ====================================
            CARD
        ==================================== */}

        <div
          className="
            overflow-hidden
            rounded-[1.75rem]
            border
            border-(--olive-200)
            bg-white
            shadow-[var(--shadow-card)]
          "
        >
          {/* TOP ACCENT */}

          <div
            className="
              h-1.5
              bg-(--brick-600)
            "
          />

          <div
            className="
              p-6
              sm:p-8
            "
          >
            {/* ==================================
                PROFILE HEADER
            ================================== */}

            <div
              className="
                mb-8
                flex
                flex-col
                items-center
                gap-5
                sm:flex-row
                sm:items-center
              "
            >
              {/* IMAGE PICKER */}

              <div className="relative">
                <button
                  type="button"
                  onClick={
                    openImagePicker
                  }
                  className="
                    group
                    relative
                    flex
                    h-28
                    w-28
                    overflow-hidden
                    rounded-full
                    bg-(--brick-50)
                    text-3xl
                    font-bold
                    text-(--brick-700)
                    ring-4
                    ring-(--olive-100)
                    transition
                    hover:ring-(--brick-100)
                  "
                  aria-label="تغيير صورة الملف الشخصي"
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="صورة الملف الشخصي"
                      fill
                      unoptimized={
                        imageUrl.startsWith(
                          "data:"
                        )
                      }
                      sizes="112px"
                      className="
                        object-cover
                      "
                    />
                  ) : (
                    <span className="m-auto">
                      {avatarLetter}
                    </span>
                  )}

                  {/* HOVER */}

                  <span
                    className="
                      absolute
                      inset-0
                      flex
                      items-center
                      justify-center
                      bg-(--olive-900)/45
                      text-xs
                      font-medium
                      text-white
                      opacity-0
                      transition
                      group-hover:opacity-100
                    "
                  >
                    تغيير الصورة
                  </span>
                </button>

                {/* CAMERA BUTTON */}

                <button
                  type="button"
                  onClick={
                    openImagePicker
                  }
                  aria-label="رفع صورة الملف الشخصي"
                  className="
                    absolute
                    bottom-0
                    left-0
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    border-4
                    border-white
                    bg-(--brick-600)
                    text-white
                    shadow-sm
                    transition
                    hover:bg-(--brick-700)
                  "
                >
                  <Camera
                    size={15}
                    strokeWidth={2}
                  />
                </button>

                {/* HIDDEN INPUT */}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="
                    image/png,
                    image/jpeg,
                    image/webp,
                    image/gif
                  "
                  onChange={
                    handleImageChange
                  }
                  className="hidden"
                />
              </div>

              {/* USER INFO */}

              <div className="text-center sm:text-right">
                <div
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    sm:justify-start
                  "
                >
                  <UserRound
                    size={17}
                    className="text-(--brick-500)"
                    strokeWidth={1.8}
                  />

                  <h2
                    className="
                      text-lg
                      font-semibold
                      text-(--olive-900)
                    "
                  >
                    {name || "المستخدم"}
                  </h2>
                </div>

                <p
                  dir="ltr"
                  className="
                    mt-1
                    text-sm
                    text-(--olive-600)
                  "
                >
                  {email}
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    text-(--olive-500)
                  "
                >
                  اضغط على الصورة لتغييرها.
                </p>
              </div>
            </div>

            {/* ==================================
                FORM
            ================================== */}

            <form
              onSubmit={handleSubmit}
              className="kometik-space-y-6"
            >
              {/* NAME */}

              <div>
                <label
                  htmlFor="name"
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-(--olive-900)
                  "
                >
                  الاسم
                </label>

                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => {
                    setName(
                      event.target.value
                    );

                    setSuccess("");
                  }}
                  placeholder="أدخل اسمك"
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

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-(--olive-900)
                  "
                >
                  البريد الإلكتروني
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  aria-readonly="true"
                  dir="ltr"
                  className="
                    w-full
                    cursor-not-allowed
                    rounded-xl
                    border
                    border-(--olive-200)
                    bg-(--olive-100)
                    px-4
                    py-3
                    text-left
                    text-sm
                    text-(--olive-600)
                    outline-none
                  "
                />

                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-(--olive-500)
                  "
                >
                  لا يمكن تغيير عنوان البريد
                  الإلكتروني من هنا.
                </p>
              </div>

              {/* REMOVE PHOTO */}

              {imageUrl && (
                <button
                  type="button"
                  onClick={
                    removeImage
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-(--brick-200)
                    bg-(--brick-50)
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-(--brick-700)
                    transition
                    hover:bg-(--brick-100)
                  "
                >
                  <X
                    size={15}
                    strokeWidth={2}
                  />

                  إزالة صورة الملف الشخصي
                </button>
              )}

              {/* ==================================
                  ERROR
              ================================== */}

              {error && (
                <div
                  className="
                    flex
                    items-start
                    gap-3
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
                  <X
                    size={17}
                    className="mt-0.5 shrink-0"
                    strokeWidth={2}
                  />

                  <span>{error}</span>
                </div>
              )}

              {/* ==================================
                  SUCCESS
              ================================== */}

              {success && (
                <div
                  className="
                    flex
                    items-start
                    gap-3
                    rounded-2xl
                    border
                    border-(--brick-200)
                    bg-(--brick-50)
                    px-4
                    py-3
                    text-sm
                    leading-6
                    text-(--brick-700)
                  "
                >
                  <Check
                    size={17}
                    className="mt-0.5 shrink-0"
                    strokeWidth={2}
                  />

                  <span>{success}</span>
                </div>
              )}

              {/* ==================================
                  ACTIONS
              ================================== */}

              <div
                className="
                  flex
                  flex-col
                  gap-3
                  border-t
                  border-(--olive-200)
                  pt-6
                  sm:flex-row
                "
              >
                {/* SAVE */}

                <button
                  type="submit"
                  disabled={saving}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-(--brick-600)
                    px-6
                    py-3.5
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-(--brick-700)
                    active:scale-[0.99]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {saving ? (
                    <>
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

                      جارٍ الحفظ...
                    </>
                  ) : (
                    <>
                      <Save
                        size={17}
                        strokeWidth={1.9}
                      />

                      حفظ التغييرات
                    </>
                  )}
                </button>

                {/* CANCEL */}

                <Link
                  href="/account"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-(--olive-300)
                    bg-white
                    px-6
                    py-3.5
                    font-semibold
                    text-(--olive-900)
                    transition
                    hover:border-(--brick-200)
                    hover:bg-(--olive-50)
                    hover:text-(--brick-700)
                  "
                >
                  إلغاء
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* ====================================
            IMAGE INFORMATION
        ==================================== */}

        <div
          className="
            mt-5
            rounded-2xl
            border
            border-(--olive-200)
            bg-(--olive-50)
            px-5
            py-4
          "
        >
          <p
            className="
              text-xs
              leading-5
              text-(--olive-600)
            "
          >
            الحد الأقصى لحجم صورة الملف الشخصي
            هو 10 ميغابايت. الصيغ المدعومة:
            JPG وPNG وWEBP وGIF.
          </p>
        </div>
      </div>
    </main>
  );
}
