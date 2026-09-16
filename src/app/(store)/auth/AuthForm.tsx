"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserRound,
} from "lucide-react";

// ==========================================
// TYPES
// ==========================================

type AuthMode =
  | "login"
  | "register";

type AuthFormProps = {
  redirect: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: {
              credential: string;
            }) => void;
        }) => void;

          renderButton: (
            element: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              width?: number;
              text?: string;
              shape?: string;
              logo_alignment?: string;
            }
          ) => void;
        };
      };
    };
  }
}

// ==========================================
// AUTH FORM
// ==========================================

export default function AuthForm({
  redirect,
}: AuthFormProps) {
  const router = useRouter();

  // ==========================================
  // AUTH MODE
  // ==========================================

  const [mode, setMode] =
    useState<AuthMode>("login");

  // ==========================================
  // FORM STATE
  // ==========================================

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

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

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================
  // GOOGLE BUTTON
  // ==========================================

  const googleButtonRef =
    useRef<HTMLDivElement>(null);

  // ==========================================
  // MODE
  // ==========================================

  const isRegister =
    mode === "register";

  // ==========================================
  // GOOGLE INITIALIZATION
  // ==========================================

  function initializeGoogle() {
    const google =
      window.google;

    if (
      !google ||
      !googleButtonRef.current
    ) {
      return;
    }

    const clientId =
      process.env
        .NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError(
        "Google authentication is not configured."
      );

      return;
    }

    google.accounts.id.initialize({
      client_id: clientId,

      callback: (
        response
      ) => {
        if (
          response?.credential
        ) {
          handleGoogleLogin(
            response.credential
          );
        }
      },
    });

    googleButtonRef.current.innerHTML =
      "";

    google.accounts.id.renderButton(
      googleButtonRef.current,
      {
        theme: "outline",
        size: "large",
        width: 360,
        text: "continue_with",
        shape: "rect",
        logo_alignment: "center",
      }
    );
  }

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  async function handleGoogleLogin(
    credential: string
  ) {
    setError("");
    setGoogleLoading(true);

    try {
      const response =
        await fetch(
          "/api/auth/google",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials: "include",

            body:
              JSON.stringify({
                credential,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "تعذر تسجيل الدخول باستخدام Google."
        );

        return;
      }

      router.replace(
        redirect || "/account"
      );

      router.refresh();
    } catch (
      googleError
    ) {
      console.error(
        "GOOGLE AUTH ERROR:",
        googleError
      );

      setError(
        "تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  // ==========================================
  // GOOGLE SCRIPT
  // ==========================================

  useEffect(() => {
    if (window.google) {
      initializeGoogle();
    }
  }, []);

  // ==========================================
  // SWITCH MODE
  // ==========================================

  function switchMode(
    newMode: AuthMode
  ) {
    setMode(newMode);

    setError("");

    setPassword("");

    setConfirmPassword("");

    setShowPassword(false);

    setShowConfirmPassword(false);
  }

  // ==========================================
  // SUBMIT
  // ==========================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    // ========================================
    // REGISTER VALIDATION
    // ========================================

    if (isRegister) {
      if (!name.trim()) {
        setError(
          "الاسم مطلوب."
        );

        return;
      }

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
    }

    // ========================================
    // EMAIL VALIDATION
    // ========================================

    if (!email.trim()) {
      setError(
        "البريد الإلكتروني مطلوب."
      );

      return;
    }

    setLoading(true);

    try {
      // ======================================
      // ENDPOINT
      // ======================================

      const endpoint =
        isRegister
          ? "/api/auth/register"
          : "/api/auth/login";

      // ======================================
      // BODY
      // ======================================

      const body =
        isRegister
          ? {
              name:
                name.trim(),

              email:
                email
                  .trim()
                  .toLowerCase(),

              password,
            }
          : {
              email:
                email
                  .trim()
                  .toLowerCase(),

              password,
            };

      // ======================================
      // REQUEST
      // ======================================

      const response =
        await fetch(
          endpoint,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body:
              JSON.stringify(body),
          }
        );

      const data =
        await response.json();

      // ======================================
      // VERIFICATION REQUIRED
      // ======================================

      if (
        data.verificationRequired &&
        data.email
      ) {
        router.push(
          `/auth/verify-email?email=${encodeURIComponent(
            data.email
          )}`
        );

        return;
      }

      // ======================================
      // ERROR
      // ======================================

      if (!response.ok) {
        setError(
          data.message ||
            (
              isRegister
                ? "تعذر إنشاء الحساب."
                : "البريد الإلكتروني أو كلمة المرور غير صحيحة."
            )
        );

        return;
      }

      // ======================================
      // SUCCESS
      // ======================================

      router.replace(
        redirect || "/account"
      );

      router.refresh();
    } catch (
      authError
    ) {
      console.error(
        "AUTH ERROR:",
        authError
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
              GOOGLE SCRIPT
          ================================== */}

          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onLoad={
              initializeGoogle
            }
          />

          {/* ==================================
              BACK
          ================================== */}

          <div className="mb-6">
            <button
              type="button"
              onClick={() =>
                router.back()
              }
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

              العودة للمتجر
            </button>
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

            <div
              className="
                p-6
                sm:p-8
              "
            >

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
                    text-xl
                    font-bold
                    text-white
                    shadow-sm
                  "
                >
                  K
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
                  {isRegister
                    ? "إنشاء حسابك"
                    : "مرحبًا بعودتك"}
                </h1>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-(--olive-600)
                  "
                >
                  {isRegister
                    ? "أنشئ حسابك وابدأ تجربة التسوق مع Kometik."
                    : "سجل الدخول للمتابعة إلى حسابك."}
                </p>

                {/* CHECKOUT NOTICE */}

                {redirect ===
                  "/checkout" && (
                  <div
                    className="
                      mt-5
                      rounded-2xl
                      border
                      border-(--brick-200)
                      bg-(--brick-50)
                      px-4
                      py-3
                      text-sm
                      leading-6
                      text-(--brick-800)
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                      "
                    >
                      <Lock
                        size={15}
                        strokeWidth={1.9}
                      />

                      <span>
                        بعد تسجيل الدخول ستعود
                        تلقائيًا إلى صفحة إتمام الطلب.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* ==================================
                  TABS
              ================================== */}

              <div
                className="
                  mb-7
                  grid
                  grid-cols-2
                  rounded-2xl
                  bg-(--olive-100)
                  p-1
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    switchMode(
                      "login"
                    )
                  }
                  className={`
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-medium
                    transition
                    ${
                      mode ===
                      "login"
                        ? "bg-white text-(--brick-700) shadow-sm"
                        : "text-(--olive-600) hover:text-(--olive-900)"
                    }
                  `}
                >
                  تسجيل الدخول
                </button>

                <button
                  type="button"
                  onClick={() =>
                    switchMode(
                      "register"
                    )
                  }
                  className={`
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-medium
                    transition
                    ${
                      mode ===
                      "register"
                        ? "bg-white text-(--brick-700) shadow-sm"
                        : "text-(--olive-600) hover:text-(--olive-900)"
                    }
                  `}
                >
                  إنشاء حساب
                </button>
              </div>

              {/* ==================================
                  GOOGLE AUTH
              ================================== */}

              <div className="mb-6">

                <div
                  className="
                    flex
                    min-h-[44px]
                    items-center
                    justify-center
                  "
                >
                  {googleLoading ? (
                    <div
                      className="
                        flex
                        h-11
                        w-full
                        max-w-[360px]
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-(--olive-200)
                        bg-white
                        text-sm
                        text-(--olive-600)
                      "
                    >
                      <span
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-(--olive-200)
                          border-t-(--brick-600)
                        "
                      />

                      جارٍ المتابعة باستخدام Google...
                    </div>
                  ) : (
                    <div
                      ref={
                        googleButtonRef
                      }
                      className="
                        flex
                        min-h-[44px]
                        w-full
                        justify-center
                      "
                    />
                  )}
                </div>

                <div
                  className="
                    mt-5
                    flex
                    items-center
                    gap-3
                  "
                >
                  <div
                    className="
                      h-px
                      flex-1
                      bg-(--olive-200)
                    "
                  />

                  <span
                    className="
                      text-xs
                      font-medium
                      text-(--olive-500)
                    "
                  >
                    أو
                  </span>

                  <div
                    className="
                      h-px
                      flex-1
                      bg-(--olive-200)
                    "
                  />
                </div>
              </div>

              {/* ==================================
                  FORM
              ================================== */}

              <form
                onSubmit={
                  handleSubmit
                }
                className="
                  kometik-space-y-5
                "
              >

                {/* NAME */}

                {isRegister && (
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

                    <div
                      className="
                        relative
                      "
                    >
                      <UserRound
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
                        id="name"
                        type="text"
                        required
                        autoComplete="name"
                        value={name}
                        onChange={(
                          event
                        ) =>
                          setName(
                            event.target
                              .value
                          )
                        }
                        placeholder="أدخل اسمك"
                        className="
                          w-full
                          rounded-xl
                          border
                          border-(--olive-300)
                          bg-(--olive-50)
                          px-11
                          py-3
                          text-right
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
                  </div>
                )}

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

                  <div
                    className="
                      relative
                    "
                  >
                    <Mail
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
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(
                        event
                      ) =>
                        setEmail(
                          event.target
                            .value
                        )
                      }
                      placeholder="example@email.com"
                      dir="ltr"
                      className="
                        w-full
                        rounded-xl
                        border
                        border-(--olive-300)
                        bg-(--olive-50)
                        px-11
                        py-3
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
                  </div>
                </div>

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
                    كلمة المرور
                  </label>

                  <div
                    className="
                      relative
                    "
                  >
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
                      autoComplete={
                        isRegister
                          ? "new-password"
                          : "current-password"
                      }
                      value={password}
                      onChange={(
                        event
                      ) =>
                        setPassword(
                          event.target
                            .value
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
                          (prev) =>
                            !prev
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

                {isRegister && (
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

                    <div
                      className="
                        relative
                      "
                    >
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
                        autoComplete="new-password"
                        value={
                          confirmPassword
                        }
                        onChange={(
                          event
                        ) =>
                          setConfirmPassword(
                            event.target
                              .value
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
                            (prev) =>
                              !prev
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
                )}

                {/* FORGOT PASSWORD */}

                {!isRegister && (
                  <div
                    className="
                      flex
                      justify-start
                    "
                  >
                    <Link
                      href="/auth/forgot-password"
                      className="
                        text-sm
                        font-medium
                        text-(--brick-600)
                        transition
                        hover:text-(--brick-700)
                        hover:underline
                      "
                    >
                      نسيت كلمة المرور؟
                    </Link>
                  </div>
                )}

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
                  disabled={
                    loading ||
                    googleLoading
                  }
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

                      {isRegister
                        ? "جارٍ إنشاء الحساب..."
                        : "جارٍ تسجيل الدخول..."}
                    </>
                  ) : (
                    <>
                      {isRegister
                        ? "إنشاء الحساب"
                        : "تسجيل الدخول"}

                      <ArrowRight
                        size={17}
                        strokeWidth={2}
                      />
                    </>
                  )}
                </button>
              </form>

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
                <p
                  className="
                    text-sm
                    text-(--olive-600)
                  "
                >
                  {isRegister
                    ? "لديك حساب بالفعل؟"
                    : "ليس لديك حساب؟"}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    switchMode(
                      isRegister
                        ? "login"
                        : "register"
                    )
                  }
                  className="
                    mt-2
                    text-sm
                    font-semibold
                    text-(--brick-600)
                    transition
                    hover:text-(--brick-700)
                    hover:underline
                  "
                >
                  {isRegister
                    ? "تسجيل الدخول"
                    : "إنشاء حساب"}
                </button>
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
                  بياناتك محمية ويتم التعامل
                  معها بأمان.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}