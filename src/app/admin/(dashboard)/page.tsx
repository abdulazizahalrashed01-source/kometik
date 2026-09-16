"use client";

import Link from "next/link";
import { useEffect, useState } from "react";


// ==========================================
// TYPES
// ==========================================

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";


type RecentOrder = {
  id: string;

  customerName: string;

  customerEmail: string;

  total: number;

  status: OrderStatus;

  createdAt: string;

  items: {
    quantity: number;
  }[];
};


type DashboardStats = {
  totalOrders: number;

  pendingOrders: number;

  processingOrders: number;

  completedOrders: number;

  totalProducts: number;

  totalCategories: number;

  totalUsers: number;

  totalRevenue: number;
};


// ==========================================
// PAGE
// ==========================================

export default function AdminDashboardPage() {

  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [recentOrders, setRecentOrders] =
    useState<RecentOrder[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  useEffect(() => {

    async function loadDashboard() {

      try {

        setLoading(true);
        setError("");


        const response =
          await fetch(
            "/api/admin/dashboard",
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
              "Failed to load dashboard"
          );

        }


        setStats(data.stats);

        setRecentOrders(
          data.recentOrders || []
        );

      } catch (error) {

        console.error(
          "LOAD DASHBOARD ERROR:",
          error
        );


        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard"
        );

      } finally {

        setLoading(false);

      }

    }


    loadDashboard();

  }, []);


  // ==========================================
  // STATUS LABEL
  // ==========================================

  function getStatusLabel(
    status: OrderStatus
  ) {

    switch (status) {

      case "PENDING":
        return "Pending";

      case "CONFIRMED":
        return "Confirmed";

      case "PROCESSING":
        return "Processing";

      case "SHIPPED":
        return "Shipped";

      case "DELIVERED":
        return "Delivered";

      case "CANCELLED":
        return "Cancelled";

      default:
        return status;

    }

  }


  // ==========================================
  // STATUS CLASS
  // ==========================================

  function getStatusClass(
    status: OrderStatus
  ) {

    switch (status) {

      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";

      case "PROCESSING":
        return "bg-purple-100 text-purple-700";

      case "SHIPPED":
        return "bg-indigo-100 text-indigo-700";

      case "DELIVERED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";

    }

  }


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <div className="kometik-space-y-6">

        <div className="animate-pulse">

          <div className="h-8 w-48 rounded bg-gray-200" />

          <div className="mt-6 h-32 rounded-2xl bg-gray-200" />

          <div
            className="
              mt-6
              grid
              gap-5
              sm:grid-cols-2
              xl:grid-cols-4
            "
          >

            {Array.from({
              length: 4,
            }).map((_, index) => (

              <div
                key={index}
                className="
                  h-32
                  rounded-2xl
                  bg-gray-200
                "
              />

            ))}

          </div>

        </div>

      </div>
    );

  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error || !stats) {

    return (
      <div
        className="
          rounded-2xl
          border
          border-red-200
          bg-red-50
          p-6
          text-red-700
        "
      >
        {error ||
          "Unable to load dashboard."}
      </div>
    );

  }


  // ==========================================
  // STATS CARDS
  // ==========================================

  const cards = [

    {
      label: "Total Orders",
      value: stats.totalOrders,
      description: "All orders",
    },

    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      description:
        "Waiting for confirmation",
    },

    {
      label: "Processing",
      value:
        stats.processingOrders,
      description:
        "Currently being processed",
    },

    {
      label: "Completed",
      value:
        stats.completedOrders,
      description:
        "Delivered orders",
    },

    {
      label: "Products",
      value:
        stats.totalProducts,
      description:
        "Products in store",
    },

    {
      label: "Categories",
      value:
        stats.totalCategories,
      description:
        "Product categories",
    },

    {
      label: "Users",
      value:
        stats.totalUsers,
      description:
        "Registered customers",
    },

  ];


  return (
    <div>

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="mb-8">

        <h1
          className="
            text-3xl
            font-bold
            text-gray-900
          "
        >
          Dashboard
        </h1>

        <p
          className="
            mt-2
            text-gray-500
          "
        >
          Overview of your Kometik store.
        </p>

      </div>


      {/* =====================================
          REVENUE
      ===================================== */}

      <div
        className="
          mb-6
          rounded-2xl
          bg-black
          p-6
          text-white
          shadow-sm
        "
      >

        <p className="text-sm text-gray-400">
          Total Revenue
        </p>

        <p
          className="
            mt-2
            text-4xl
            font-bold
          "
        >
          $
          {stats.totalRevenue.toFixed(2)}
        </p>

        <p
          className="
            mt-2
            text-sm
            text-gray-400
          "
        >
          Excluding cancelled orders
        </p>

      </div>


      {/* =====================================
          STATISTICS
      ===================================== */}

      <div
        className="
          grid
          gap-5
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >

        {cards.map((card) => (

          <div
            key={card.label}
            className="
              rounded-2xl
              bg-white
              p-6
              shadow-sm
            "
          >

            <p
              className="
                text-sm
                font-medium
                text-gray-500
              "
            >
              {card.label}
            </p>

            <p
              className="
                mt-3
                text-3xl
                font-bold
                text-gray-900
              "
            >
              {card.value}
            </p>

            <p
              className="
                mt-2
                text-xs
                text-gray-400
              "
            >
              {card.description}
            </p>

          </div>

        ))}

      </div>


      {/* =====================================
          RECENT ORDERS
      ===================================== */}

      <section
        className="
          mt-8
          rounded-2xl
          bg-white
          shadow-sm
        "
      >

        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            px-6
            py-5
          "
        >

          <div>

            <h2
              className="
                text-lg
                font-bold
              "
            >
              Recent Orders
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
              "
            >
              Latest customer orders.
            </p>

          </div>


          <Link
            href="/admin/orders"
            className="
              text-sm
              font-medium
              hover:underline
            "
          >
            View all →
          </Link>

        </div>


        {/* ORDERS */}

        {recentOrders.length === 0 ? (

          <div
            className="
              p-10
              text-center
              text-sm
              text-gray-500
            "
          >
            No orders yet.
          </div>

        ) : (

          <div className="kometik-divide-y">

            {recentOrders.map((order) => (

              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="
                  block
                  px-6
                  py-5
                  transition
                  hover:bg-gray-50
                "
              >

                <div
                  className="
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >

                  {/* ORDER */}

                  <div
                    className="
                      min-w-0
                    "
                  >

                    <p
                      className="
                        font-mono
                        text-xs
                        font-semibold
                      "
                    >
                      {order.id}
                    </p>

                    <p
                      className="
                        mt-1
                        font-medium
                      "
                    >
                      {order.customerName}
                    </p>

                    <p
                      className="
                        mt-1
                        truncate
                        text-sm
                        text-gray-500
                      "
                    >
                      {order.customerEmail}
                    </p>

                  </div>


                  {/* META */}

                  <div
                    className="
                      flex
                      items-center
                      gap-5
                    "
                  >

                    <div
                      className="
                        text-right
                      "
                    >

                      <p
                        className="
                          text-sm
                          text-gray-500
                        "
                      >
                        {order.items.reduce(
                          (
                            total,
                            item
                          ) =>
                            total +
                            item.quantity,
                          0
                        )}{" "}
                        items
                      </p>

                      <p
                        className="
                          mt-1
                          font-bold
                        "
                      >
                        $
                        {order.total.toFixed(
                          2
                        )}
                      </p>

                    </div>


                    <span
                      className={`
                        rounded-full
                        px-3
                        py-1.5
                        text-xs
                        font-semibold
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

                </div>

              </Link>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}