"use client";

import {
  FormEvent,
  Suspense,
  useState,
} from "react";

import Link from "next/link";

import { useRouter, useSearchParams } from "next/navigation";

import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";

// ==========================================
// RESET PASSWORD FORM
// ==========================================

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token =
    searchParams.get("token") || "";

  // ==========================================
  // FORM STATE
  // ==========================================

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  // ==========================================
  // PASSWORD VISIBILITY
  // ==========================================

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  // ==========================================
  // UI STATE
  // ==========================================

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ==========================================
  // SUBMIT
  // ==========================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    // ========================================
    // TOKEN VALIDATION
    // ========================================

    if (!token) {
      setError(
        "رابط إعادة تعيين كلمة المرور غير صالح أو غير مكتمل."
      );

      return;
    }

    // ========================================
    // PASSWORD VALIDATION
    // ========================================

    if (password.length < 6) {
      setError(
        "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل."
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "كلمتا المرور غير متطابقتين."
      );

      return;
    }

    setLoading(true);

    try {
      // ======================================
      // API REQUEST
      // ======================================

      const response =
        await fetch(
          "/api/auth/reset-password",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials: "include",

            body: JSON.stringify({
              token,
              password,
            }),
          }
        );

      const data =
        await response.json();

      // ======================================
      // ERROR
      // ======================================

      if (!response.ok) {
        setError(
          data.message ||
            "تعذر إعادة تعيين كلمة المرور."
        );

        return;
      }

      // ======================================
      // SUCCESS
      // ======================================

      setSuccess(
        data.message ||
          "تم تغيير كلمة المرور بنجاح."
      );

      // ======================================
      // REDIRECT
      // ======================================

      setTimeout(() => {
        router.replace(
          "/auth"
        );

        router.refresh();
      }, 1800);
    } catch (error) {
      console.error(
        "RESET PASSWORD ERROR:",
        error
      );

      setError(
        "تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setLoading(false);
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
        py-10
        sm:px-6
        sm:py-16
        lg:px-8
      "
    >
      <div
        className="
          mx-auto
          flex
          min-h-[75vh]
          max-w-md
          items-center
          justify-center
        "
      >
        <div className="w-full">

          {/* ==================================
              BACK
          ================================== */}

          <div className="mb-6">
            <Link
              href="/auth"
              className="
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

              العودة لتسجيل الدخول
            </Link>
          </div>

          {/* ==================================
              CARD
          ================================== */}

          <div
            className="
              overflow-hidden
              rounded-[2rem]
              border
              border-(--olive-200)
              bg-white
              shadow-[var(--shadow-card)]
            "
          >
            {/* TOP */}

            <div
              className="
                h-1.5
                bg-(--brick-600)
              "
            />

            <div className="p-6 sm:p-8">

              {/* ==================================
                  HEADER
              ================================== */}

              <div
                className="
                  mb-8
                  text-center
                "
              >
                <div
                  className="
                    mx-auto
                    mb-5
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-(--brick-600)
                    text-white
                    shadow-sm
                  "
                >
                  <Lock
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.25em]
                    text-(--brick-500)
                  "
                >
                  Kometik Beauty
                </p>

                <h1
                  className="
                    mt-3
                    text-2xl
                    font-bold
                    tracking-tight
                    text-(--olive-900)
                  "
                >
                  إعادة تعيين كلمة المرور
                </h1>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-(--olive-600)
                  "
                >
                  اختر كلمة مرور جديدة وآمنة
                  لحسابك.
                </p>
              </div>

              {/* ==================================
                  SUCCESS
              ================================== */}

              {success ? (
                <div
                  className="
                    rounded-2xl
                    border
                    border-(--olive-200)
                    bg-(--olive-50)
                    px-5
                    py-5
                    text-center
                  "
                >
                  <div
                    className="
                      mx-auto
                      mb-4
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-full
                      bg-(--brick-600)
                      text-white
                    "
                  >
                    <Check
                      size={21}
                      strokeWidth={2}
                    />
                  </div>

                  <p
                    className="
                      text-sm
                      leading-6
                      text-(--olive-800)
                    "
                  >
                    {success}
                  </p>

                  <p
                    className="
                      mt-2
                      text-xs
                      text-(--olive-500)
                    "
                  >
                    سيتم نقلك إلى صفحة تسجيل
                    الدخول...
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="kometik-space-y-5"
                >

                  {/* PASSWORD */}

                  <div>
                    <label
                      htmlFor="password"
                      className="
                        mb-2
                        block
                        text-sm
                        font-medium
                        text-(--olive-900)
                      "
                    >
                      كلمة المرور الجديدة
                    </label>

                    <div className="relative">
                      <Lock
                        size={17}
                        className="
                          pointer-events-none
                          absolute
                          right-4
                          top-1/2
                          -translate-y-1/2
                          text-(--olive-500)
                        "
                        strokeWidth={1.8}
                      />

                      <input
                        id="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        required
                        minLength={6}
                        autoComplete="new-password"
                        value={password}
                        onChange={(
                          event
                        ) =>
                          setPassword(
                            event.target.value
                          )
                        }
                        placeholder="••••••••"
                        dir="ltr"
                        className="
                          w-full
                          rounded-xl
                          border
                          border-(--olive-300)
                          bg-(--olive-50)
                          px-11
                          py-3
                          pl-12
                          text-left
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

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (prev) => !prev
                          )
                        }
                        className="
                          absolute
                          left-3
                          top-1/2
                          -translate-y-1/2
                          rounded-lg
                          p-1.5
                          text-(--olive-500)
                          transition
                          hover:bg-(--olive-200)
                          hover:text-(--brick-600)
                        "
                        aria-label={
                          showPassword
                            ? "إخفاء كلمة المرور"
                            : "إظهار كلمة المرور"
                        }
                      >
                        {showPassword ? (
                          <EyeOff
                            size={17}
                            strokeWidth={1.8}
                          />
                        ) : (
                          <Eye
                            size={17}
                            strokeWidth={1.8}
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="
                        mb-2
                        block
                        text-sm
                        font-medium
                        text-(--olive-900)
                      "
                    >
                      تأكيد كلمة المرور
                    </label>

                    <div className="relative">
                      <Lock
                        size={17}
                        className="
                          pointer-events-none
                          absolute
                          right-4
                          top-1/2
                          -translate-y-1/2
                          text-(--olive-500)
                        "
                        strokeWidth={1.8}
                      />

                      <input
                        id="confirmPassword"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        required
                        minLength={6}
                        autoComplete="new-password"
                        value={
                          confirmPassword
                        }
                        onChange={(
                          event
                        ) =>
                          setConfirmPassword(
                            event.target.value
                          )
                        }
                        placeholder="••••••••"
                        dir="ltr"
                        className="
                          w-full
                          rounded-xl
                          border
                          border-(--olive-300)
                          bg-(--olive-50)
                          px-11
                          py-3
                          pl-12
                          text-left
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

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (prev) => !prev
                          )
                        }
                        className="
                          absolute
                          left-3
                          top-1/2
                          -translate-y-1/2
                          rounded-lg
                          p-1.5
                          text-(--olive-500)
                          transition
                          hover:bg-(--olive-200)
                          hover:text-(--brick-600)
                        "
                        aria-label={
                          showConfirmPassword
                            ? "إخفاء كلمة المرور"
                            : "إظهار كلمة المرور"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff
                            size={17}
                            strokeWidth={1.8}
                          />
                        ) : (
                          <Eye
                            size={17}
                            strokeWidth={1.8}
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ERROR */}

                  {error && (
                    <div
                      className="
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

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      flex
                      w-full
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
                    {loading ? (
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

                        جارٍ تغيير كلمة المرور...
                      </>
                    ) : (
                      <>
                        إعادة تعيين كلمة المرور

                        <ArrowRight
                          size={17}
                          strokeWidth={2}
                        />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ==================================
                  FOOTER
              ================================== */}

              <div
                className="
                  mt-8
                  border-t
                  border-(--olive-200)
                  pt-6
                  text-center
                "
              >
                <Link
                  href="/auth"
                  className="
                    text-sm
                    font-semibold
                    text-(--brick-600)
                    transition
                    hover:text-(--brick-700)
                    hover:underline
                  "
                >
                  العودة إلى تسجيل الدخول
                </Link>
              </div>

              {/* SECURITY */}

              <div
                className="
                  mt-6
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-xs
                  text-(--olive-500)
                "
              >
                <Check
                  size={14}
                  className="text-(--brick-500)"
                  strokeWidth={2}
                />

                <span>
                  رابط الاستعادة صالح لمرة واحدة
                  فقط.
                </span>
              </div>
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main
          dir="rtl"
          className="
            min-h-screen
            bg-(--background)
            px-4
            py-10
            sm:px-6
            sm:py-16
            lg:px-8
          "
        >
          <div
            className="
              mx-auto
              flex
              min-h-[75vh]
              max-w-md
              items-center
              justify-center
            "
          >
            <div
              className="
                h-8
                w-8
                animate-spin
                rounded-full
                border-2
                border-(--olive-200)
                border-t-(--brick-600)
              "
            />
          </div>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
