"use client";

import Link from "next/link";
import Script from "next/script";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  initialMode?: "login" | "register";
};

type ApiResponse = {
  message?: string;
  error?: string;
};

export default function AuthModal({
  open,
  onClose,
  onAuthenticated,
  initialMode = "login",
}: AuthModalProps) {
  const [mode, setMode] =
    useState<"login" | "register">(
      initialMode
    );

  const [loginEmail, setLoginEmail] =
    useState("");

  const [loginPassword, setLoginPassword] =
    useState("");

  const [registerName, setRegisterName] =
    useState("");

  const [registerEmail, setRegisterEmail] =
    useState("");

  const [registerPassword, setRegisterPassword] =
    useState("");

  const [
    registerConfirmPassword,
    setRegisterConfirmPassword,
  ] = useState("");

  const [showLoginPassword, setShowLoginPassword] =
    useState(false);

  const [
    showRegisterPassword,
    setShowRegisterPassword,
  ] = useState(false);

  const [
    showRegisterConfirmPassword,
    setShowRegisterConfirmPassword,
  ] = useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [termsAccepted, setTermsAccepted] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [googleScriptReady, setGoogleScriptReady] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState<"error" | "success">("error");

  const googleButtonRef =
    useRef<HTMLDivElement | null>(null);

  /* =====================================================
     BODY + ESCAPE
  ====================================================== */

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [open, onClose]);

  /* =====================================================
     RESET MESSAGE
  ====================================================== */

  useEffect(() => {
    if (!open) {
      return;
    }

    setMode(initialMode);
    setMessage("");
    setLoading(false);
    setGoogleLoading(false);
  }, [open, initialMode]);

  /* =====================================================
     GOOGLE
  ====================================================== */

  async function handleGoogleLogin(
    credential: string
  ) {
    if (googleLoading) {
      return;
    }

    setMessage("");
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
            body: JSON.stringify({
              credential,
            }),
          }
        );

      const data =
        await response.json() as ApiResponse;

      if (!response.ok) {
        setMessageType("error");

        setMessage(
          data.message ||
            data.error ||
            "تعذر تسجيل الدخول باستخدام Google."
        );

        return;
      }

      setMessageType("success");

      setMessage(
        "تم تسجيل الدخول باستخدام Google بنجاح."
      );

      onAuthenticated();
    } catch (error) {
      console.error(
        "GOOGLE AUTH ERROR:",
        error
      );

      setMessageType("error");

      setMessage(
        "تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  function initializeGoogle() {
    const google =
      window.google;

    const button =
      googleButtonRef.current;

    if (
      !google ||
      !button ||
      !open
    ) {
      return;
    }

    const clientId =
      process.env
        .NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setMessageType("error");

      setMessage(
        "مصادقة Google غير مهيأة في إعدادات التطبيق."
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
          void handleGoogleLogin(
            response.credential
          );
        }
      },
    });

    button.innerHTML = "";

    google.accounts.id.renderButton(
      button,
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

  useEffect(() => {
    if (
      !open ||
      !googleScriptReady
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          initializeGoogle();
        },
        50
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    open,
    mode,
    googleScriptReady,
  ]);

  /* =====================================================
     MODE
  ====================================================== */

  function switchMode(
    nextMode:
      | "login"
      | "register"
  ) {
    setMode(nextMode);
    setMessage("");
    setGoogleLoading(false);
  }

  /* =====================================================
     RESPONSE
  ====================================================== */

  async function readResponse(
    response: Response
  ): Promise<ApiResponse> {
    try {
      return (
        await response.json()
      ) as ApiResponse;
    } catch {
      return {};
    }
  }

  /* =====================================================
     LOGIN
  ====================================================== */

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response =
        await fetch(
          "/api/auth/login",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              email:
                loginEmail.trim(),
              password:
                loginPassword,
              rememberMe,
            }),
          }
        );

      const data =
        await readResponse(
          response
        );

      if (!response.ok) {
        setMessageType("error");

        setMessage(
          data.error ||
            data.message ||
            "تعذر تسجيل الدخول. تأكدي من البريد وكلمة المرور."
        );

        return;
      }

      setMessageType("success");

      setMessage(
        data.message ||
          "تم تسجيل الدخول بنجاح."
      );

      onAuthenticated();
    } catch {
      setMessageType("error");

      setMessage(
        "حدث خطأ أثناء الاتصال. حاولي مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     REGISTER
  ====================================================== */

  async function handleRegister(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (
      registerPassword !==
      registerConfirmPassword
    ) {
      setMessageType("error");

      setMessage(
        "كلمتا المرور غير متطابقتين."
      );

      return;
    }

    if (!termsAccepted) {
      setMessageType("error");

      setMessage(
        "يجب الموافقة على شروط الاستخدام وسياسة الخصوصية."
      );

      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response =
        await fetch(
          "/api/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              name:
                registerName.trim(),
              email:
                registerEmail.trim(),
              password:
                registerPassword,
            }),
          }
        );

      const data =
        await readResponse(
          response
        );

      if (!response.ok) {
        setMessageType("error");

        setMessage(
          data.error ||
            data.message ||
            "تعذر إنشاء الحساب. حاولي مرة أخرى."
        );

        return;
      }

      setMessageType("success");

      setMessage(
        data.message ||
          "تم إنشاء الحساب بنجاح. تحققي من بريدك الإلكتروني."
      );

      setMode("login");

      setLoginEmail(
        registerEmail.trim()
      );

      setLoginPassword("");

      setRegisterPassword("");
      setRegisterConfirmPassword("");
      setTermsAccepted(false);
    } catch {
      setMessageType("error");

      setMessage(
        "حدث خطأ أثناء الاتصال. حاولي مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     CLOSED
  ====================================================== */

  if (!open) {
    return null;
  }

  /* =====================================================
     UI
  ====================================================== */

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          setGoogleScriptReady(true);
        }}
      />

      <div
        dir="rtl"
        className="
          fixed
          inset-0
          z-[125]
          bg-black/25
          px-3
          py-3
          backdrop-blur-[6px]
          sm:px-5
          sm:py-6
        "
        onMouseDown={(
          event
        ) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            onClose();
          }
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="kometik-auth-title"
          className="
            absolute
            left-1/2
            top-1/2
            w-[calc(100%-24px)]
            max-w-[470px]
            -translate-x-1/2
            -translate-y-1/2
            overflow-hidden
            rounded-[30px]
            border
            border-black/[0.05]
            bg-[var(--cream)]
            shadow-[0_35px_110px_rgba(23,23,23,0.18)]
            animate-[searchDiscoveryIn_400ms_cubic-bezier(.22,1,.36,1)]
            sm:w-[calc(100%-40px)]
            sm:rounded-[32px]
          "
          onMouseDown={(
            event
          ) => {
            event.stopPropagation();
          }}
        >
          {/* CLOSE */}

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="
              absolute
              left-4
              top-4
              z-20
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-white
              text-black/45
              transition
              duration-200
              hover:bg-[var(--olive)]
              hover:text-white
            "
          >
            <X
              size={17}
              strokeWidth={1.7}
            />
          </button>

          <div
            className="
              max-h-[calc(100vh-24px)]
              overflow-y-auto
              px-6
              py-7
              sm:px-9
              sm:py-9
            "
          >
            {/* BRAND */}

            <div className="mb-7 text-center">
              <div className="inline-flex items-center gap-3">
                <span className="h-9 w-[3px] rounded-full bg-[var(--brick)]" />

                <span
                  className="
                    text-2xl
                    font-semibold
                    tracking-[-0.04em]
                  "
                >
                  Kometik
                </span>
              </div>

              <div
                className="
                  mt-2
                  text-[9px]
                  tracking-[0.22em]
                  text-black/35
                "
              >
                BEAUTY / CARE
              </div>
            </div>

            {/* TITLE */}

            <div className="text-center">
              <p
                className="
                  mb-3
                  text-[10px]
                  font-medium
                  tracking-[0.18em]
                  text-[var(--brick)]
                "
              >
                {mode === "login"
                  ? "WELCOME"
                  : "JOIN KOMETIK"}
              </p>

              <h2
                id="kometik-auth-title"
                className="
                  text-2xl
                  font-semibold
                  tracking-[-0.03em]
                  text-[var(--ink)]
                  sm:text-3xl
                "
              >
                {mode === "login"
                  ? "أهلًا بك في Kometik"
                  : "انضمي إلى Kometik"}
              </h2>

              <p
                className="
                  mx-auto
                  mt-3
                  max-w-[360px]
                  text-sm
                  leading-7
                  text-black/45
                "
              >
                {mode === "login"
                  ? "سجلي الدخول للوصول إلى حسابك ومتابعة طلباتك."
                  : "أنشئي حسابك واحفظي روتينك وطلباتك في مكان واحد."}
              </p>
            </div>

            {/* TABS */}

            <div
              className="
                mt-7
                grid
                grid-cols-2
                gap-1
                rounded-full
                border
                border-black/[0.05]
                bg-white
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
                  min-h-11
                  rounded-full
                  text-xs
                  font-medium
                  transition
                  duration-300
                  ${
                    mode ===
                    "login"
                      ? "bg-[var(--olive)] text-white shadow-[0_7px_18px_rgba(102,112,90,0.20)]"
                      : "text-black/45 hover:text-[var(--olive-dark)]"
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
                  min-h-11
                  rounded-full
                  text-xs
                  font-medium
                  transition
                  duration-300
                  ${
                    mode ===
                    "register"
                      ? "bg-[var(--olive)] text-white shadow-[0_7px_18px_rgba(102,112,90,0.20)]"
                      : "text-black/45 hover:text-[var(--olive-dark)]"
                  }
                `}
              >
                إنشاء حساب
              </button>
            </div>

            {/* GOOGLE */}

            <div className="mt-6">
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
                      border-[var(--olive-200)]
                      bg-white
                      text-xs
                      text-[var(--olive-dark)]
                    "
                  >
                    <span
                      className="
                        h-4
                        w-4
                        animate-spin
                        rounded-full
                        border-2
                        border-[var(--olive-200)]
                        border-t-[var(--brick)]
                      "
                    />

                    جاري المتابعة باستخدام Google...
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
                      overflow-hidden
                    "
                  />
                )}
              </div>
            </div>

            {/* DIVIDER */}

            <div
              className="
                my-5
                flex
                items-center
                gap-3
              "
            >
              <span className="h-px flex-1 bg-black/[0.06]" />

              <span className="text-[9px] text-black/30">
                أو
              </span>

              <span className="h-px flex-1 bg-black/[0.06]" />
            </div>

            {/* LOGIN */}

            {mode === "login" && (
              <form
                onSubmit={
                  handleLogin
                }
                className="mt-2"
              >
                <label className="block">
                  <span className="mb-2 block text-xs font-medium">
                    البريد الإلكتروني
                  </span>

                  <div className="relative">
                    <Mail
                      size={17}
                      strokeWidth={1.6}
                      className="
                        pointer-events-none
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-black/25
                      "
                    />

                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={
                        loginEmail
                      }
                      onChange={(
                        event
                      ) =>
                        setLoginEmail(
                          event.target.value
                        )
                      }
                      placeholder="name@example.com"
                      className="
                        h-[52px]
                        w-full
                        rounded-2xl
                        border
                        border-black/[0.06]
                        bg-white
                        px-11
                        text-sm
                        outline-none
                        transition
                        focus:border-[var(--olive)]/35
                        focus:ring-4
                        focus:ring-[var(--olive)]/10
                      "
                    />
                  </div>
                </label>

                <label className="mt-5 block">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium">
                      كلمة المرور
                    </span>

                    <Link
                      href="/auth/forgot-password"
                      onClick={
                        onClose
                      }
                      className="
                        text-[10px]
                        text-[var(--olive)]
                        transition
                        hover:text-[var(--brick-dark)]
                      "
                    >
                      نسيت كلمة المرور؟
                    </Link>
                  </div>

                  <div className="relative">
                    <LockKeyhole
                      size={17}
                      strokeWidth={1.6}
                      className="
                        pointer-events-none
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-black/25
                      "
                    />

                    <input
                      name="password"
                      type={
                        showLoginPassword
                          ? "text"
                          : "password"
                      }
                      required
                      autoComplete="current-password"
                      value={
                        loginPassword
                      }
                      onChange={(
                        event
                      ) =>
                        setLoginPassword(
                          event.target.value
                        )
                      }
                      placeholder="••••••••"
                      className="
                        h-[52px]
                        w-full
                        rounded-2xl
                        border
                        border-black/[0.06]
                        bg-white
                        px-11
                        pl-12
                        text-sm
                        outline-none
                        transition
                        focus:border-[var(--olive)]/35
                        focus:ring-4
                        focus:ring-[var(--olive)]/10
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowLoginPassword(
                          (current) =>
                            !current
                        )
                      }
                      aria-label={
                        showLoginPassword
                          ? "إخفاء كلمة المرور"
                          : "إظهار كلمة المرور"
                      }
                      className="
                        absolute
                        left-2
                        top-1/2
                        flex
                        h-9
                        w-9
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-full
                        text-black/30
                        transition
                        hover:bg-[var(--olive)]/10
                        hover:text-[var(--olive-dark)]
                      "
                    >
                      {showLoginPassword ? (
                        <EyeOff
                          size={17}
                          strokeWidth={1.6}
                        />
                      ) : (
                        <Eye
                          size={17}
                          strokeWidth={1.6}
                        />
                      )}
                    </button>
                  </div>
                </label>

                <label className="mt-5 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      rememberMe
                    }
                    onChange={(
                      event
                    ) =>
                      setRememberMe(
                        event.target
                          .checked
                      )
                    }
                    className="h-4 w-4 accent-[var(--olive)]"
                  />

                  <span className="text-xs text-black/50">
                    تذكريني
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    mt-6
                    flex
                    h-[54px]
                    w-full
                    items-center
                    justify-between
                    rounded-full
                    bg-[var(--ink)]
                    px-6
                    text-sm
                    font-medium
                    text-white
                    transition
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-[var(--olive-dark)]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <span>
                    {loading
                      ? "جاري تسجيل الدخول..."
                      : "تسجيل الدخول"}
                  </span>

                  <ArrowLeft
                    size={16}
                    strokeWidth={1.7}
                  />
                </button>
              </form>
            )}

            {/* REGISTER */}

            {mode ===
              "register" && (
              <form
                onSubmit={
                  handleRegister
                }
                className="mt-2"
              >
                <label className="block">
                  <span className="mb-2 block text-xs font-medium">
                    الاسم
                  </span>

                  <div className="relative">
                    <UserRound
                      size={17}
                      strokeWidth={1.6}
                      className="
                        pointer-events-none
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-black/25
                      "
                    />

                    <input
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={
                        registerName
                      }
                      onChange={(
                        event
                      ) =>
                        setRegisterName(
                          event.target.value
                        )
                      }
                      placeholder="الاسم الكامل"
                      className="
                        h-[52px]
                        w-full
                        rounded-2xl
                        border
                        border-black/[0.06]
                        bg-white
                        px-11
                        text-sm
                        outline-none
                        transition
                        focus:border-[var(--olive)]/35
                        focus:ring-4
                        focus:ring-[var(--olive)]/10
                      "
                    />
                  </div>
                </label>

                <label className="mt-5 block">
                  <span className="mb-2 block text-xs font-medium">
                    البريد الإلكتروني
                  </span>

                  <div className="relative">
                    <Mail
                      size={17}
                      strokeWidth={1.6}
                      className="
                        pointer-events-none
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-black/25
                      "
                    />

                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={
                        registerEmail
                      }
                      onChange={(
                        event
                      ) =>
                        setRegisterEmail(
                          event.target.value
                        )
                      }
                      placeholder="name@example.com"
                      className="
                        h-[52px]
                        w-full
                        rounded-2xl
                        border
                        border-black/[0.06]
                        bg-white
                        px-11
                        text-sm
                        outline-none
                        transition
                        focus:border-[var(--olive)]/35
                        focus:ring-4
                        focus:ring-[var(--olive)]/10
                      "
                    />
                  </div>
                </label>

                <label className="mt-5 block">
                  <span className="mb-2 block text-xs font-medium">
                    كلمة المرور
                  </span>

                  <div className="relative">
                    <LockKeyhole
                      size={17}
                      strokeWidth={1.6}
                      className="
                        pointer-events-none
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-black/25
                      "
                    />

                    <input
                      name="password"
                      type={
                        showRegisterPassword
                          ? "text"
                          : "password"
                      }
                      minLength={8}
                      required
                      autoComplete="new-password"
                      value={
                        registerPassword
                      }
                      onChange={(
                        event
                      ) =>
                        setRegisterPassword(
                          event.target.value
                        )
                      }
                      placeholder="8 أحرف على الأقل"
                      className="
                        h-[52px]
                        w-full
                        rounded-2xl
                        border
                        border-black/[0.06]
                        bg-white
                        px-11
                        pl-12
                        text-sm
                        outline-none
                        transition
                        focus:border-[var(--olive)]/35
                        focus:ring-4
                        focus:ring-[var(--olive)]/10
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowRegisterPassword(
                          (current) =>
                            !current
                        )
                      }
                      aria-label={
                        showRegisterPassword
                          ? "إخفاء كلمة المرور"
                          : "إظهار كلمة المرور"
                      }
                      className="
                        absolute
                        left-2
                        top-1/2
                        flex
                        h-9
                        w-9
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-full
                        text-black/30
                        transition
                        hover:bg-[var(--olive)]/10
                        hover:text-[var(--olive-dark)]
                      "
                    >
                      {showRegisterPassword ? (
                        <EyeOff
                          size={17}
                          strokeWidth={1.6}
                        />
                      ) : (
                        <Eye
                          size={17}
                          strokeWidth={1.6}
                        />
                      )}
                    </button>
                  </div>
                </label>

                <label className="mt-5 block">
                  <span className="mb-2 block text-xs font-medium">
                    تأكيد كلمة المرور
                  </span>

                  <div className="relative">
                    <ShieldCheck
                      size={17}
                      strokeWidth={1.6}
                      className="
                        pointer-events-none
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-black/25
                      "
                    />

                    <input
                      name="confirmPassword"
                      type={
                        showRegisterConfirmPassword
                          ? "text"
                          : "password"
                      }
                      required
                      autoComplete="new-password"
                      value={
                        registerConfirmPassword
                      }
                      onChange={(
                        event
                      ) =>
                        setRegisterConfirmPassword(
                          event.target.value
                        )
                      }
                      placeholder="أعيدي كتابة كلمة المرور"
                      className="
                        h-[52px]
                        w-full
                        rounded-2xl
                        border
                        border-black/[0.06]
                        bg-white
                        px-11
                        pl-12
                        text-sm
                        outline-none
                        transition
                        focus:border-[var(--olive)]/35
                        focus:ring-4
                        focus:ring-[var(--olive)]/10
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowRegisterConfirmPassword(
                          (current) =>
                            !current
                        )
                      }
                      aria-label={
                        showRegisterConfirmPassword
                          ? "إخفاء كلمة المرور"
                          : "إظهار كلمة المرور"
                      }
                      className="
                        absolute
                        left-2
                        top-1/2
                        flex
                        h-9
                        w-9
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-full
                        text-black/30
                        transition
                        hover:bg-[var(--olive)]/10
                        hover:text-[var(--olive-dark)]
                      "
                    >
                      {showRegisterConfirmPassword ? (
                        <EyeOff
                          size={17}
                          strokeWidth={1.6}
                        />
                      ) : (
                        <Eye
                          size={17}
                          strokeWidth={1.6}
                        />
                      )}
                    </button>
                  </div>
                </label>

                <label className="mt-5 flex items-start gap-2">
                  <input
                    type="checkbox"
                    required
                    checked={
                      termsAccepted
                    }
                    onChange={(
                      event
                    ) =>
                      setTermsAccepted(
                        event.target
                          .checked
                      )
                    }
                    className="mt-1 h-4 w-4 accent-[var(--olive)]"
                  />

                  <span className="text-xs leading-6 text-black/50">
                    أوافق على{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="text-[var(--olive-dark)] underline underline-offset-2"
                    >
                      شروط الاستخدام
                    </Link>{" "}
                    و{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="text-[var(--olive-dark)] underline underline-offset-2"
                    >
                      سياسة الخصوصية
                    </Link>
                    .
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    mt-6
                    flex
                    h-[54px]
                    w-full
                    items-center
                    justify-between
                    rounded-full
                    bg-[var(--ink)]
                    px-6
                    text-sm
                    font-medium
                    text-white
                    transition
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-[var(--olive-dark)]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <span>
                    {loading
                      ? "جاري إنشاء الحساب..."
                      : "إنشاء الحساب"}
                  </span>

                  <ArrowLeft
                    size={16}
                    strokeWidth={1.7}
                  />
                </button>
              </form>
            )}

            {/* MESSAGE */}

            {message && (
              <div
                role={
                  messageType ===
                  "error"
                    ? "alert"
                    : "status"
                }
                className={`
                  mt-4
                  rounded-2xl
                  px-4
                  py-3
                  text-xs
                  leading-6
                  ${
                    messageType ===
                    "success"
                      ? "bg-[var(--olive)]/10 text-[var(--olive-dark)]"
                      : "bg-[var(--brick)]/10 text-[var(--brick-dark)]"
                  }
                `}
              >
                {message}
              </div>
            )}

            <div
              className="
                mt-7
                border-t
                border-black/[0.05]
                pt-5
                text-center
              "
            >
              <span className="text-[10px] text-black/30">
                حساب واحد لكل عالم Kometik.
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

