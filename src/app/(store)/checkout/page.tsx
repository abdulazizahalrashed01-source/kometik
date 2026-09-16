"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Check,
  Lock,
  ShoppingBag,
} from "lucide-react";

import { useCart } from "@/store/useCart";
import CloudinaryProductImage from "@/components/CloudinaryProductImage";

// ==========================================
// CHECKOUT PAGE
// ==========================================

export default function CheckoutPage() {
  const router = useRouter();

  // ==========================================
  // CART
  // ==========================================

  const items = useCart(
    (state) => state.items
  );

  const clearCart = useCart(
    (state) => state.clearCart
  );

  const getSubtotal = useCart(
    (state) => state.getSubtotal
  );

  // ==========================================
  // STATE
  // ==========================================

  const [mounted, setMounted] =
    useState(false);

  const [authChecking, setAuthChecking] =
    useState(true);

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================
  // FORM
  // ==========================================

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  // ==========================================
  // MOUNT
  // ==========================================

  useEffect(() => {
    setMounted(true);
  }, []);

  // ==========================================
  // AUTH CHECK
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const response =
          await fetch(
            "/api/auth/me",
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }
          );

        if (!cancelled) {
          setIsLoggedIn(
            response.ok
          );
        }
      } catch {
        if (!cancelled) {
          setIsLoggedIn(false);
        }
      } finally {
        if (!cancelled) {
          setAuthChecking(false);
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================
  // FORM CHANGE
  // ==========================================

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // ==========================================
  // SUBMIT ORDER
  // ==========================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    // ========================================
    // LOGIN REQUIRED
    // ========================================

    if (!isLoggedIn) {
      router.push(
        "/auth?redirect=/checkout"
      );

      return;
    }

    // ========================================
    // EMPTY CART
    // ========================================

    if (items.length === 0) {
      setError(
        "سلة المشتريات فارغة."
      );

      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/orders",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials: "include",

            body: JSON.stringify({
              customer: {
                name:
                  form.name.trim(),

                email:
                  form.email
                    .trim()
                    .toLowerCase(),

                phone:
                  form.phone.trim(),

                address:
                  form.address.trim(),

                city:
                  form.city.trim(),

                postalCode:
                  form.postalCode.trim(),
              },

              items:
                items.map(
                  (item) => ({
                    productId:
                      item.id,

                    quantity:
                      item.quantity,
                  })
                ),
            }),
          }
        );

      const data =
        await response.json();

      // ======================================
      // AUTH ERROR
      // ======================================

      if (
        response.status === 401
      ) {
        setIsLoggedIn(false);

        router.push(
          "/auth?redirect=/checkout"
        );

        return;
      }

      // ======================================
      // API ERROR
      // ======================================

      if (!response.ok) {
        setError(
          data.message ||
            "تعذر إنشاء الطلب. يرجى المحاولة مرة أخرى."
        );

        return;
      }

      // ======================================
      // ORDER CREATED
      // ======================================

      const orderId =
        data.order?.id;

      if (!orderId) {
        setError(
          "تم إنشاء الطلب، ولكن لم يتم إرجاع رقم الطلب."
        );

        return;
      }

      // ======================================
      // CLEAR CART
      // ======================================

      clearCart();

      // ======================================
      // SUCCESS PAGE
      // ======================================

      router.replace(
        `/checkout/success?orderId=${encodeURIComponent(
          orderId
        )}`
      );
    } catch (error) {
      console.error(
        "CHECKOUT ERROR:",
        error
      );

      setError(
        "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // HYDRATION
  // ==========================================

  if (!mounted || authChecking) {
    return (
      <main
        dir="rtl"
        className="
          min-h-screen
          bg-(--background)
          text-(--foreground)
        "
      >
        <div
          className="
            mx-auto
            max-w-7xl
            px-4
            py-20
            sm:px-6
            lg:px-8
          "
        >
          <div
            className="
              rounded-3xl
              border
              border-(--olive-200)
              bg-white
              p-8
              text-center
              shadow-[var(--shadow-soft)]
            "
          >
            <div
              className="
                mx-auto
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-(--olive-100)
              "
            >
              <span
                className="
                  h-5
                  w-5
                  animate-spin
                  rounded-full
                  border-2
                  border-(--olive-300)
                  border-t-(--brick-600)
                "
              />
            </div>

            <p
              className="
                mt-4
                text-sm
                text-(--olive-600)
              "
            >
              جارٍ تحميل صفحة إتمام الطلب...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // EMPTY CART
  // ==========================================

  if (items.length === 0) {
    return (
      <main
        dir="rtl"
        className="
          min-h-screen
          bg-(--background)
          text-(--foreground)
        "
      >
        <div
          className="
            mx-auto
            flex
            min-h-[72vh]
            max-w-2xl
            flex-col
            items-center
            justify-center
            px-4
            py-16
            text-center
            sm:px-6
          "
        >
          <div
            className="
              flex
              h-24
              w-24
              items-center
              justify-center
              rounded-full
              bg-(--olive-100)
              text-(--brick-600)
            "
          >
            <ShoppingBag
              size={38}
              strokeWidth={1.5}
            />
          </div>

          <p
            className="
              mt-7
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
            سلة المشتريات فارغة
          </h1>

          <p
            className="
              mt-4
              max-w-md
              leading-7
              text-(--olive-600)
            "
          >
            أضف بعض المنتجات إلى السلة قبل
            المتابعة إلى إتمام الطلب.
          </p>

          <Link
            href="/shop"
            className="
              mt-8
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-(--brick-600)
              px-7
              py-3.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-(--brick-700)
            "
          >
            متابعة التسوق

            <ArrowRight
              size={17}
              strokeWidth={2}
            />
          </Link>
        </div>
      </main>
    );
  }

  // ==========================================
  // TOTALS
  // ==========================================

  const subtotal =
    getSubtotal();

  const shipping =
    subtotal >= 50
      ? 0
      : 5.99;

  const total =
    subtotal + shipping;

  const remainingForFreeShipping =
    Math.max(
      0,
      50 - subtotal
    );

  const shippingProgress =
    Math.min(
      100,
      (subtotal / 50) * 100
    );

  // ==========================================
  // UI
  // ==========================================

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-(--background)
        text-(--foreground)
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
          px-4
          py-8
          sm:px-6
          lg:px-8
          lg:py-12
        "
      >
        {/* ====================================
            BACK
        ==================================== */}

        <button
          type="button"
          onClick={() =>
            router.back()
          }
          className="
            mb-7
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
            active:scale-[0.98]
          "
        >
          <ArrowRight
            size={16}
            strokeWidth={2}
          />

          العودة للخلف
        </button>

        {/* ====================================
            TITLE
        ==================================== */}

        <div className="mb-10">
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
            إتمام الطلب
          </h1>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-(--olive-600)
            "
          >
            أكمل معلوماتك لإتمام طلبك.
          </p>
        </div>

        {/* ====================================
            LOGIN NOTICE
        ==================================== */}

        {!isLoggedIn && (
          <div
            className="
              mb-8
              flex
              flex-col
              gap-4
              rounded-2xl
              border
              border-(--brick-200)
              bg-(--brick-50)
              p-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <Lock
                  size={17}
                  className="text-(--brick-600)"
                  strokeWidth={2}
                />

                <p
                  className="
                    font-semibold
                    text-(--olive-900)
                  "
                >
                  تسجيل الدخول مطلوب لإتمام الطلب
                </p>
              </div>

              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-(--olive-700)
                "
              >
                يمكنك مراجعة سلتك الآن، ولكن
                يجب تسجيل الدخول قبل تأكيد الطلب.
              </p>
            </div>

            <Link
              href="/auth?redirect=/checkout"
              className="
                shrink-0
                rounded-xl
                bg-(--brick-600)
                px-6
                py-3
                text-center
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-(--brick-700)
              "
            >
              تسجيل الدخول
            </Link>
          </div>
        )}

        {/* ====================================
            MAIN GRID
        ==================================== */}

        <div
          className="
            grid
            gap-8
            lg:grid-cols-[1fr_400px]
          "
        >
          {/* ==================================
              FORM
          ================================== */}

          <form
            onSubmit={
              handleSubmit
            }
            className="
              rounded-[1.75rem]
              border
              border-(--olive-200)
              bg-white
              p-6
              shadow-[var(--shadow-soft)]
              sm:p-8
            "
          >
            {/* FORM HEADER */}

            <div>
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.15em]
                  text-(--brick-500)
                "
              >
                بيانات العميل
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-(--olive-900)
                "
              >
                معلومات التواصل
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-(--olive-600)
                "
              >
                أدخل معلوماتك لتجهيز طلبك.
              </p>
            </div>

            <div
              className="
                mt-7
                grid
                gap-5
                sm:grid-cols-2
              "
            >
              {/* NAME */}

              <div className="sm:col-span-2">
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
                  الاسم الكامل
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={
                    handleChange
                  }
                  placeholder="أدخل اسمك الكامل"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-(--olive-300)
                    bg-(--olive-50)
                    px-4
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
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={
                    handleChange
                  }
                  placeholder="example@email.com"
                  dir="ltr"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-(--olive-300)
                    bg-(--olive-50)
                    px-4
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

              {/* PHONE */}

              <div>
                <label
                  htmlFor="phone"
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-(--olive-900)
                  "
                >
                  رقم الهاتف
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={form.phone}
                  onChange={
                    handleChange
                  }
                  placeholder="+49 123 456789"
                  dir="ltr"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-(--olive-300)
                    bg-(--olive-50)
                    px-4
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

            {/* ==================================
                SHIPPING ADDRESS
            ================================== */}

            <div
              className="
                mt-10
                border-t
                border-(--olive-200)
                pt-8
              "
            >
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.15em]
                  text-(--brick-500)
                "
              >
                الشحن
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-(--olive-900)
                "
              >
                عنوان الشحن
              </h2>

              <div className="mt-6 kometik-space-y-5">
                {/* ADDRESS */}

                <div>
                  <label
                    htmlFor="address"
                    className="
                      mb-2
                      block
                      text-sm
                      font-medium
                      text-(--olive-900)
                    "
                  >
                    العنوان
                  </label>

                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    autoComplete="street-address"
                    value={
                      form.address
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="اسم الشارع ورقم المنزل"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-(--olive-300)
                      bg-(--olive-50)
                      px-4
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

                <div
                  className="
                    grid
                    gap-5
                    sm:grid-cols-2
                  "
                >
                  {/* CITY */}

                  <div>
                    <label
                      htmlFor="city"
                      className="
                        mb-2
                        block
                        text-sm
                        font-medium
                        text-(--olive-900)
                      "
                    >
                      المدينة
                    </label>

                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      autoComplete="address-level2"
                      value={
                        form.city
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="المدينة"
                      className="
                        w-full
                        rounded-xl
                        border
                        border-(--olive-300)
                        bg-(--olive-50)
                        px-4
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

                  {/* POSTAL CODE */}

                  <div>
                    <label
                      htmlFor="postalCode"
                      className="
                        mb-2
                        block
                        text-sm
                        font-medium
                        text-(--olive-900)
                      "
                    >
                      الرمز البريدي
                    </label>

                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      required
                      autoComplete="postal-code"
                      value={
                        form.postalCode
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="الرمز البريدي"
                      dir="ltr"
                      className="
                        w-full
                        rounded-xl
                        border
                        border-(--olive-300)
                        bg-(--olive-50)
                        px-4
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
              </div>
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
                SUBMIT
            ================================== */}

            <button
              type="submit"
              disabled={loading}
              className="
                mt-8
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-(--brick-600)
                px-6
                py-4
                text-sm
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

                  جارٍ تنفيذ الطلب...
                </>
              ) : (
                <>
                  <Check
                    size={17}
                    strokeWidth={2.2}
                  />

                  تأكيد الطلب · $
                  {total.toFixed(2)}
                </>
              )}
            </button>

            {!isLoggedIn && (
              <p
                className="
                  mt-3
                  text-center
                  text-xs
                  text-(--olive-500)
                "
              >
                يجب تسجيل الدخول قبل تأكيد الطلب.
              </p>
            )}
          </form>

          {/* ==================================
              ORDER SUMMARY
          ================================== */}

          <aside
            className="
              h-fit
              rounded-[1.75rem]
              border
              border-(--olive-200)
              bg-white
              p-6
              shadow-[var(--shadow-soft)]
              lg:sticky
              lg:top-24
            "
          >
            {/* TITLE */}

            <div>
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.15em]
                  text-(--brick-500)
                "
              >
                طلبك
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-(--olive-900)
                "
              >
                ملخص الطلب
              </h2>
            </div>

            {/* ITEMS */}

            <div
              className="
                mt-6
                kometik-space-y-4
              "
            >
              {items.map(
                (item) => (
                  <div
                    key={item.id}
                    className="
                      flex
                      gap-3
                    "
                  >
                    {/* IMAGE */}

                    <div
                      className="
                        relative
                        h-20
                        w-20
                        shrink-0
                        overflow-hidden
                        rounded-xl
                        bg-(--olive-100)
                        ring-1
                        ring-(--olive-200)
                      "
                    >
                      {item.imagePublicId ||
                      item.imageUrl ? (
                        <CloudinaryProductImage
                          imagePublicId={
                            item.imagePublicId
                          }
                          imageUrl={
                            item.imageUrl
                          }
                          alt={
                            item.name
                          }
                          fill
                          sizes="80px"
                          className="
                            object-contain
                            p-2
                          "
                        />
                      ) : (
                        <div
                          className="
                            flex
                            h-full
                            items-center
                            justify-center
                            text-xs
                            text-(--olive-500)
                          "
                        >
                          لا توجد صورة
                        </div>
                      )}
                    </div>

                    {/* INFO */}

                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <p
                        className="
                          line-clamp-2
                          text-sm
                          font-semibold
                          leading-5
                          text-(--olive-900)
                        "
                      >
                        {item.name}
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          text-(--olive-600)
                        "
                      >
                        الكمية:{" "}
                        {item.quantity}
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-bold
                          text-(--brick-600)
                        "
                        dir="ltr"
                      >
                        $
                        {(
                          item.price *
                          item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* DIVIDER */}

            <div
              className="
                my-6
                border-t
                border-(--olive-200)
              "
            />

            {/* SUBTOTAL */}

            <div
              className="
                flex
                items-center
                justify-between
                text-sm
              "
            >
              <span className="text-(--olive-600)">
                المجموع الفرعي
              </span>

              <span
                className="
                  font-semibold
                  text-(--olive-900)
                "
                dir="ltr"
              >
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {/* SHIPPING */}

            <div
              className="
                mt-4
                flex
                items-center
                justify-between
                text-sm
              "
            >
              <span className="text-(--olive-600)">
                الشحن
              </span>

              <span
                className={`
                  font-semibold
                  ${
                    shipping === 0
                      ? "text-(--brick-600)"
                      : "text-(--olive-900)"
                  }
                `}
                dir="ltr"
              >
                {shipping === 0
                  ? "مجاني"
                  : `$${shipping.toFixed(
                      2
                    )}`}
              </span>
            </div>

            {/* FREE SHIPPING PROGRESS */}

            {shipping > 0 && (
              <div
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-(--brick-200)
                  bg-(--brick-50)
                  p-4
                "
              >
                <p
                  className="
                    text-sm
                    leading-6
                    text-(--brick-800)
                  "
                >
                  أضف{" "}
                  <span
                    className="font-bold"
                    dir="ltr"
                  >
                    $
                    {remainingForFreeShipping.toFixed(
                      2
                    )}
                  </span>{" "}
                  للحصول على شحن مجاني.
                </p>

                <div
                  className="
                    mt-3
                    h-1.5
                    overflow-hidden
                    rounded-full
                    bg-(--brick-200)
                  "
                >
                  <div
                    className="
                      h-full
                      rounded-full
                      bg-(--brick-600)
                      transition-all
                      duration-500
                    "
                    style={{
                      width: `${shippingProgress}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {shipping === 0 && (
              <div
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-(--brick-200)
                  bg-(--brick-50)
                  p-4
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    font-medium
                    text-(--brick-700)
                  "
                >
                  <Check
                    size={16}
                    strokeWidth={2}
                  />

                  حصلت على الشحن المجاني
                </div>
              </div>
            )}

            {/* TOTAL */}

            <div
              className="
                mt-6
                border-t
                border-(--olive-200)
                pt-6
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <span
                  className="
                    text-lg
                    font-bold
                    text-(--olive-900)
                  "
                >
                  الإجمالي
                </span>

                <span
                  className="
                    text-2xl
                    font-bold
                    text-(--brick-600)
                  "
                  dir="ltr"
                >
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* SECURITY */}

            <div
              className="
                mt-6
                rounded-2xl
                bg-(--olive-50)
                p-4
                text-center
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
                  size={16}
                  className="text-(--brick-600)"
                  strokeWidth={2}
                />

                <p
                  className="
                    text-sm
                    font-semibold
                    text-(--olive-900)
                  "
                >
                  الدفع الآمن
                </p>
              </div>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-(--olive-600)
                "
              >
                يتم التعامل مع معلوماتك بأمان
                وسرية.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

