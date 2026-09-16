"use client";

import Link from "next/link";
import {
  ArrowUpLeft,
  X,
  LogOut,
  UserRound,
} from "lucide-react";

import {
  useEffect,
} from "react";

type NavigationItem = {
  number: string;
  name: string;
  href: string;
};

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  authChecking: boolean;
  loggingOut: boolean;
  onLogout: () => void;
  navigation: NavigationItem[];
};

export default function MobileMenu({
  open,
  onClose,
  isLoggedIn,
  authChecking,
  loggingOut,
  onLogout,
  navigation,
}: MobileMenuProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const oldOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        oldOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      dir="rtl"
      className="
        fixed
        inset-0
        z-[90]
        lg:hidden
      "
    >
      <button
        type="button"
        aria-label="إغلاق القائمة"
        onClick={onClose}
        className="
          absolute
          inset-0
          bg-black/25
          backdrop-blur-sm
        "
      />

      <aside
        className="
          absolute
          bottom-0
          right-0
          top-0
          flex
          w-[min(88vw,420px)]
          flex-col
          bg-[#F4F0E8]
          px-6
          py-6
          shadow-[-20px_0_60px_rgba(23,23,23,0.12)]
          animate-[mobileMenuIn_420ms_ease-out]
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
          "
        >
          <Link
            href="/"
            onClick={onClose}
            className="
              flex
              items-center
              gap-3
            "
          >
            <span
              className="
                h-10
                w-px
                bg-[#B76552]
              "
            />

            <span>
              <span
                className="
                  block
                  text-xl
                  font-semibold
                  tracking-tight
                  text-[#171717]
                "
              >
                Kometik
              </span>

              <span
                className="
                  mt-1
                  block
                  text-[8px]
                  tracking-[0.3em]
                  text-[#66705A]
                "
              >
                BEAUTY / CARE
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-[#66705A]/20
              text-[#4F5946]
              transition
              hover:bg-[#DED5C8]
              hover:text-[#B76552]
            "
          >
            <X
              size={19}
              strokeWidth={1.7}
            />
          </button>
        </div>

        <nav className="mt-14">
          {navigation.map(
            (item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="
                  group
                  flex
                  items-center
                  justify-between
                  border-b
                  border-[#66705A]/15
                  py-5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-4
                  "
                >
                  <span
                    className="
                      font-serif
                      text-xs
                      text-[#B76552]
                    "
                  >
                    {item.number}
                  </span>

                  <span
                    className="
                      text-lg
                      font-medium
                      text-[#171717]
                      transition
                      group-hover:text-[#B76552]
                    "
                  >
                    {item.name}
                  </span>
                </div>

                <ArrowUpLeft
                  size={18}
                  strokeWidth={1.5}
                  className="
                    text-[#66705A]/40
                    transition
                    duration-300
                    group-hover:-translate-x-1
                    group-hover:-translate-y-1
                    group-hover:text-[#B76552]
                  "
                />
              </Link>
            )
          )}
        </nav>

        <div className="mt-auto">
          <Link
            href={
              isLoggedIn
                ? "/account"
                : "/auth"
            }
            onClick={onClose}
            className="
              flex
              items-center
              gap-3
              border-t
              border-[#66705A]/15
              py-5
              text-sm
              font-medium
              text-[#4F5946]
            "
          >
            <UserRound
              size={18}
              strokeWidth={1.6}
            />

            <span>
              {authChecking
                ? "الحساب"
                : isLoggedIn
                  ? "حسابي"
                  : "تسجيل الدخول"}
            </span>
          </Link>

          {!authChecking &&
            isLoggedIn && (
              <button
                type="button"
                onClick={onLogout}
                disabled={loggingOut}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  border-t
                  border-[#66705A]/15
                  py-5
                  text-sm
                  font-medium
                  text-[#B76552]
                  disabled:opacity-50
                "
              >
                <LogOut
                  size={18}
                  strokeWidth={1.6}
                />

                {loggingOut
                  ? "جارٍ تسجيل الخروج..."
                  : "تسجيل الخروج"}
              </button>
            )}

          <p
            className="
              mt-5
              text-[9px]
              uppercase
              tracking-[0.32em]
              text-[#66705A]/55
            "
          >
            BEAUTY / CARE / RITUAL
          </p>
        </div>
      </aside>
</div>
  );
}