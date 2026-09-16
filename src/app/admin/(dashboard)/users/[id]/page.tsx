"use client";

import Image from "next/image";
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


type UserOrder = {
  id: string;
  total: number;
  status: OrderStatus;
  createdAt: string;

  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
};


type User = {
  id: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
  role: "USER";

  createdAt: string;
  updatedAt: string;

  _count: {
    orders: number;
  };

  orders: UserOrder[];
};


// ==========================================
// PAGE
// ==========================================

export default function AdminUserDetailsPage() {

  const params = useParams();

  const userId =
    typeof params.id === "string"
      ? params.id
      : "";


  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==========================================
  // LOAD USER
  // ==========================================

  useEffect(() => {

    async function loadUser() {

      if (!userId) {
        setError(
          "Invalid user."
        );

        setLoading(false);
        return;
      }


      try {

        setLoading(true);
        setError("");


        const response =
          await fetch(
            `/api/admin/users/${encodeURIComponent(
              userId
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
              "Failed to load user"
          );

        }


        setUser(data.user);

      } catch (error) {

        console.error(
          "LOAD ADMIN USER ERROR:",
          error
        );


        setError(
          error instanceof Error
            ? error.message
            : "Failed to load user"
        );

      } finally {

        setLoading(false);

      }

    }


    loadUser();

  }, [userId]);


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

          <div className="h-40 rounded-2xl bg-gray-200" />

          <div className="h-64 rounded-2xl bg-gray-200" />

        </div>

      </div>
    );

  }


  // ==========================================
  // ERROR
  // ==========================================

  if (!user || error) {

    return (
      <div className="mx-auto max-w-4xl">

        <Link
          href="/admin/users"
          className="
            text-sm
            text-gray-500
            hover:text-black
          "
        >
          ← Back to Users
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

          <h1
            className="
              text-xl
              font-bold
            "
          >
            User not found
          </h1>


          <p
            className="
              mt-2
              text-sm
              text-gray-500
            "
          >
            {error ||
              "This user does not exist."}
          </p>

        </div>

      </div>
    );

  }


  // ==========================================
  // AVATAR
  // ==========================================

  const avatarLetter =
    (
      user.name ||
      user.email ||
      "U"
    )
      .charAt(0)
      .toUpperCase();


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
          href="/admin/users"
          className="
            text-sm
            text-gray-500
            hover:text-black
          "
        >
          ← Back to Users
        </Link>


        <div
          className="
            mt-4
            flex
            flex-col
            gap-6
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          {/* USER */}

          <div
            className="
              flex
              items-center
              gap-4
            "
          >

            <div
              className="
                relative
                flex
                h-20
                w-20
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-full
                bg-black
                text-2xl
                font-bold
                text-white
              "
            >

              {user.imageUrl ? (

                <Image
                  src={user.imageUrl}
                  alt={
                    user.name ||
                    "User"
                  }
                  fill
                  sizes="80px"
                  className="object-cover"
                />

              ) : (

                avatarLetter

              )}

            </div>


            <div>

              <h1
                className="
                  text-2xl
                  font-bold
                  text-gray-900
                "
              >
                {user.name ||
                  "Unnamed User"}
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >
                {user.email}
              </p>

            </div>

          </div>


          {/* ORDER COUNT */}

          <div
            className="
              rounded-xl
              bg-white
              px-5
              py-4
              shadow-sm
            "
          >

            <p
              className="
                text-xs
                uppercase
                tracking-wider
                text-gray-400
              "
            >
              Total Orders
            </p>

            <p
              className="
                mt-1
                text-2xl
                font-bold
              "
            >
              {user._count.orders}
            </p>

          </div>

        </div>

      </div>


      {/* ======================================
          CONTENT
      ====================================== */}

      <div
        className="
          grid
          gap-6
          lg:grid-cols-[340px_1fr]
        "
      >

        {/* ====================================
            ACCOUNT INFORMATION
        ==================================== */}

        <section
          className="
            h-fit
            rounded-2xl
            bg-white
            p-6
            shadow-sm
          "
        >

          <h2
            className="
              text-lg
              font-bold
            "
          >
            Account Information
          </h2>


          <div className="mt-6 kometik-space-y-5">

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

              <p
                className="
                  mt-1
                  font-medium
                "
              >
                {user.name ||
                  "Not provided"}
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
                {user.email}
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
                Role
              </p>

              <span
                className="
                  mt-1
                  inline-block
                  rounded-full
                  bg-gray-100
                  px-3
                  py-1
                  text-xs
                  font-semibold
                "
              >
                User
              </span>

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
                Joined
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-600
                "
              >
                {new Date(
                  user.createdAt
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

          </div>

        </section>


        {/* ====================================
            ORDERS
        ==================================== */}

        <section
          className="
            rounded-2xl
            bg-white
            shadow-sm
          "
        >

          <div
            className="
              border-b
              px-6
              py-5
            "
          >

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
              The latest orders placed by this customer.
            </p>

          </div>


          {user.orders.length === 0 ? (

            <div
              className="
                p-10
                text-center
                text-sm
                text-gray-500
              "
            >
              This user has no orders yet.
            </div>

          ) : (

            <div className="kometik-divide-y">

              {user.orders.map(
                (order) => (

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

                      <div>

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
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-gray-400
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

                      </div>


                      <div
                        className="
                          flex
                          items-center
                          gap-4
                        "
                      >

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


                        <span
                          className="
                            font-semibold
                          "
                        >
                          $
                          {order.total.toFixed(
                            2
                          )}
                        </span>

                      </div>

                    </div>

                  </Link>

                )
              )}

            </div>

          )}

        </section>

      </div>

    </div>
  );
}