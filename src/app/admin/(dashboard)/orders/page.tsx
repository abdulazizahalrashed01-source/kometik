"use client";

import { useEffect, useState } from "react";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

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

  status: OrderStatus;

  createdAt: string;
  updatedAt: string;

  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;

  items: OrderItem[];
};


const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];


export default function AdminOrdersPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);


  // ==========================================
  // LOAD ORDERS
  // ==========================================

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          "/api/admin/orders",
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
            "Failed to load orders"
        );
      }

      setOrders(
        data.orders || []
      );

    } catch (error) {

      console.error(
        "LOAD ADMIN ORDERS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load orders"
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadOrders();
  }, []);


  // ==========================================
  // UPDATE STATUS
  // ==========================================

  async function updateStatus(
    orderId: string,
    status: OrderStatus
  ) {
    try {
      setUpdatingId(orderId);
      setError("");

      const response =
        await fetch(
          `/api/admin/orders/${orderId}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials: "include",

            body: JSON.stringify({
              status,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update order"
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status:
                  data.order.status,
              }
            : order
        )
      );

    } catch (error) {

      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update order"
      );

    } finally {
      setUpdatingId(null);
    }
  }


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
      <div className="mx-auto max-w-7xl">

        <div className="animate-pulse kometik-space-y-5">

          <div className="h-8 w-40 rounded bg-gray-200" />

          <div className="h-32 rounded-xl bg-gray-200" />

          <div className="h-64 rounded-xl bg-gray-200" />

        </div>

      </div>
    );
  }


  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="mx-auto max-w-7xl">

      {/* HEADER */}

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

          <h1
            className="
              text-3xl
              font-bold
              text-gray-900
            "
          >
            Orders
          </h1>

          <p
            className="
              mt-2
              text-gray-500
            "
          >
            Manage customer orders and
            update their status.
          </p>

        </div>


        <div
          className="
            rounded-lg
            bg-white
            px-4
            py-3
            text-sm
            shadow-sm
          "
        >
          <span className="text-gray-500">
            Total Orders:
          </span>

          <span className="ml-2 font-bold">
            {orders.length}
          </span>
        </div>

      </div>


      {/* ERROR */}

      {error && (
        <div
          className="
            mb-6
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


      {/* EMPTY */}

      {orders.length === 0 ? (

        <div
          className="
            rounded-2xl
            bg-white
            p-12
            text-center
            shadow-sm
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
              bg-gray-100
              text-2xl
            "
          >
            📦
          </div>

          <h2
            className="
              mt-5
              text-xl
              font-semibold
            "
          >
            No orders yet
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-gray-500
            "
          >
            Customer orders will appear here.
          </p>

        </div>

      ) : (

        <div className="kometik-space-y-5">

          {orders.map((order) => (

            <article
              key={order.id}
              className="
                rounded-2xl
                bg-white
                p-6
                shadow-sm
              "
            >

              {/* ORDER TOP */}

              <div
                className="
                  flex
                  flex-col
                  gap-5
                  border-b
                  pb-5
                  lg:flex-row
                  lg:items-start
                  lg:justify-between
                "
              >

                {/* ORDER */}

                <div>

                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-gray-400
                    "
                  >
                    Order
                  </p>

                  <p
                    className="
                      mt-1
                      break-all
                      font-mono
                      text-sm
                      font-semibold
                    "
                  >
                    {order.id}
                  </p>

                  <p
                    className="
                      mt-2
                      text-sm
                      text-gray-500
                    "
                  >
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>

                </div>


                {/* CUSTOMER */}

                <div>

                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-gray-400
                    "
                  >
                    Customer
                  </p>

                  <p className="mt-1 font-medium">
                    {order.customerName}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {order.customerEmail}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {order.customerPhone}
                  </p>

                </div>


                {/* STATUS */}

                <div className="flex flex-col gap-2">

                  <span
                    className={`
                      inline-flex
                      w-fit
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


                  <select
                    value={order.status}
                    disabled={
                      updatingId === order.id
                    }
                    onChange={(event) =>
                      updateStatus(
                        order.id,
                        event.target.value as OrderStatus
                      )
                    }
                    className="
                      rounded-lg
                      border
                      border-gray-300
                      bg-white
                      px-3
                      py-2
                      text-sm
                      outline-none
                      focus:border-black
                      focus:ring-1
                      focus:ring-black
                      disabled:opacity-50
                    "
                  >

                    {STATUS_OPTIONS.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {getStatusLabel(
                            status
                          )}
                        </option>
                      )
                    )}

                  </select>

                </div>

              </div>


              {/* ITEMS */}

              <div className="py-5">

                <h3
                  className="
                    mb-4
                    text-sm
                    font-semibold
                  "
                >
                  Items
                </h3>

                <div className="kometik-space-y-3">

                  {order.items.map(
                    (item) => (

                      <div
                        key={item.id}
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
                          rounded-lg
                          bg-gray-50
                          px-4
                          py-3
                        "
                      >

                        <div>

                          <p className="text-sm font-medium">
                            {item.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            ${item.price.toFixed(2)}
                            {" × "}
                            {item.quantity}
                          </p>

                        </div>

                        <p className="text-sm font-semibold">
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


              {/* BOTTOM */}

              <div
                className="
                  flex
                  flex-col
                  gap-5
                  border-t
                  pt-5
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
                      font-semibold
                      uppercase
                      tracking-wider
                      text-gray-400
                    "
                  >
                    Shipping Address
                  </p>

                  <p
                    className="
                      mt-2
                      text-sm
                    "
                  >
                    {order.shippingAddress}
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-gray-500
                    "
                  >
                    {order.shippingCity},{" "}
                    {order.shippingPostalCode}
                  </p>

                </div>


                {/* TOTAL */}

                <div className="text-left sm:text-right">

                  <p className="text-sm text-gray-500">
                    Subtotal: $
                    {order.subtotal.toFixed(2)}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Shipping:{" "}
                    {order.shipping === 0
                      ? "Free"
                      : `$${order.shipping.toFixed(2)}`}
                  </p>

                  <p
                    className="
                      mt-2
                      text-2xl
                      font-bold
                    "
                  >
                    ${order.total.toFixed(2)}
                  </p>

                </div>

              </div>

            </article>

          ))}

        </div>

      )}

    </div>
  );
}