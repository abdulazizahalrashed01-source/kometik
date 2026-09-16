"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const emailFromUrl = searchParams.get("email");

    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCooldown((current) => current - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  function handleCodeChange(value: string) {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);

    setCode(digitsOnly);
    setError("");
    setMessage("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^\d{6}$/.test(normalizedCode)) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/verify-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            code: normalizedCode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to verify your email."
        );
        return;
      }

      setMessage(
        data.message ||
          "Email verified successfully."
      );

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 800);
    } catch (error) {
      console.error(
        "VERIFY EMAIL PAGE ERROR:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setMessage("");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (cooldown > 0) {
      return;
    }

    try {
      setResending(true);

      const response = await fetch(
        "/api/auth/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to resend the verification code."
        );
        return;
      }

      setMessage(
        data.message ||
          "A new verification code has been sent."
      );

      setCooldown(60);
      setCode("");
    } catch (error) {
      console.error(
        "RESEND VERIFICATION PAGE ERROR:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-6 py-12">
        <div className="w-full">
          {/* Brand */}
          <div className="mb-10 text-center">
            <div className="mb-4 text-3xl font-semibold tracking-tight">
              Kometik
            </div>

            <div className="mx-auto h-px w-12 bg-black/20 dark:bg-white/20" />
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-neutral-950 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-9">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-black/10 bg-black/[0.03] text-2xl dark:border-white/10 dark:bg-white/[0.04]">
                ✉
              </div>

              <h1 className="text-2xl font-semibold tracking-tight">
                Verify your email
              </h1>

              <p className="mt-3 text-sm leading-6 text-black/60 dark:text-white/60">
                We sent a 6-digit verification code
                to your email address.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="kometik-space-y-5"
            >
              {/* Email */}
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
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                    setMessage("");
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-black/10 bg-transparent px-4 py-3.5 text-sm outline-none transition focus:border-black dark:border-white/10 dark:focus:border-white"
                  required
                />
              </div>

              {/* Code */}
              <div>
                <label
                  htmlFor="code"
                  className="mb-2 block text-sm font-medium"
                >
                  Verification code
                </label>

                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={code}
                  onChange={(event) =>
                    handleCodeChange(
                      event.target.value
                    )
                  }
                  placeholder="000000"
                  autoComplete="one-time-code"
                  className="w-full rounded-2xl border border-black/10 bg-transparent px-4 py-4 text-center text-2xl font-semibold tracking-[0.45em] outline-none transition focus:border-black dark:border-white/10 dark:focus:border-white"
                  required
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Success */}
              {message && (
                <div className="rounded-2xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-700 dark:text-green-400">
                  {message}
                </div>
              )}

              {/* Verify */}
              <button
                type="submit"
                disabled={
                  loading ||
                  code.length !== 6
                }
                className="w-full rounded-2xl bg-black px-4 py-3.5 text-sm font-medium text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/85"
              >
                {loading
                  ? "Verifying..."
                  : "Verify email"}
              </button>

              {/* Resend */}
              <button
                type="button"
                onClick={handleResend}
                disabled={
                  resending ||
                  cooldown > 0
                }
                className="w-full rounded-2xl border border-black/10 px-4 py-3.5 text-sm font-medium transition hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/[0.04]"
              >
                {resending
                  ? "Sending..."
                  : cooldown > 0
                    ? `Resend code in ${cooldown}s`
                    : "Resend verification code"}
              </button>
            </form>

            <div className="mt-7 text-center text-xs leading-5 text-black/45 dark:text-white/45">
              The verification code expires after
              10 minutes.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-sm text-black/60 dark:text-white/60">
              Loading...
            </div>
          </div>
        </main>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
