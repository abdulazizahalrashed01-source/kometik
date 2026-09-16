"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Something went wrong. Please try again."
        );
        return;
      }

      setSuccess(
        data.message ||
          "If an account exists for this email, a reset link has been sent."
      );
    } catch {
      setError(
        "Something went wrong. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <Link
            href="/"
            className="inline-block text-3xl font-semibold tracking-tight"
          >
            Kometik
          </Link>

          <p className="mt-3 text-sm text-neutral-500">
            Reset your password
          </p>
        </div>

        <div className="border border-neutral-200 rounded-2xl p-7 sm:p-8 shadow-sm">

          <div className="mb-7">
            <h1 className="text-2xl font-semibold tracking-tight">
              Forgot your password?
            </h1>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Enter your email address and&apos;ll send
              you a link to reset your password.
            </p>
          </div>

          {success ? (
            <div className="kometik-space-y-6">

              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm leading-6 text-neutral-700">
                  {success}
                </p>
              </div>

              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-xl bg-black px-4 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Back to login
              </Link>

            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="kometik-space-y-5"
            >

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-black"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-600">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-black px-4 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Sending..."
                  : "Send reset link"}
              </button>

            </form>
          )}

          {!success && (
            <div className="mt-7 text-center">

              <Link
                href="/login"
                className="text-sm text-neutral-500 transition hover:text-black"
              >
                ← Back to login
              </Link>

            </div>
          )}

        </div>
      </div>
    </main>
  );
}
