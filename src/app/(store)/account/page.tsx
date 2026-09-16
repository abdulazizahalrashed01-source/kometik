import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowLeft,
  ClipboardList,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth/user";

// ==========================================
// ACCOUNT PAGE
// ==========================================

export default async function AccountPage() {
  // ==========================================
  // GET CURRENT USER
  // ==========================================

  const user =
    await getCurrentUser();

  // ==========================================
  // PROTECT ACCOUNT
  // ==========================================

  if (!user) {
    redirect("/auth");
  }

  // ==========================================
  // DISPLAY NAME
  // ==========================================

  const displayName =
    user.name?.trim() ||
    user.email.split("@")[0];

  const initial =
    displayName
      .charAt(0)
      .toUpperCase();

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-(--background)
        text-(--foreground)
      "
    >
      <div
        className="
          mx-auto
          max-w-6xl
          px-4
          py-10
          sm:px-6
          lg:px-8
          lg:py-14
        "
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8">
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
            حسابي
          </h1>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-(--olive-600)
            "
          >
            أهلاً بك، {displayName}. من هنا يمكنك
            إدارة حسابك وطلباتك.
          </p>
        </div>

        {/* ==================================================
            USER CARD
        ================================================== */}

        <div
          className="
            mb-7
            overflow-hidden
            rounded-[1.75rem]
            border
            border-(--olive-200)
            bg-white
            shadow-[var(--shadow-soft)]
          "
        >
          {/* TOP ACCENT */}

          <div
            className="
              h-1.5
              bg-(--brick-600)
            "
          />

          <div
            className="
              flex
              flex-col
              gap-5
              p-6
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:p-7
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
              {/* AVATAR */}

              <div
                className="
                  flex
                  h-16
                  w-16
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-(--brick-50)
                  text-xl
                  font-bold
                  text-(--brick-700)
                  ring-1
                  ring-(--brick-200)
                "
              >
                {initial}
              </div>

              {/* DETAILS */}

              <div className="min-w-0">
                <h2
                  className="
                    truncate
                    text-lg
                    font-bold
                    text-(--olive-900)
                  "
                >
                  {displayName}
                </h2>

                <p
                  dir="ltr"
                  className="
                    mt-1
                    truncate
                    text-sm
                    text-(--olive-600)
                  "
                >
                  {user.email}
                </p>
              </div>
            </div>

            {/* PROFILE */}

            <Link
              href="/account/profile"
              className="
                inline-flex
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
                hover:bg-(--olive-50)
                hover:text-(--brick-700)
              "
            >
              <UserRound
                size={16}
                strokeWidth={1.8}
              />

              تعديل الملف الشخصي
            </Link>
          </div>
        </div>

        {/* ==================================================
            ACCOUNT CARDS
        ================================================== */}

        <div
          className="
            grid
            gap-5
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >
          {/* ==================================================
              ORDERS
          ================================================== */}

          <Link
            href="/account/orders"
            className="
              group
              rounded-[1.5rem]
              border
              border-(--olive-200)
              bg-white
              p-6
              shadow-[var(--shadow-soft)]
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-(--brick-200)
              hover:shadow-[var(--shadow-card)]
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-(--brick-50)
                text-(--brick-600)
              "
            >
              <ClipboardList
                size={22}
                strokeWidth={1.8}
              />
            </div>

            <h2
              className="
                mt-5
                text-lg
                font-bold
                text-(--olive-900)
              "
            >
              طلباتي
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-(--olive-600)
              "
            >
              استعرض طلباتك السابقة وتابع
              تفاصيل كل طلب.
            </p>

            <div
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-(--brick-600)
                transition
                group-hover:text-(--brick-700)
              "
            >
              عرض الطلبات

              <ArrowLeft
                size={16}
                strokeWidth={2}
              />
            </div>
          </Link>

          {/* ==================================================
              PROFILE
          ================================================== */}

          <Link
            href="/account/profile"
            className="
              group
              rounded-[1.5rem]
              border
              border-(--olive-200)
              bg-white
              p-6
              shadow-[var(--shadow-soft)]
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-(--brick-200)
              hover:shadow-[var(--shadow-card)]
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-(--olive-100)
                text-(--brick-600)
              "
            >
              <UserRound
                size={22}
                strokeWidth={1.8}
              />
            </div>

            <h2
              className="
                mt-5
                text-lg
                font-bold
                text-(--olive-900)
              "
            >
              الملف الشخصي
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-(--olive-600)
              "
            >
              حدّث اسمك وبريدك الإلكتروني
              ومعلومات حسابك.
            </p>

            <div
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-(--brick-600)
                transition
                group-hover:text-(--brick-700)
              "
            >
              إدارة الملف الشخصي

              <ArrowLeft
                size={16}
                strokeWidth={2}
              />
            </div>
          </Link>

          {/* ==================================================
              SHOP
          ================================================== */}

          <Link
            href="/shop"
            className="
              group
              rounded-[1.5rem]
              border
              border-(--olive-200)
              bg-white
              p-6
              shadow-[var(--shadow-soft)]
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-(--brick-200)
              hover:shadow-[var(--shadow-card)]
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-(--olive-100)
                text-(--brick-600)
              "
            >
              <ShoppingBag
                size={22}
                strokeWidth={1.8}
              />
            </div>

            <h2
              className="
                mt-5
                text-lg
                font-bold
                text-(--olive-900)
              "
            >
              متابعة التسوق
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-(--olive-600)
              "
            >
              استكشف المنتجات واكتشف المزيد
              من مستلزمات الجمال والعناية.
            </p>

            <div
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-(--brick-600)
                transition
                group-hover:text-(--brick-700)
              "
            >
              الذهاب إلى المتجر

              <ArrowLeft
                size={16}
                strokeWidth={2}
              />
            </div>
          </Link>
        </div>

        {/* ==================================================
            QUICK LINKS
        ================================================== */}

        <div
          className="
            mt-7
            rounded-[1.5rem]
            border
            border-(--olive-200)
            bg-white
            p-6
            shadow-[var(--shadow-soft)]
          "
        >
          <div>
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.15em]
                text-(--brick-500)
              "
            >
              روابط سريعة
            </p>

            <h2
              className="
                mt-1
                text-lg
                font-bold
                text-(--olive-900)
              "
            >
              الوصول السريع
            </h2>
          </div>

          <div
            className="
              mt-5
              flex
              flex-wrap
              gap-3
            "
          >
            <Link
              href="/shop"
              className="
                rounded-xl
                border
                border-(--olive-200)
                bg-(--olive-50)
                px-4
                py-2.5
                text-sm
                font-medium
                text-(--olive-700)
                transition
                hover:border-(--brick-200)
                hover:bg-(--brick-50)
                hover:text-(--brick-700)
              "
            >
              المتجر
            </Link>

            <Link
              href="/cart"
              className="
                rounded-xl
                border
                border-(--olive-200)
                bg-(--olive-50)
                px-4
                py-2.5
                text-sm
                font-medium
                text-(--olive-700)
                transition
                hover:border-(--brick-200)
                hover:bg-(--brick-50)
                hover:text-(--brick-700)
              "
            >
              السلة
            </Link>

            <Link
              href="/checkout"
              className="
                rounded-xl
                border
                border-(--olive-200)
                bg-(--olive-50)
                px-4
                py-2.5
                text-sm
                font-medium
                text-(--olive-700)
                transition
                hover:border-(--brick-200)
                hover:bg-(--brick-50)
                hover:text-(--brick-700)
              "
            >
              إتمام الطلب
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
