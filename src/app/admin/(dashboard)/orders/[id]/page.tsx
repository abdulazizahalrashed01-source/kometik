"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";


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


// ==========================================
// STATUS OPTIONS
// ==========================================

const allowedTransitions: Record<
  OrderStatus,
  OrderStatus[]
> = {
  PENDING: [
    "PENDING",
    "CONFIRMED",
    "CANCELLED",
  ],

  CONFIRMED: [
    "CONFIRMED",
    "PROCESSING",
    "CANCELLED",
  ],

  PROCESSING: [
    "PROCESSING",
    "SHIPPED",
    "CANCELLED",
  ],

  SHIPPED: [
    "SHIPPED",
    "DELIVERED",
  ],

  DELIVERED: [
    "DELIVERED",
  ],

  CANCELLED: [
    "CANCELLED",
  ],
};


// ==========================================
// PAGE
// ==========================================

export default function AdminOrderDetailsPage() {

  const params = useParams();

  const orderId =
    typeof params.id === "string"
      ? params.id
      : "";


  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==========================================
  // LOAD ORDER
  // ==========================================

  useEffect(() => {

    async function loadOrder() {

      if (!orderId) {
        setError("Invalid order.");
        setLoading(false);
        return;
      }


      try {

        setLoading(true);
        setError("");


        const response =
          await fetch(
            `/api/admin/orders/${encodeURIComponent(
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
              "Failed to load order"
          );

        }


        setOrder(
          data.order
        );

      } catch (error) {

        console.error(
          "LOAD ADMIN ORDER ERROR:",
          error
        );


        setError(
          error instanceof Error
            ? error.message
            : "Failed to load order"
        );

      } finally {

        setLoading(false);

      }

    }


    loadOrder();

  }, [orderId]);


  // ==========================================
  // UPDATE STATUS
  // ==========================================

  async function updateStatus(
    status: OrderStatus
  ) {

    if (!order) {
      return;
    }


    try {

      setUpdating(true);
      setError("");


      const response =
        await fetch(
          `/api/admin/orders/${encodeURIComponent(
            order.id
          )}`,
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


      setOrder((current) =>
        current
          ? {
              ...current,

              status:
                data.order.status,

              updatedAt:
                data.order.updatedAt,
            }
          : current
      );

    } catch (error) {

      console.error(
        "UPDATE ORDER ERROR:",
        error
      );


      setError(
        error instanceof Error
          ? error.message
          : "Failed to update order"
      );

    } finally {

      setUpdating(false);

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
      <div className="mx-auto max-w-6xl">

        <div className="animate-pulse kometik-space-y-5">

          <div className="h-8 w-48 rounded bg-gray-200" />

          <div className="h-48 rounded-2xl bg-gray-200" />

          <div className="h-64 rounded-2xl bg-gray-200" />

        </div>

      </div>
    );

  }


  // ==========================================
  // ERROR / NOT FOUND
  // ==========================================

  if (!order || error) {

    return (
      <div className="mx-auto max-w-4xl">

        <Link
          href="/admin/orders"
          className="
            text-sm
            text-gray-500
            hover:text-black
          "
        >
          ← Back to Orders
        </Link>


        <div
          className="
            mt-6
            rounded-2xl
            bg-white
            p-10
            text-center
            shadow-sm
          "
        >

          <h1 className="text-xl font-bold">
            Order not found
          </h1>


          <p className="mt-2 text-sm text-gray-500">
            {error ||
              "This order does not exist."}
          </p>

        </div>

      </div>
    );

  }


  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="mx-auto max-w-6xl">


      {/* ======================================
          HEADER
      ====================================== */}

      <div className="mb-8">

        <Link
          href="/admin/orders"
          className="
            text-sm
            text-gray-500
            hover:text-black
          "
        >
          ← Back to Orders
        </Link>


        <div
          className="
            mt-4
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >

          {/* ORDER INFO */}

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


            <h1
              className="
                mt-1
                break-all
                font-mono
                text-2xl
                font-bold
              "
            >
              {order.id}
            </h1>


            <p
              className="
                mt-2
                text-sm
                text-gray-500
              "
            >
              Created{" "}
              {new Date(
                order.createdAt
              ).toLocaleString()}
            </p>

          </div>


          {/* STATUS */}

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-3
            "
          >

            <span
              className={`
                rounded-full
                px-4
                py-2
                text-sm
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
              disabled={updating}
              onChange={(event) =>
                updateStatus(
                  event.target.value as OrderStatus
                )
              }
              className="
                rounded-xl
                border
                border-gray-300
                bg-white
                px-4
                py-2.5
                text-sm
                font-medium
                outline-none
                focus:border-black
                focus:ring-1
                focus:ring-black
                disabled:opacity-50
              "
            >

             {allowedTransitions[
  order.status
].map(
  (status) => (
    <option
      key={status}
      value={status}
    >
      {getStatusLabel(status)}
    </option>
  )
)}

            </select>

          </div>

        </div>

      </div>


      {/* ======================================
          ERROR
      ====================================== */}

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


      {/* ======================================
          CONTENT
      ====================================== */}

      <div
        className="
          grid
          gap-6
          lg:grid-cols-[1fr_360px]
        "
      >


        {/* ====================================
            LEFT
        ==================================== */}

        <div className="kometik-space-y-6">


          {/* CUSTOMER */}

          <section
            className="
              rounded-2xl
              bg-white
              p-6
              shadow-sm
            "
          >

            <h2 className="text-lg font-bold">
              Customer
            </h2>


            <div
              className="
                mt-5
                grid
                gap-5
                sm:grid-cols-2
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-wider
                    text-gray-400
                  "
                >
                  Name
                </p>


                <p className="mt-1 font-medium">
                  {order.customerName}
                </p>

              </div>


              <div>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-wider
                    text-gray-400
                  "
                >
                  Email
                </p>


                <p
                  className="
                    mt-1
                    break-all
                    text-sm
                  "
                >
                  {order.customerEmail}
                </p>

              </div>


              <div>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-wider
                    text-gray-400
                  "
                >
                  Phone
                </p>


                <p className="mt-1 text-sm">
                  {order.customerPhone}
                </p>

              </div>


              <div>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-wider
                    text-gray-400
                  "
                >
                  User Account
                </p>


                <p className="mt-1 text-sm">
                  {order.user
                    ? order.user.email
                    : "Guest Checkout"}
                </p>

              </div>

            </div>

          </section>


          {/* ITEMS */}

          <section
            className="
              rounded-2xl
              bg-white
              p-6
              shadow-sm
            "
          >

            <h2 className="text-lg font-bold">
              Order Items
            </h2>


            <div className="mt-5 kometik-divide-y">

              {order.items.map(
                (item) => (

                  <div
                    key={item.id}
                    className="
                      flex
                      items-center
                      justify-between
                      gap-5
                      py-5
                    "
                  >

                    <div>

                      <p className="font-medium">
                        {item.name}
                      </p>


                      <p
                        className="
                          mt-1
                          text-sm
                          text-gray-500
                        "
                      >
                        ${item.price.toFixed(2)}
                        {" × "}
                        {item.quantity}
                      </p>

                    </div>


                    <p
                      className="
                        shrink-0
                        font-semibold
                      "
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

          </section>

        </div>


        {/* ====================================
            RIGHT
        ==================================== */}

        <div className="kometik-space-y-6">


          {/* SUMMARY */}

          <section
            className="
              rounded-2xl
              bg-white
              p-6
              shadow-sm
            "
          >

            <h2 className="text-lg font-bold">
              Order Summary
            </h2>


            <div
              className="
                mt-5
                kometik-space-y-3
                text-sm
              "
            >

              <div className="flex justify-between">

                <span className="text-gray-500">
                  Subtotal
                </span>

                <span>
                  ${order.subtotal.toFixed(2)}
                </span>

              </div>


              <div className="flex justify-between">

                <span className="text-gray-500">
                  Shipping
                </span>

                <span>
                  {order.shipping === 0
                    ? "Free"
                    : `$${order.shipping.toFixed(2)}`}
                </span>

              </div>

            </div>


            <div className="my-5 border-t" />


            <div className="flex justify-between">

              <span className="text-lg font-bold">
                Total
              </span>

              <span className="text-2xl font-bold">
                ${order.total.toFixed(2)}
              </span>

            </div>

          </section>


          {/* SHIPPING */}

          <section
            className="
              rounded-2xl
              bg-white
              p-6
              shadow-sm
            "
          >

            <h2 className="text-lg font-bold">
              Shipping Address
            </h2>


            <div
              className="
                mt-5
                kometik-space-y-2
                text-sm
              "
            >

              <p className="font-medium">
                {order.customerName}
              </p>


              <p>
                {order.shippingAddress}
              </p>


              <p>
                {order.shippingCity},{" "}
                {order.shippingPostalCode}
              </p>


              <p
                className="
                  pt-2
                  text-gray-500
                "
              >
                {order.customerPhone}
              </p>

            </div>

          </section>

        </div>

      </div>

    </div>
  );
}