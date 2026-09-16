"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";


// ==========================================
// TYPES
// ==========================================

type User = {
  id: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
  createdAt: string;

  _count: {
    orders: number;
  };
};


// ==========================================
// PAGE
// ==========================================

export default function AdminUsersPage() {

  const [users, setUsers] =
    useState<User[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ==========================================
  // LOAD USERS
  // ==========================================

  useEffect(() => {

    async function loadUsers() {

      try {

        setLoading(true);
        setError("");


        const response =
          await fetch(
            "/api/admin/users",
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
              "Failed to load users"
          );

        }


        setUsers(
          data.users || []
        );

      } catch (error) {

        console.error(
          "LOAD ADMIN USERS ERROR:",
          error
        );


        setError(
          error instanceof Error
            ? error.message
            : "Failed to load users"
        );

      } finally {

        setLoading(false);

      }

    }


    loadUsers();

  }, []);


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <div className="mx-auto max-w-7xl">

        <div className="animate-pulse">

          <div
            className="
              h-8
              w-40
              rounded
              bg-gray-200
            "
          />

          <div
            className="
              mt-6
              h-96
              rounded-2xl
              bg-gray-200
            "
          />

        </div>

      </div>
    );

  }


  // ==========================================
  // ERROR
  // ==========================================

  if (error) {

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
        {error}
      </div>
    );

  }


  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="mx-auto max-w-7xl">

      {/* ======================================
          HEADER
      ====================================== */}

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
            Users
          </h1>

          <p
            className="
              mt-2
              text-gray-500
            "
          >
            Manage registered customers.
          </p>

        </div>


        <div
          className="
            rounded-xl
            bg-white
            px-5
            py-3
            text-sm
            shadow-sm
          "
        >

          <span className="text-gray-500">
            Total Users:
          </span>

          <span className="ml-2 font-bold">
            {users.length}
          </span>

        </div>

      </div>


      {/* ======================================
          EMPTY
      ====================================== */}

      {users.length === 0 ? (

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
            👥
          </div>


          <h2
            className="
              mt-5
              text-xl
              font-semibold
            "
          >
            No users yet
          </h2>


          <p
            className="
              mt-2
              text-sm
              text-gray-500
            "
          >
            Registered customers will
            appear here.
          </p>

        </div>

      ) : (

        /* ====================================
           USERS TABLE
        ==================================== */

        <div
          className="
            overflow-hidden
            rounded-2xl
            bg-white
            shadow-sm
          "
        >

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead
                className="
                  border-b
                  bg-gray-50
                "
              >

                <tr>

                  <th
                    className="
                      px-6
                      py-4
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-gray-500
                    "
                  >
                    User
                  </th>


                  <th
                    className="
                      px-6
                      py-4
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-gray-500
                    "
                  >
                    Email
                  </th>


                  <th
                    className="
                      px-6
                      py-4
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-gray-500
                    "
                  >
                    Orders
                  </th>


                  <th
                    className="
                      px-6
                      py-4
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-gray-500
                    "
                  >
                    Joined
                  </th>


                  <th
                    className="
                      px-6
                      py-4
                      text-right
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-gray-500
                    "
                  >
                    Action
                  </th>

                </tr>

              </thead>


              <tbody className="kometik-divide-y">

                {users.map((user) => (

                  <tr
                    key={user.id}
                    className="
                      transition
                      hover:bg-gray-50
                    "
                  >

                    {/* USER */}

                    <td className="px-6 py-5">

                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >

                        <div
                          className="
                            relative
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-full
                            bg-black
                            text-sm
                            font-semibold
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
                              sizes="44px"
                              className="object-cover"
                            />

                          ) : (

                            (
                              user.name ||
                              user.email ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()

                          )}

                        </div>


                        <div>

                          <p
                            className="
                              font-medium
                              text-gray-900
                            "
                          >
                            {user.name ||
                              "Unnamed User"}
                          </p>


                          <p
                            className="
                              mt-1
                              max-w-48
                              truncate
                              text-xs
                              text-gray-400
                            "
                          >
                            {user.id}
                          </p>

                        </div>

                      </div>

                    </td>


                    {/* EMAIL */}

                    <td className="px-6 py-5">

                      <span
                        className="
                          text-sm
                          text-gray-600
                        "
                      >
                        {user.email}
                      </span>

                    </td>


                    {/* ORDERS */}

                    <td className="px-6 py-5">

                      <span
                        className="
                          rounded-full
                          bg-gray-100
                          px-3
                          py-1
                          text-xs
                          font-semibold
                        "
                      >
                        {user._count.orders}
                      </span>

                    </td>


                    {/* DATE */}

                    <td className="px-6 py-5">

                      <span
                        className="
                          text-sm
                          text-gray-500
                        "
                      >
                        {new Date(
                          user.createdAt
                        ).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>

                    </td>


                    {/* ACTION */}

                    <td
                      className="
                        px-6
                        py-5
                        text-right
                      "
                    >

                      <Link
                        href={`/admin/users/${user.id}`}
                        className="
                          text-sm
                          font-semibold
                          hover:underline
                        "
                      >
                        View →
                      </Link>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  );
}