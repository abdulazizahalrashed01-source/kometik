"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  LogOut,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Script from "next/script";
import { usePathname, useRouter } from "next/navigation";

import { useCart } from "@/store/useCart";
import { useAuth } from "@/store/useAuth";
import { useWishlist } from "@/store/useWishlist";
import SearchOverlay from "@/components/SearchOverlay";
import MobileMenu from "@/components/MobileMenu";

const mainNav = [
  { number: "01", name: "الرئيسية", href: "/" },
  { number: "02", name: "المتجر", href: "/shop" },
  { number: "03", name: "التصنيفات", href: "/shop/categories" },
  { number: "04", name: "العلامات", href: "/#brands" },
];

type AuthMode = "menu" | "login" | "register";

type ApiResponse = {
  message?: string;
  error?: string;
};

function AuthPanel({
  mode,
  onBack,
  onAuthenticated,
}: {
  mode: "login" | "register";
  onBack: () => void;
  onAuthenticated: () => void;
}) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] =
    useState("");

  const [rememberMe, setRememberMe] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<"error" | "success">("error");

  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const readResponse = async (
    response: Response,
  ): Promise<ApiResponse> => {
    try {
      return (await response.json()) as ApiResponse;
    } catch {
      return {};
    }
  };

  const handleGoogleLogin = useCallback(
    async (credential: string) => {
      if (googleLoading) return;

      setGoogleLoading(true);
      setMessage("");

      try {
        const response = await fetch("/api/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ credential }),
        });

        const data = await readResponse(response);

        if (!response.ok) {
          setMessageType("error");
          setMessage(
            data.message ||
              data.error ||
              "تعذر المتابعة باستخدام Google.",
          );
          return;
        }

        setMessageType("success");
        setMessage("تم تسجيل الدخول باستخدام Google بنجاح.");

        onAuthenticated();
      } catch (error) {
        console.error("GOOGLE AUTH ERROR:", error);

        setMessageType("error");
        setMessage(
          "تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.",
        );
      } finally {
        setGoogleLoading(false);
      }
    },
    [googleLoading, onAuthenticated],
  );

  useEffect(() => {
    if (!googleReady || !googleButtonRef.current) {
      return;
    }

    const google = window.google;
    const button = googleButtonRef.current;

    if (!google) {
      return;
    }

    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setMessageType("error");
      setMessage(
        "مصادقة Google غير مهيأة في إعدادات التطبيق.",
      );
      return;
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response.credential) {
          void handleGoogleLogin(response.credential);
        }
      },
    });

    button.innerHTML = "";

    google.accounts.id.renderButton(button, {
      theme: "outline",
      size: "large",
      width: 300,
      text: "continue_with",
      shape: "rect",
      logo_alignment: "center",
    });
  }, [googleReady, handleGoogleLogin]);

  async function handleLogin(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
          rememberMe,
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        setMessageType("error");
        setMessage(
          data.error ||
            data.message ||
            "تعذر تسجيل الدخول. تأكدي من البريد وكلمة المرور.",
        );
        return;
      }

      onAuthenticated();
    } catch {
      setMessageType("error");
      setMessage(
        "حدث خطأ أثناء الاتصال. حاولي مرة أخرى.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) return;

    if (registerPassword !== registerConfirmPassword) {
      setMessageType("error");
      setMessage("كلمتا المرور غير متطابقتين.");
      return;
    }

    if (!termsAccepted) {
      setMessageType("error");
      setMessage(
        "يجب الموافقة على الشروط وسياسة الخصوصية.",
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: registerName.trim(),
          email: registerEmail.trim(),
          password: registerPassword,
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        setMessageType("error");
        setMessage(
          data.error ||
            data.message ||
            "تعذر إنشاء الحساب. حاولي مرة أخرى.",
        );
        return;
      }

      setMessageType("success");
      setMessage(
        data.message ||
          "تم إنشاء الحساب بنجاح. تحققي من بريدك الإلكتروني.",
      );

      setLoginEmail(registerEmail.trim());
      setLoginPassword("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");
      setTermsAccepted(false);
    } catch {
      setMessageType("error");
      setMessage(
        "حدث خطأ أثناء الاتصال. حاولي مرة أخرى.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGoogleReady(true)}
      />

      <div className="max-h-[min(620px,calc(100vh-90px))] overflow-y-auto px-4 pb-4 pt-3">
        <button
          type="button"
          onClick={onBack}
          className="
            mb-3
            flex
            items-center
            gap-1.5
            text-[11px]
            text-black/45
            transition
            hover:text-[var(--olive-dark)]
          "
        >
          <ArrowRight size={14} strokeWidth={1.7} />
          العودة
        </button>

        <div className="text-center">
          <div className="text-[9px] font-medium tracking-[0.18em] text-[var(--brick)]">
            {mode === "login" ? "WELCOME BACK" : "JOIN KOMETIK"}
          </div>

          <h3 className="mt-1.5 text-lg font-semibold text-[var(--ink)]">
            {mode === "login"
              ? "تسجيل الدخول"
              : "إنشاء حساب جديد"}
          </h3>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-center text-[10px] text-black/38">
            {mode === "register"
              ? "سجّلي مباشرة باستخدام حساب Google"
              : "المتابعة باستخدام Google"}
          </p>

          {googleLoading ? (
            <div
              className="
                flex
                h-10
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-black/[0.06]
                bg-white
                text-[10px]
                text-[var(--olive-dark)]
              "
            >
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/10 border-t-[var(--brick)]" />
              جاري المتابعة باستخدام Google...
            </div>
          ) : (
            <div
              ref={googleButtonRef}
              className="
                flex
                h-10
                w-full
                justify-center
                overflow-hidden
              "
            />
          )}
        </div>

        <div className="my-3 flex items-center gap-3">
          <span className="h-px flex-1 bg-black/[0.06]" />
          <span className="text-[8px] text-black/28">أو</span>
          <span className="h-px flex-1 bg-black/[0.06]" />
        </div>

        {mode === "login" && (
          <form onSubmit={handleLogin}>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-medium">
                البريد الإلكتروني
              </span>

              <input
                type="email"
                required
                autoComplete="email"
                value={loginEmail}
                onChange={(event) =>
                  setLoginEmail(event.target.value)
                }
                placeholder="name@example.com"
                className="
                  h-10
                  w-full
                  rounded-xl
                  border
                  border-black/[0.06]
                  bg-white
                  px-3
                  text-[11px]
                  outline-none
                  transition
                  focus:border-[var(--olive)]/35
                  focus:ring-4
                  focus:ring-[var(--olive)]/10
                "
              />
            </label>

            <label className="mt-3 block">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-medium">
                  كلمة المرور
                </span>

                <Link
                  href="/auth/forgot-password"
                  onClick={onBack}
                  className="
                    text-[9px]
                    text-[var(--olive)]
                    hover:text-[var(--brick-dark)]
                  "
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>

              <input
                type="password"
                required
                autoComplete="current-password"
                value={loginPassword}
                onChange={(event) =>
                  setLoginPassword(event.target.value)
                }
                placeholder="••••••••"
                className="
                  h-10
                  w-full
                  rounded-xl
                  border
                  border-black/[0.06]
                  bg-white
                  px-3
                  text-[11px]
                  outline-none
                  transition
                  focus:border-[var(--olive)]/35
                  focus:ring-4
                  focus:ring-[var(--olive)]/10
                "
              />
            </label>

            <label className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
                className="h-3.5 w-3.5 accent-[var(--olive)]"
              />

              <span className="text-[9px] text-black/48">
                تذكريني
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="
                mt-3
                flex
                h-10
                w-full
                items-center
                justify-between
                rounded-full
                bg-[var(--ink)]
                px-4
                text-[11px]
                font-medium
                text-white
                transition
                hover:bg-[var(--olive-dark)]
                disabled:opacity-60
              "
            >
              <span>
                {loading
                  ? "جاري تسجيل الدخول..."
                  : "تسجيل الدخول"}
              </span>

              <ArrowLeft size={14} strokeWidth={1.7} />
            </button>
          </form>
        )}

        {mode === "register" && (
          <form onSubmit={handleRegister}>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-medium">
                  الاسم
                </span>

                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={registerName}
                  onChange={(event) =>
                    setRegisterName(event.target.value)
                  }
                  placeholder="الاسم"
                  className="
                    h-10
                    w-full
                    rounded-xl
                    border
                    border-black/[0.06]
                    bg-white
                    px-3
                    text-[11px]
                    outline-none
                    transition
                    focus:border-[var(--olive)]/35
                    focus:ring-4
                    focus:ring-[var(--olive)]/10
                  "
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[10px] font-medium">
                  البريد الإلكتروني
                </span>

                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={registerEmail}
                  onChange={(event) =>
                    setRegisterEmail(event.target.value)
                  }
                  placeholder="name@example.com"
                  className="
                    h-10
                    w-full
                    rounded-xl
                    border
                    border-black/[0.06]
                    bg-white
                    px-3
                    text-[11px]
                    outline-none
                    transition
                    focus:border-[var(--olive)]/35
                    focus:ring-4
                    focus:ring-[var(--olive)]/10
                  "
                />
              </label>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className="mb-1.5 block text-[10px] font-medium">
                  كلمة المرور
                </span>

                <input
                  type="password"
                  minLength={8}
                  required
                  autoComplete="new-password"
                  value={registerPassword}
                  onChange={(event) =>
                    setRegisterPassword(event.target.value)
                  }
                  placeholder="8 أحرف"
                  className="
                    h-10
                    w-full
                    rounded-xl
                    border
                    border-black/[0.06]
                    bg-white
                    px-3
                    text-[11px]
                    outline-none
                    transition
                    focus:border-[var(--olive)]/35
                    focus:ring-4
                    focus:ring-[var(--olive)]/10
                  "
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[10px] font-medium">
                  تأكيد كلمة المرور
                </span>

                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={registerConfirmPassword}
                  onChange={(event) =>
                    setRegisterConfirmPassword(event.target.value)
                  }
                  placeholder="أعيديها"
                  className="
                    h-10
                    w-full
                    rounded-xl
                    border
                    border-black/[0.06]
                    bg-white
                    px-3
                    text-[11px]
                    outline-none
                    transition
                    focus:border-[var(--olive)]/35
                    focus:ring-4
                    focus:ring-[var(--olive)]/10
                  "
                />
              </label>
            </div>

            <label className="mt-3 flex items-start gap-2">
              <input
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(event) =>
                  setTermsAccepted(event.target.checked)
                }
                className="mt-0.5 h-3.5 w-3.5 accent-[var(--olive)]"
              />

              <span className="text-[9px] leading-5 text-black/45">
                أوافق على{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="text-[var(--olive-dark)] underline"
                >
                  الشروط
                </Link>{" "}
                و{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="text-[var(--olive-dark)] underline"
                >
                  الخصوصية
                </Link>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="
                mt-3
                flex
                h-10
                w-full
                items-center
                justify-between
                rounded-full
                bg-[var(--ink)]
                px-4
                text-[11px]
                font-medium
                text-white
                transition
                hover:bg-[var(--olive-dark)]
                disabled:opacity-60
              "
            >
              <span>
                {loading
                  ? "جاري إنشاء الحساب..."
                  : "إنشاء الحساب"}
              </span>

              <ArrowLeft size={14} strokeWidth={1.7} />
            </button>
          </form>
        )}

        {message && (
          <div
            role={
              messageType === "error"
                ? "alert"
                : "status"
            }
            className={`
              mt-3
              rounded-xl
              px-3
              py-2
              text-[9px]
              leading-5
              ${
                messageType === "success"
                  ? "bg-[var(--olive)]/10 text-[var(--olive-dark)]"
                  : "bg-[var(--brick)]/10 text-[var(--brick-dark)]"
              }
            `}
          >
            {message}
          </div>
        )}
      </div>
    </>
  );
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [accountOpen, setAccountOpen] = useState(false);
  const [accountMode, setAccountMode] =
    useState<AuthMode>("menu");

  const [cartHoverOpen, setCartHoverOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const setAuth = useAuth((state) => state.setAuth);

  const setStoreAuthChecking = useAuth(
    (state) => state.setAuthChecking,
  );

  const setPendingWishlistProductId = useAuth(
    (state) => state.setPendingWishlistProductId,
  );

  const clearPendingWishlistProductId = useAuth(
    (state) => state.clearPendingWishlistProductId,
  );

  const cartItems = useCart((state) => state.items);
  const wishlistItems = useWishlist(
    (state) => state.items,
  );

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const wishlistCount = wishlistItems.length;

  const cartTotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0,
  );

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    let ticking = false;

    const updateHeader = () => {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 65);
        ticking = false;
      });
    };

    updateHeader();

    window.addEventListener("scroll", updateHeader, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", updateHeader);
    };
  }, []);

  useEffect(() => {
    setAccountOpen(false);
    setAccountMode("menu");
    setCartHoverOpen(false);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      setAuthChecking(true);
      setStoreAuthChecking(true);

      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!cancelled) {
          const loggedIn = response.ok;

          setIsLoggedIn(loggedIn);
          setAuth(loggedIn);
        }
      } catch {
        if (!cancelled) {
          setIsLoggedIn(false);
          setAuth(false);
        }
      } finally {
        if (!cancelled) {
          setAuthChecking(false);
          setStoreAuthChecking(false);
        }
      }
    }

    void checkAuth();

    return () => {
      cancelled = true;
    };
  }, [pathname, setAuth, setStoreAuthChecking]);

  useEffect(() => {
    function handleOpenAccount(event: Event) {
      const customEvent =
        event as CustomEvent<{
          wishlistProductId?: string;
        }>;

      const productId =
        customEvent.detail?.wishlistProductId;

      if (productId) {
        setPendingWishlistProductId(productId);
      }

      setSearchOpen(false);
      setMobileMenuOpen(false);
      setCartHoverOpen(false);

      setAccountMode("menu");
      setAccountOpen(true);
    }

    window.addEventListener(
      "kometik:open-account",
      handleOpenAccount,
    );

    return () => {
      window.removeEventListener(
        "kometik:open-account",
        handleOpenAccount,
      );
    };
  }, [setPendingWishlistProductId]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();

        setSearchOpen(true);
        setMobileMenuOpen(false);
        setCartHoverOpen(false);
        setAccountOpen(false);
        setAccountMode("menu");

        return;
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        setMobileMenuOpen(false);
        setCartHoverOpen(false);
        setAccountOpen(false);
        setAccountMode("menu");
      }
    };

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboard,
      );
    };
  }, []);

  useEffect(() => {
    const locked =
      searchOpen ||
      mobileMenuOpen ||
      (accountOpen &&
        typeof window !== "undefined" &&
        window.innerWidth < 1024);

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = locked
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    searchOpen,
    mobileMenuOpen,
    accountOpen,
  ]);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (!response.ok) return;

      setIsLoggedIn(false);
      setAuth(false);

      clearPendingWishlistProductId();
      useWishlist.getState().clearWishlist();

      setMobileMenuOpen(false);
      setAccountOpen(false);
      setAccountMode("menu");
      setCartHoverOpen(false);

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    } finally {
      setLoggingOut(false);
    }
  }

  function handleAccountClick() {
    if (authChecking) return;

    setSearchOpen(false);
    setMobileMenuOpen(false);
    setCartHoverOpen(false);

    setAccountOpen((current) => !current);
    setAccountMode("menu");
  }

  function openAuthMode(
    mode: "login" | "register",
  ) {
    setAccountOpen(true);
    setAccountMode(mode);
    setSearchOpen(false);
    setMobileMenuOpen(false);
    setCartHoverOpen(false);
  }

  function handleAuthenticated() {
    setIsLoggedIn(true);
    setAuth(true);

    setAccountMode("menu");
    setAccountOpen(true);

    const productId =
      useAuth.getState().pendingWishlistProductId;

    if (productId) {
      window.dispatchEvent(
        new CustomEvent(
          "kometik:wishlist-authenticated",
          {
            detail: {
              productId,
            },
          },
        ),
      );

      clearPendingWishlistProductId();
    }

    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    if (href === "/#brands") {
      return false;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  const openSearch = () => {
    setSearchOpen(true);
    setMobileMenuOpen(false);
    setCartHoverOpen(false);
    setAccountOpen(false);
    setAccountMode("menu");
  };

  const openWishlist = () => {
    setAccountOpen(false);
    setAccountMode("menu");
    setCartHoverOpen(false);
    setMobileMenuOpen(false);
    router.push("/wishlist");
  };

  const accountContent = (
    <>
      {accountMode === "menu" ? (
        <>
          <div className="border-b border-black/[0.06] px-5 py-4">
            <div className="text-[10px] font-medium tracking-[0.16em] text-[var(--brick)]">
              KOMETIK
            </div>

            <div className="mt-1 text-base font-semibold text-[var(--ink)]">
              حسابك
            </div>
          </div>

          {authChecking ? (
            <div className="px-6 py-9 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--olive)]/20 border-t-[var(--olive)]" />

              <p className="mt-3 text-xs text-black/40">
                جارٍ التحقق...
              </p>
            </div>
          ) : !isLoggedIn ? (
            <div className="px-4 py-4">
              <div className="rounded-[18px] bg-[var(--olive)]/[0.07] px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--olive)] text-white">
                    <UserRound
                      size={17}
                      strokeWidth={1.6}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[var(--ink)]">
                      أهلاً بك في Kometik
                    </p>

                    <p className="mt-1 text-xs leading-6 text-black/45">
                      سجّلي الدخول للوصول إلى حسابك وطلباتك وعناوينك.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={() =>
                    openAuthMode("login")
                  }
                  className="
                    flex
                    min-h-11
                    w-full
                    items-center
                    justify-center
                    rounded-full
                    bg-[var(--ink)]
                    px-5
                    text-sm
                    font-medium
                    text-white
                    transition
                    duration-300
                    hover:bg-[var(--olive-dark)]
                  "
                >
                  تسجيل الدخول
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openAuthMode("register")
                  }
                  className="
                    flex
                    min-h-11
                    w-full
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-black/[0.08]
                    bg-white/60
                    px-5
                    text-sm
                    font-medium
                    text-[var(--ink)]
                    transition
                    duration-300
                    hover:border-[var(--olive)]/30
                    hover:bg-white
                  "
                >
                  إنشاء حساب جديد
                </button>
              </div>

              <div className="mt-4 text-center text-[10px] leading-5 text-black/35">
                ويمكنك أيضاً المتابعة باستخدام Google.
              </div>
            </div>
          ) : (
            <div className="px-4 py-4">
              <div className="rounded-[18px] bg-[var(--olive)]/[0.07] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--olive)] text-white">
                    <UserRound
                      size={19}
                      strokeWidth={1.6}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[var(--ink)]">
                      مرحباً بك
                    </p>

                    <p className="mt-0.5 text-xs text-black/45">
                      إدارة حسابك وطلباتك
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(false);
                    router.push("/account");
                  }}
                  className="
                    flex
                    min-h-11
                    w-full
                    items-center
                    justify-between
                    rounded-[15px]
                    px-4
                    text-sm
                    text-[var(--ink)]
                    transition
                    hover:bg-[var(--olive)]/[0.07]
                  "
                >
                  <span>حسابي</span>

                  <UserRound
                    size={16}
                    strokeWidth={1.6}
                    className="text-black/35"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(false);
                    router.push("/account/orders");
                  }}
                  className="
                    flex
                    min-h-11
                    w-full
                    items-center
                    justify-between
                    rounded-[15px]
                    px-4
                    text-sm
                    text-[var(--ink)]
                    transition
                    hover:bg-[var(--olive)]/[0.07]
                  "
                >
                  <span>طلباتي</span>

                  <ShoppingBag
                    size={16}
                    strokeWidth={1.6}
                    className="text-black/35"
                  />
                </button>

                <button
                  type="button"
                  onClick={openWishlist}
                  className="
                    flex
                    min-h-11
                    w-full
                    items-center
                    justify-between
                    rounded-[15px]
                    px-4
                    text-sm
                    text-[var(--ink)]
                    transition
                    hover:bg-[var(--olive)]/[0.07]
                  "
                >
                  <span>المفضلة</span>

                  <div className="flex items-center gap-2">
                    {wishlistCount > 0 && (
                      <span className="text-[10px] text-black/35">
                        {wishlistCount}
                      </span>
                    )}

                    <Heart
                      size={16}
                      strokeWidth={1.6}
                      className="text-black/35"
                    />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="
                    mt-1
                    flex
                    min-h-11
                    w-full
                    items-center
                    justify-between
                    rounded-[15px]
                    px-4
                    text-sm
                    text-[var(--brick)]
                    transition
                    hover:bg-[var(--brick)]/[0.06]
                    disabled:opacity-50
                  "
                >
                  <span>
                    {loggingOut
                      ? "جارٍ تسجيل الخروج..."
                      : "تسجيل الخروج"}
                  </span>

                  <LogOut
                    size={16}
                    strokeWidth={1.6}
                  />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <AuthPanel
          mode={accountMode}
          onBack={() => setAccountMode("menu")}
          onAuthenticated={handleAuthenticated}
        />
      )}
    </>
  );

  return (
    <>
      <header
        dir="rtl"
        className={`
          ${
            scrolled
              ? "fixed"
              : "relative"
          }
          left-0
          right-0
          top-0
          z-[100]
          w-full
          px-3
          sm:px-5
          transition-all
          duration-500
          ${
            scrolled
              ? "pt-2"
              : "pt-3 sm:pt-4"
          }
        `}
      >
        <div
          className={`
            mx-auto
            max-w-[1180px]
            transition-all
            duration-500
            ${
              scrolled
                ? `
                  rounded-[24px]
                  border
                  border-black/[0.07]
                  bg-white/90
                  px-3
                  py-2.5
                  shadow-[0_18px_55px_rgba(23,23,23,0.09)]
                  backdrop-blur-[22px]
                  sm:rounded-[28px]
                  sm:px-6
                  sm:py-3
                `
                : `
                  px-0
                  py-0
                  sm:px-2
                  sm:py-1
                `
            }
          `}
        >
          {/* ======================================================
              DESKTOP HEADER
          ======================================================= */}

          <div
            className="
              hidden
              min-h-[92px]
              items-center
              lg:grid
              lg:grid-cols-3
              lg:gap-6
            "
          >
            {/* RIGHT */}

            <div
              className="
                flex
                min-w-0
                items-center
                justify-start
                gap-1.5
              "
            >
              <div
                className="relative"
                onMouseEnter={() => {
                  setAccountOpen(true);
                  setCartHoverOpen(false);
                }}
                onMouseLeave={() => {
                  if (accountMode === "menu") {
                    setAccountOpen(false);
                  }
                }}
              >
                <button
                  type="button"
                  onClick={handleAccountClick}
                  disabled={authChecking}
                  aria-label="الحساب"
                  aria-expanded={accountOpen}
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    text-black/65
                    transition
                    duration-250
                    hover:-translate-y-0.5
                    hover:bg-[var(--olive)]/10
                    hover:text-[var(--olive-dark)]
                    active:scale-95
                    disabled:cursor-wait
                    disabled:opacity-50
                  "
                >
                  <UserRound
                    size={18}
                    strokeWidth={1.7}
                  />
                </button>

                <div
                  className={`
                    absolute
                    right-0
                    top-full
                    z-[300]
                    w-[360px]
                    pt-3
                    transition-all
                    duration-250
                    ${
                      accountOpen
                        ? "pointer-events-auto translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-2 opacity-0"
                    }
                  `}
                >
                  <div
                    dir="rtl"
                    className="
                      overflow-hidden
                      rounded-[24px]
                      border
                      border-black/[0.07]
                      bg-[var(--cream)]
                      shadow-[0_25px_80px_rgba(23,23,23,0.14)]
                      backdrop-blur-xl
                    "
                  >
                    {accountContent}
                  </div>
                </div>
              </div>

              {/* Wishlist */}

              <button
                type="button"
                onClick={openWishlist}
                aria-label={
                  wishlistCount > 0
                    ? `المفضلة، ${wishlistCount} منتجات`
                    : "المفضلة"
                }
                className="
                  relative
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  text-black/65
                  transition
                  duration-250
                  hover:-translate-y-0.5
                  hover:bg-[var(--brick)]/10
                  hover:text-[var(--brick)]
                  active:scale-95
                "
              >
                <Heart
                  size={18}
                  strokeWidth={1.7}
                />

                {wishlistCount > 0 && (
                  <span
                    className="
                      absolute
                      -right-0.5
                      -top-0.5
                      flex
                      h-[17px]
                      min-w-[17px]
                      items-center
                      justify-center
                      rounded-full
                      bg-[var(--brick)]
                      px-1
                      text-[8px]
                      font-bold
                      leading-none
                      text-white
                    "
                  >
                    {wishlistCount > 99
                      ? "99+"
                      : wishlistCount}
                  </span>
                )}
              </button>

              {/* Search */}

              <button
                type="button"
                onClick={openSearch}
                aria-label="البحث"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  text-black/65
                  transition
                  duration-250
                  hover:-translate-y-0.5
                  hover:bg-[var(--olive)]/10
                  hover:text-[var(--olive-dark)]
                  active:scale-95
                "
              >
                <Search
                  size={18}
                  strokeWidth={1.7}
                />
              </button>

              <div className="ms-2 hidden xl:block">
                <div className="text-[8px] tracking-[0.2em] text-black/25">
                  CURATED
                </div>

                <div className="mt-0.5 text-[10px] text-black/45">
                  BEAUTY / CARE
                </div>
              </div>
            </div>

            {/* CENTER */}

            <div
              className="
                flex
                min-w-0
                flex-col
                items-center
                justify-center
                self-stretch
                py-1
              "
            >
              <Link
                href="/"
                aria-label="Kometik"
                className="
                  group
                  flex
                  items-center
                  justify-center
                "
              >
                <span
                  aria-hidden="true"
                  className={`
                    me-3
                    w-[3px]
                    rounded-full
                    bg-[var(--brick)]
                    transition-all
                    duration-500
                    ${
                      scrolled
                        ? "h-[28px]"
                        : "h-[36px]"
                    }
                  `}
                />

                <span className="leading-none text-center">
                  <span
                    className={`
                      block
                      font-semibold
                      tracking-[-0.05em]
                      text-[var(--ink)]
                      transition-all
                      duration-500
                      ${
                        scrolled
                          ? "text-[24px]"
                          : "text-[28px]"
                      }
                    `}
                  >
                    Kom
                    <span className="text-[var(--olive)]">
                      etik
                    </span>
                  </span>

                  <span
                    className="
                      mt-1
                      block
                      text-[7px]
                      font-medium
                      tracking-[0.28em]
                      text-black/35
                    "
                  >
                    BEAUTY / CARE
                  </span>
                </span>
              </Link>

              <div
                className="
                  my-2.5
                  h-px
                  w-[72px]
                  bg-black/[0.08]
                "
              />

              <nav
                aria-label="التنقل الرئيسي"
                className="
                  flex
                  items-center
                  justify-center
                  gap-5
                  xl:gap-7
                "
              >
                {mainNav.map((item) => {
                  const active = isActive(
                    item.href,
                  );

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="
                        group
                        flex
                        items-center
                        gap-1.5
                        py-1
                      "
                    >
                      <span
                        className={`
                          kometik-editorial
                          text-[9px]
                          transition
                          duration-250
                          ${
                            active
                              ? "text-[var(--brick)]"
                              : "text-black/25 group-hover:text-[var(--brick)]"
                          }
                        `}
                      >
                        {item.number}
                      </span>

                      <span
                        className={`
                          whitespace-nowrap
                          text-[12px]
                          transition
                          duration-250
                          group-hover:-translate-y-0.5
                          ${
                            active
                              ? "text-[var(--olive-dark)]"
                              : "text-black/55"
                          }
                        `}
                      >
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* LEFT */}

            <div
              className="
                flex
                min-w-0
                items-center
                justify-end
                gap-2
              "
            >
              <div
                className="relative"
                onMouseEnter={() => {
                  setCartHoverOpen(true);
                  setAccountOpen(false);
                  setAccountMode("menu");
                }}
                onMouseLeave={() => {
                  setCartHoverOpen(false);
                }}
              >
                <Link
                  href="/cart"
                  aria-label={
                    cartCount > 0
                      ? `السلة، ${cartCount} منتجات`
                      : "السلة"
                  }
                  className="
                    relative
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-[var(--olive)]
                    text-black
                    transition
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-[var(--olive-dark)]
                    active:scale-95
                  "
                >
                  <ShoppingBag
                    size={17}
                    strokeWidth={1.7}
                  />

                  {hydrated && cartCount > 0 && (
                    <span
                      className="
                        absolute
                        -right-0.5
                        -top-0.5
                        flex
                        h-[18px]
                        min-w-[18px]
                        items-center
                        justify-center
                        rounded-full
                        bg-[var(--brick)]
                        px-1
                        text-[9px]
                        font-bold
                        leading-none
                      "
                    >
                      {cartCount > 99
                        ? "99+"
                        : cartCount}
                    </span>
                  )}
                </Link>

                <div
                  className={`
                    absolute
                    left-0
                    top-full
                    z-[120]
                    w-[350px]
                    pt-3
                    transition-all
                    duration-250
                    ${
                      cartHoverOpen
                        ? "pointer-events-auto translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-2 opacity-0"
                    }
                  `}
                >
                  <div
                    dir="rtl"
                    className="
                      overflow-hidden
                      rounded-[24px]
                      border
                      border-black/[0.07]
                      bg-[var(--cream)]
                      shadow-[0_25px_80px_rgba(23,23,23,0.14)]
                      backdrop-blur-xl
                    "
                  >
                    <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
                      <div>
                        <div className="text-[10px] font-medium tracking-[0.16em] text-[var(--brick)]">
                          KOMETIK
                        </div>

                        <div className="mt-1 text-base font-semibold text-[var(--ink)]">
                          سلة التسوق
                        </div>
                      </div>

                      <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-[var(--olive)]/10 px-2 text-xs font-medium text-[var(--olive-dark)]">
                        {cartCount}
                      </span>
                    </div>

                    {hydrated &&
                      cartItems.length === 0 && (
                        <div className="px-6 py-10 text-center">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--olive)]/10 text-[var(--olive-dark)]">
                            <ShoppingBag
                              size={21}
                              strokeWidth={1.5}
                            />
                          </div>

                          <p className="mt-4 text-sm font-medium text-[var(--ink)]">
                            السلة فارغة حاليًا
                          </p>

                          <p className="mt-1 text-xs leading-6 text-black/45">
                            اكتشفي منتجاتك المفضلة وأضيفيها إلى سلتك.
                          </p>
                        </div>
                      )}

                    {hydrated &&
                      cartItems.length > 0 && (
                        <>
                          <div className="max-h-[300px] overflow-y-auto px-4 py-3">
                            {cartItems.map((item) => (
                              <div
                                key={item.id}
                                className="
                                  flex
                                  items-center
                                  gap-3
                                  border-b
                                  border-black/[0.05]
                                  py-3
                                  last:border-b-0
                                "
                              >
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[16px] bg-white">
                                  {item.imageUrl ? (
                                    <Image
                                      src={item.imageUrl}
                                      alt={item.name}
                                      fill
                                      sizes="64px"
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-black/20">
                                      <ShoppingBag
                                        size={18}
                                        strokeWidth={1.4}
                                      />
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm font-medium text-[var(--ink)]">
                                    {item.name}
                                  </div>

                                  <div className="mt-1 text-xs text-black/45">
                                    الكمية: {item.quantity}
                                  </div>

                                  <div className="mt-1 text-sm font-semibold text-[var(--olive-dark)]">
                                    {(
                                      Number(item.price) *
                                      item.quantity
                                    ).toFixed(2)}{" "}
                                    €
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-black/[0.06] px-5 py-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-black/45">
                                المجموع
                              </span>

                              <span className="text-lg font-semibold text-[var(--ink)]">
                                {cartTotal.toFixed(2)} €
                              </span>
                            </div>

                            <Link
                              href="/cart"
                              onClick={() =>
                                setCartHoverOpen(false)
                              }
                              className="
                                mt-4
                                flex
                                min-h-11
                                w-full
                                items-center
                                justify-center
                                rounded-full
                                bg-[var(--ink)]
                                px-5
                                text-sm
                                font-medium
                                text-white
                                transition
                                duration-300
                                hover:bg-[var(--olive-dark)]
                              "
                            >
                              عرض السلة
                            </Link>
                          </div>
                        </>
                      )}
                  </div>
                </div>
              </div>

              <div className="me-2 hidden text-end xl:block">
                <div className="text-[8px] tracking-[0.2em] text-black/25">
                  EDITORIAL
                </div>

                <div className="mt-0.5 text-[10px] text-black/45">
                  MODERN BEAUTY
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================
              MOBILE / TABLET HEADER
          ======================================================= */}

          <div className="lg:hidden">
            <div
              className={`
                relative
                flex
                min-h-[48px]
                items-center
                justify-between
                gap-2
                ${
                  scrolled
                    ? "px-0"
                    : "px-0"
                }
              `}
            >
              {/* RIGHT SIDE */}

              <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                <button
                  type="button"
                  onClick={openSearch}
                  aria-label="البحث"
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    text-black/65
                    transition
                    hover:bg-[var(--olive)]/10
                    hover:text-[var(--olive-dark)]
                    active:scale-95
                  "
                >
                  <Search
                    size={18}
                    strokeWidth={1.7}
                  />
                </button>

                <button
                  type="button"
                  onClick={handleAccountClick}
                  disabled={authChecking}
                  aria-label="الحساب"
                  aria-expanded={accountOpen}
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    text-black/65
                    transition
                    hover:bg-[var(--olive)]/10
                    hover:text-[var(--olive-dark)]
                    active:scale-95
                    disabled:opacity-50
                  "
                >
                  <UserRound
                    size={18}
                    strokeWidth={1.7}
                  />
                </button>
              </div>

              {/* CENTER LOGO */}

              <Link
                href="/"
                aria-label="Kometik"
                className="
                  absolute
                  left-1/2
                  top-1/2
                  flex
                  -translate-x-1/2
                  -translate-y-1/2
                  flex-col
                  items-center
                  justify-center
                  whitespace-nowrap
                "
              >
                <span
                  className={`
                    font-semibold
                    tracking-[-0.05em]
                    text-[var(--ink)]
                    transition-all
                    duration-500
                    ${
                      scrolled
                        ? "text-[21px]"
                        : "text-[24px]"
                    }
                  `}
                >
                  Kom
                  <span className="text-[var(--olive)]">
                    etik
                  </span>
                </span>

                <span className="mt-0.5 text-[5.5px] font-medium tracking-[0.25em] text-black/35">
                  BEAUTY / CARE
                </span>
              </Link>

              {/* LEFT SIDE */}

              <div className="ms-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
                <button
                  type="button"
                  onClick={openWishlist}
                  aria-label={
                    wishlistCount > 0
                      ? `المفضلة، ${wishlistCount} منتجات`
                      : "المفضلة"
                  }
                  className="
                    relative
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    text-black/65
                    transition
                    hover:bg-[var(--brick)]/10
                    hover:text-[var(--brick)]
                    active:scale-95
                  "
                >
                  <Heart
                    size={18}
                    strokeWidth={1.7}
                  />

                  {wishlistCount > 0 && (
                    <span
                      className="
                        absolute
                        -right-0.5
                        -top-0.5
                        flex
                        h-[17px]
                        min-w-[17px]
                        items-center
                        justify-center
                        rounded-full
                        bg-[var(--brick)]
                        px-1
                        text-[8px]
                        font-bold
                        leading-none
                        text-white
                      "
                    >
                      {wishlistCount > 99
                        ? "99+"
                        : wishlistCount}
                    </span>
                  )}
                </button>

                <Link
                  href="/cart"
                  aria-label={
                    cartCount > 0
                      ? `السلة، ${cartCount} منتجات`
                      : "السلة"
                  }
                  className="
                    relative
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-[var(--olive)]
                    text-black
                    transition
                    hover:bg-[var(--olive-dark)]
                    active:scale-95
                  "
                >
                  <ShoppingBag
                    size={17}
                    strokeWidth={1.7}
                  />

                  {hydrated && cartCount > 0 && (
                    <span
                      className="
                        absolute
                        -right-0.5
                        -top-0.5
                        flex
                        h-[18px]
                        min-w-[18px]
                        items-center
                        justify-center
                        rounded-full
                        bg-[var(--brick)]
                        px-1
                        text-[9px]
                        font-bold
                        leading-none
                      "
                    >
                      {cartCount > 99
                        ? "99+"
                        : cartCount}
                    </span>
                  )}
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setCartHoverOpen(false);
                    setAccountOpen(false);
                    setAccountMode("menu");
                    setMobileMenuOpen(true);
                  }}
                  aria-label="فتح القائمة"
                  aria-expanded={mobileMenuOpen}
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-[var(--olive)]
                    text-white
                    transition
                    hover:bg-[var(--olive-dark)]
                    active:scale-95
                  "
                >
                  <Menu
                    size={19}
                    strokeWidth={1.7}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ==========================================================
          MOBILE ACCOUNT OVERLAY
      =========================================================== */}

      <div
        className={`
          fixed
          inset-0
          z-[220]
          lg:hidden
          ${
            accountOpen
              ? "pointer-events-auto"
              : "pointer-events-none"
          }
        `}
      >
        <button
          type="button"
          aria-label="إغلاق الحساب"
          onClick={() => {
            setAccountOpen(false);
            setAccountMode("menu");
          }}
          className={`
            absolute
            inset-0
            bg-black/20
            backdrop-blur-[3px]
            transition-opacity
            duration-300
            ${
              accountOpen
                ? "opacity-100"
                : "opacity-0"
            }
          `}
        />

        <div
          className={`
            absolute
            inset-x-3
            top-[68px]
            mx-auto
            max-h-[calc(100vh-82px)]
            max-w-[520px]
            overflow-hidden
            rounded-[24px]
            border
            border-black/[0.07]
            bg-[var(--cream)]
            shadow-[0_25px_90px_rgba(23,23,23,0.18)]
            transition-all
            duration-300
            sm:inset-x-5
            sm:top-[78px]
            ${
              accountOpen
                ? "translate-y-0 opacity-100"
                : "-translate-y-3 opacity-0"
            }
          `}
        >
          <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">
            <div>
              <div className="text-[8px] font-medium tracking-[0.18em] text-[var(--brick)]">
                KOMETIK
              </div>

              <div className="mt-0.5 text-sm font-semibold text-[var(--ink)]">
                حسابك
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setAccountOpen(false);
                setAccountMode("menu");
              }}
              aria-label="إغلاق"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-black/45
                transition
                hover:bg-black/[0.05]
                hover:text-black/70
              "
            >
              <X
                size={17}
                strokeWidth={1.7}
              />
            </button>
          </div>

          <div className="max-h-[calc(100vh-140px)] overflow-y-auto">
            {accountContent}
          </div>
        </div>
      </div>

      <MobileMenu
        open={mobileMenuOpen}
        onClose={() =>
          setMobileMenuOpen(false)
        }
        isLoggedIn={isLoggedIn}
        authChecking={authChecking}
        loggingOut={loggingOut}
        onLogout={handleLogout}
        navigation={mainNav}
      />

      <SearchOverlay
        open={searchOpen}
        onClose={() =>
          setSearchOpen(false)
        }
      />
    </>
  );
}