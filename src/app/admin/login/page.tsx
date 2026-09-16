"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==========================================
  // LOGIN
  // ==========================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");


    try {

      const response =
        await fetch(
          "/api/admin/auth/login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials: "include",

            body: JSON.stringify({
              email:
                email.trim(),

              password,
            }),
          }
        );


      const data =
        await response.json();


      // ========================================
      // LOGIN FAILED
      // ========================================

      if (!response.ok) {

        setError(
          data.message ||
            "Invalid email or password"
        );

        return;
      }


      // ========================================
      // LOGIN SUCCESS
      // ========================================

      router.replace("/admin");

      router.refresh();

    } catch (error) {

      console.error(
        "ADMIN LOGIN ERROR:",
        error
      );

      setError(
        "Unable to connect to server"
      );

    } finally {

      setLoading(false);

    }
  }


  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-gray-100
        px-4
      "
    >

      <div className="w-full max-w-md">

        <div
          className="
            rounded-2xl
            bg-white
            p-8
            shadow-lg
          "
        >

          {/* HEADER */}

          <div className="mb-8 text-center">

            <div
              className="
                mx-auto
                mb-4
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-xl
                bg-black
                text-xl
                font-bold
                text-white
              "
            >
              K
            </div>

            <h1
              className="
                text-2xl
                font-bold
                text-gray-900
              "
            >
              Admin Login
            </h1>

            <p
              className="
                mt-2
                text-sm
                text-gray-500
              "
            >
              Sign in to manage your store
            </p>

          </div>


          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="kometik-space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-gray-700
                "
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="admin@example.com"
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  px-4
                  py-3
                  outline-none
                  transition
                  focus:border-black
                  focus:ring-1
                  focus:ring-black
                "
              />

            </div>


            {/* PASSWORD */}

            <div>

              <label
                htmlFor="password"
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-gray-700
                "
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="••••••••"
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  px-4
                  py-3
                  outline-none
                  transition
                  focus:border-black
                  focus:ring-1
                  focus:ring-black
                "
              />

            </div>


            {/* ERROR */}

            {error && (
              <div
                className="
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


            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                rounded-xl
                bg-black
                px-6
                py-3.5
                font-semibold
                text-white
                transition
                hover:bg-gray-800
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>

          </form>

        </div>


        <p
          className="
            mt-6
            text-center
            text-xs
            text-gray-500
          "
        >
          Admin access only
        </p>

      </div>

    </main>
  );
}