"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ClipboardList,
  Package,
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
  items: OrderItem[];
};

// ==========================================
// ORDERS PAGE
// ==========================================

export default function OrdersPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // LOAD ORDERS
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/orders",
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
              "تعذر تحميل الطلبات."
          );
        }

        if (!cancelled) {
          setOrders(
            data.orders || []
          );
        }
      } catch (error) {
        console.error(
          "LOAD ORDERS ERROR:",
          error
        );

        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "تعذر تحميل الطلبات."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, []);

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

            <div className="p-6 sm:p-8">
              <div className="animate-pulse">
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
                    h-40
                    rounded-2xl
                    bg-(--olive-100)
                  "
                />

                <div
                  className="
                    mt-5
                    h-40
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

        <div
          className="
            mb-8
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
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
              طلباتي
            </h1>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-(--olive-600)
              "
            >
              استعرض طلباتك السابقة وتابع
              تفاصيلها وحالتها.
            </p>
          </div>

          {/* ORDER COUNT */}

          <div
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-full
              bg-(--olive-100)
              px-4
              py-2
              text-sm
              font-medium
              text-(--olive-700)
            "
          >
            <ClipboardList
              size={16}
              strokeWidth={1.8}
            />

            {orders.length}{" "}
            {orders.length === 1
              ? "طلب"
              : "طلبات"}
          </div>
        </div>

        {/* ====================================
            ERROR
        ==================================== */}

        {error && (
          <div
            className="
              mb-6
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

        {/* ====================================
            EMPTY
        ==================================== */}

        {orders.length === 0 ? (
          <div
            className="
              rounded-[2rem]
              border
              border-(--olive-200)
              bg-white
              px-6
              py-20
              text-center
              shadow-[var(--shadow-soft)]
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

            <h2
              className="
                mt-2
                text-xl
                font-semibold
                text-(--olive-900)
              "
            >
              لا توجد طلبات بعد
            </h2>

            <p
              className="
                mx-auto
                mt-2
                max-w-md
                text-sm
                leading-6
                text-(--olive-600)
              "
            >
              ستظهر طلباتك هنا بعد إتمام
              أول عملية شراء.
            </p>

            <Link
              href="/shop"
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
              ابدأ التسوق

              <ChevronLeft
                size={17}
                strokeWidth={2}
              />
            </Link>
          </div>
        ) : (
          <div className="kometik-space-y-5">

            {/* ==================================
                ORDERS
            ================================== */}

            {orders.map((order) => (
              <article
                key={order.id}
                className="
                  overflow-hidden
                  rounded-[1.75rem]
                  border
                  border-(--olive-200)
                  bg-white
                  shadow-[var(--shadow-soft)]
                  transition
                  hover:border-(--brick-200)
                "
              >
                {/* ==================================
                    ORDER HEADER
                ================================== */}

                <div
                  className="
                    flex
                    flex-col
                    gap-4
                    border-b
                    border-(--olive-200)
                    p-5
                    sm:flex-row
                    sm:items-start
                    sm:justify-between
                    sm:p-6
                  "
                >
                  <div className="min-w-0">
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <span
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-(--brick-50)
                          text-(--brick-600)
                        "
                      >
                        <Package
                          size={17}
                          strokeWidth={1.8}
                        />
                      </span>

                      <div>
                        <p
                          className="
                            text-xs
                            font-semibold
                            text-(--brick-500)
                          "
                        >
                          رقم الطلب
                        </p>

                        <p
                          dir="ltr"
                          className="
                            mt-0.5
                            break-all
                            font-mono
                            text-xs
                            font-semibold
                            text-(--olive-900)
                          "
                        >
                          {order.id}
                        </p>
                      </div>
                    </div>

                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        gap-2
                        text-xs
                        text-(--olive-500)
                      "
                    >
                      <CalendarDays
                        size={14}
                        strokeWidth={1.8}
                      />

                      <span>
                        {formatDate(
                          order.createdAt
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
                      rounded-full
                      px-3.5
                      py-2
                      text-xs
                      font-semibold
                      ring-1
                      ring-inset
                      ${getStatusClass(
                        order.status
                      )}
                    `}
                  >
                    {getStatusLabel(
                      order.status
                    )}
                  </span>
                </div>

                {/* ==================================
                    ITEMS
                ================================== */}

                <div className="p-5 sm:p-6">
                  <div className="kometik-space-y-4">
                    {order.items.map(
                      (item) => (
                        <div
                          key={item.id}
                          className="
                            flex
                            items-center
                            justify-between
                            gap-4
                            rounded-xl
                            bg-(--olive-50)
                            px-4
                            py-3.5
                          "
                        >
                          <div className="min-w-0">
                            <p
                              className="
                                truncate
                                text-sm
                                font-semibold
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
                              dir="ltr"
                            >
                              $
                              {item.price.toFixed(
                                2
                              )}{" "}
                              ×{" "}
                              {item.quantity}
                            </p>
                          </div>

                          <p
                            className="
                              shrink-0
                              text-sm
                              font-bold
                              text-(--olive-900)
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
                      )
                    )}
                  </div>
                </div>

                {/* ==================================
                    FOOTER
                ================================== */}

                <div
                  className="
                    border-t
                    border-(--olive-200)
                    bg-(--olive-50)
                    p-5
                    sm:p-6
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-5
                      sm:flex-row
                      sm:items-end
                      sm:justify-between
                    "
                  >
                    {/* SHIPPING */}

                    <div>
                      <p
                        className="
                          text-xs
                          font-medium
                          text-(--olive-500)
                        "
                      >
                        الشحن
                      </p>

                      <p
                        className={`
                          mt-1
                          text-sm
                          font-semibold
                          ${
                            order.shipping ===
                            0
                              ? "text-(--brick-600)"
                              : "text-(--olive-800)"
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
                      </p>
                    </div>

                    {/* TOTAL */}

                    <div
                      className="
                        sm:text-left
                      "
                    >
                      <p
                        className="
                          text-xs
                          font-medium
                          text-(--olive-500)
                        "
                      >
                        الإجمالي
                      </p>

                      <p
                        className="
                          mt-1
                          text-2xl
                          font-bold
                          text-(--brick-600)
                        "
                        dir="ltr"
                      >
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* VIEW ORDER */}

                  <Link
                    href={`/account/orders/${order.id}`}
                    className="
                      mt-5
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-(--olive-300)
                      bg-white
                      px-5
                      py-3
                      text-sm
                      font-semibold
                      text-(--olive-900)
                      transition
                      hover:border-(--brick-200)
                      hover:bg-(--brick-50)
                      hover:text-(--brick-700)
                    "
                  >
                    عرض تفاصيل الطلب

                    <ChevronLeft
                      size={16}
                      strokeWidth={2}
                    />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
