"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardList,
  CreditCard,
  MapPin,
  Package,
  Phone,
  Mail,
} from "lucide-react";

// ==========================================
// TYPES
// ==========================================

type OrderItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  subtotal: number;
  shipping: number;
  total: number;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

// ==========================================
// ORDER DETAILS PAGE
// ==========================================

export default function OrderDetailsPage() {
  const params = useParams();

  const orderId =
    typeof params.id === "string"
      ? params.id
      : "";

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // LOAD ORDER
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      if (!orderId) {
        setError(
          "رقم الطلب غير صالح."
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `/api/orders/${encodeURIComponent(
              orderId
            )}`,
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
              "تعذر تحميل الطلب."
          );
        }

        if (!cancelled) {
          setOrder(
            data.order
          );
        }
      } catch (error) {
        console.error(
          "LOAD ORDER ERROR:",
          error
        );

        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "تعذر تحميل الطلب."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // ==========================================
  // STATUS LABEL
  // ==========================================

  function getStatusLabel(
    status: Order["status"]
  ) {
    switch (status) {
      case "PENDING":
        return "قيد الانتظار";

      case "CONFIRMED":
        return "تم التأكيد";

      case "PROCESSING":
        return "قيد التجهيز";

      case "SHIPPED":
        return "تم الشحن";

      case "DELIVERED":
        return "تم التسليم";

      case "CANCELLED":
        return "ملغى";

      default:
        return status;
    }
  }

  // ==========================================
  // STATUS STYLE
  // ==========================================

  function getStatusClass(
    status: Order["status"]
  ) {
    switch (status) {
      case "PENDING":
        return "bg-(--olive-100) text-(--olive-700) ring-(--olive-200)";

      case "CONFIRMED":
        return "bg-(--brick-50) text-(--brick-700) ring-(--brick-200)";

      case "PROCESSING":
        return "bg-(--brick-100) text-(--brick-800) ring-(--brick-200)";

      case "SHIPPED":
        return "bg-(--olive-100) text-(--olive-800) ring-(--olive-300)";

      case "DELIVERED":
        return "bg-(--brick-50) text-(--brick-700) ring-(--brick-200)";

      case "CANCELLED":
        return "bg-red-50 text-red-700 ring-red-200";

      default:
        return "bg-(--olive-100) text-(--olive-700) ring-(--olive-200)";
    }
  }

  // ==========================================
  // FORMAT DATE
  // ==========================================

  function formatDate(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleDateString(
      "ar",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  }

  // ==========================================
  // FORMAT DATE + TIME
  // ==========================================

  function formatDateTime(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleString(
      "ar",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

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
        <div className="mx-auto max-w-5xl">
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

            <div
              className="
                animate-pulse
                kometik-space-y-6
                p-6
                sm:p-8
              "
            >
              <div
                className="
                  h-7
                  w-40
                  rounded
                  bg-(--olive-200)
                "
              />

              <div
                className="
                  h-4
                  w-64
                  rounded
                  bg-(--olive-100)
                "
              />

              <div
                className="
                  h-48
                  rounded-2xl
                  bg-(--olive-100)
                "
              />

              <div
                className="
                  grid
                  gap-5
                  lg:grid-cols-2
                "
              >
                <div
                  className="
                    h-64
                    rounded-2xl
                    bg-(--olive-100)
                  "
                />

                <div
                  className="
                    h-64
                    rounded-2xl
                    bg-(--olive-100)
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
  // ERROR / NOT FOUND
  // ==========================================

  if (error || !order) {
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
        "
      >
        <div
          className="
            mx-auto
            flex
            min-h-[70vh]
            max-w-2xl
            items-center
            justify-center
            text-center
          "
        >
          <div
            className="
              w-full
              rounded-[2rem]
              border
              border-(--olive-200)
              bg-white
              p-8
              shadow-[var(--shadow-soft)]
              sm:p-10
            "
          >
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-(--brick-50)
                text-(--brick-600)
              "
            >
              <Package
                size={30}
                strokeWidth={1.6}
              />
            </div>

            <p
              className="
                mt-6
                text-xs
                font-semibold
                uppercase
                tracking-[0.2em]
                text-(--brick-500)
              "
            >
              Kometik
            </p>

            <h1
              className="
                mt-2
                text-2xl
                font-bold
                text-(--olive-900)
                sm:text-3xl
              "
            >
              لم يتم العثور على الطلب
            </h1>

            <p
              className="
                mx-auto
                mt-3
                max-w-md
                text-sm
                leading-7
                text-(--olive-600)
              "
            >
              {error ||
                "تعذر العثور على هذا الطلب."}
            </p>

            <Link
              href="/account/orders"
              className="
                mt-7
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-(--brick-600)
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-(--brick-700)
              "
            >
              <ArrowRight
                size={16}
                strokeWidth={2}
              />

              العودة إلى طلباتي
            </Link>
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
      <div className="mx-auto max-w-5xl">

        {/* ====================================
            BACK
        ==================================== */}

        <Link
          href="/account/orders"
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

          العودة إلى طلباتي
        </Link>

        {/* ====================================
            HEADER
        ==================================== */}

        <div
          className="
            mb-7
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

          <div
            className="
              flex
              flex-col
              gap-5
              p-6
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:p-7
            "
          >
            <div className="min-w-0">
              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-(--brick-50)
                    text-(--brick-600)
                  "
                >
                  <ClipboardList
                    size={21}
                    strokeWidth={1.8}
                  />
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      text-xs
                      font-semibold
                      text-(--brick-500)
                    "
                  >
                    رقم الطلب
                  </p>

                  <h1
                    dir="ltr"
                    className="
                      mt-1
                      break-all
                      font-mono
                      text-base
                      font-bold
                      text-(--olive-900)
                      sm:text-lg
                    "
                  >
                    {order.id}
                  </h1>
                </div>
              </div>

              <div
                className="
                  mt-4
                  flex
                  flex-wrap
                  gap-x-5
                  gap-y-2
                  text-xs
                  text-(--olive-500)
                "
              >
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                  "
                >
                  <CalendarDays
                    size={14}
                    strokeWidth={1.8}
                  />

                  {formatDate(
                    order.createdAt
                  )}
                </span>

                <span>
                  آخر تحديث:{" "}
                  {formatDateTime(
                    order.updatedAt
                  )}
                </span>
              </div>
            </div>

            {/* STATUS */}

            <span
              className={`
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-full
                px-4
                py-2.5
                text-sm
                font-semibold
                ring-1
                ring-inset
                ${getStatusClass(
                  order.status
                )}
              `}
            >
              {order.status ===
                "DELIVERED" && (
                <Check
                  size={15}
                  strokeWidth={2}
                />
              )}

              {getStatusLabel(
                order.status
              )}
            </span>
          </div>
        </div>

        {/* ====================================
            MAIN GRID
        ==================================== */}

        <div
          className="
            grid
            gap-6
            lg:grid-cols-[1fr_340px]
          "
        >
          {/* ==================================
              ITEMS
          ================================== */}

          <section
            className="
              overflow-hidden
              rounded-[1.75rem]
              border
              border-(--olive-200)
              bg-white
              shadow-[var(--shadow-soft)]
            "
          >
            {/* SECTION HEADER */}

            <div
              className="
                border-b
                border-(--olive-200)
                px-6
                py-5
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
                محتويات الطلب
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-(--olive-900)
                "
              >
                المنتجات
              </h2>
            </div>

            {/* ITEMS */}

            <div className="kometik-divide-y kometik-separator-gray">
              {order.items.map(
                (item) => (
                  <div
                    key={item.id}
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                      p-5
                      sm:p-6
                    "
                  >
                    {/* PRODUCT */}

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
                          leading-6
                          text-(--olive-900)
                        "
                      >
                        {item.name}
                      </p>

                      <p
                        className="
                          mt-1.5
                          text-xs
                          text-(--olive-600)
                        "
                        dir="ltr"
                      >
                        ${item.price.toFixed(
                          2
                        )}{" "}
                        ×{" "}
                        {item.quantity}
                      </p>
                    </div>

                    {/* TOTAL */}

                    <div className="shrink-0 text-left">
                      <p
                        className="
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
          </section>

          {/* ==================================
              SIDEBAR
          ================================== */}

          <div className="kometik-space-y-6">

            {/* ==================================
                SUMMARY
            ================================== */}

            <section
              className="
                rounded-[1.75rem]
                border
                border-(--olive-200)
                bg-white
                p-6
                shadow-[var(--shadow-soft)]
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <CreditCard
                  size={18}
                  className="text-(--brick-600)"
                  strokeWidth={1.8}
                />

                <h2
                  className="
                    text-lg
                    font-bold
                    text-(--olive-900)
                  "
                >
                  ملخص الطلب
                </h2>
              </div>

              <div
                className="
                  mt-5
                  kometik-space-y-3
                  text-sm
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
                  <span className="text-(--olive-600)">
                    المجموع الفرعي
                  </span>

                  <span
                    className="font-medium text-(--olive-900)"
                    dir="ltr"
                  >
                    ${order.subtotal.toFixed(2)}
                  </span>
                </div>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
                  <span className="text-(--olive-600)">
                    الشحن
                  </span>

                  <span
                    className={`
                      font-medium
                      ${
                        order.shipping === 0
                          ? "text-(--brick-600)"
                          : "text-(--olive-900)"
                      }
                    `}
                    dir={
                      order.shipping ===
                      0
                        ? "rtl"
                        : "ltr"
                    }
                  >
                    {order.shipping ===
                    0
                      ? "مجاني"
                      : `$${order.shipping.toFixed(
                          2
                        )}`}
                  </span>
                </div>
              </div>

              <div
                className="
                  my-5
                  border-t
                  border-(--olive-200)
                "
              />

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
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </section>

            {/* ==================================
                SHIPPING
            ================================== */}

            <section
              className="
                rounded-[1.75rem]
                border
                border-(--olive-200)
                bg-white
                p-6
                shadow-[var(--shadow-soft)]
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <MapPin
                  size={18}
                  className="text-(--brick-600)"
                  strokeWidth={1.8}
                />

                <h2
                  className="
                    text-lg
                    font-bold
                    text-(--olive-900)
                  "
                >
                  معلومات الشحن
                </h2>
              </div>

              <div
                className="
                  mt-5
                  kometik-space-y-3
                  text-sm
                "
              >
                <p
                  className="
                    font-semibold
                    text-(--olive-900)
                  "
                >
                  {order.customerName}
                </p>

                <p
                  className="
                    flex
                    items-center
                    gap-2
                    text-(--olive-600)
                  "
                  dir="ltr"
                >
                  <Phone
                    size={14}
                    strokeWidth={1.8}
                  />

                  {order.customerPhone}
                </p>

                <p
                  className="
                    flex
                    items-center
                    gap-2
                    text-(--olive-600)
                  "
                  dir="ltr"
                >
                  <Mail
                    size={14}
                    strokeWidth={1.8}
                  />

                  {order.customerEmail}
                </p>

                <div
                  className="
                    mt-4
                    border-t
                    border-(--olive-200)
                    pt-4
                  "
                >
                  <p
                    className="
                      leading-6
                      text-(--olive-700)
                    "
                  >
                    {order.shippingAddress}
                  </p>

                  <p
                    className="
                      mt-1
                      text-(--olive-600)
                    "
                  >
                    {order.shippingCity}
                    {"، "}
                    {order.shippingPostalCode}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ====================================
            BOTTOM ACTION
        ==================================== */}

        <div
          className="
            mt-6
            flex
            justify-center
          "
        >
          <Link
            href="/shop"
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-(--olive-300)
              bg-white
              px-6
              py-3.5
              text-sm
              font-semibold
              text-(--olive-900)
              transition
              hover:border-(--brick-200)
              hover:bg-(--olive-50)
              hover:text-(--brick-700)
            "
          >
            متابعة التسوق

            <ArrowRight
              size={16}
              strokeWidth={1.9}
            />
          </Link>
        </div>
      </div>
    </main>
  );
}
