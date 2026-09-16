import Link from "next/link";

import {
  Check,
  ShoppingBag,
  ArrowRight,
  ClipboardList,
} from "lucide-react";

// ==========================================
// TYPES
// ==========================================

type SuccessPageProps = {
  searchParams: Promise<{
    orderId?: string;
  }>;
};

// ==========================================
// CHECKOUT SUCCESS PAGE
// ==========================================

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params =
    await searchParams;

  const orderId =
    params.orderId;

  // ==========================================
  // PAGE
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
      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <section
        className="
          mx-auto
          flex
          min-h-[78vh]
          max-w-4xl
          items-center
          justify-center
          px-4
          py-16
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            w-full
            max-w-2xl
            text-center
          "
        >
          {/* ==================================================
              SUCCESS ICON
          ================================================== */}

          <div
            className="
              mx-auto
              flex
              h-24
              w-24
              items-center
              justify-center
              rounded-full
              bg-(--brick-50)
              text-(--brick-600)
              ring-8
              ring-(--brick-50)
            "
          >
            <Check
              size={42}
              strokeWidth={2}
            />
          </div>

          {/* ==================================================
              BRAND
          ================================================== */}

          <p
            className="
              mt-8
              text-xs
              font-semibold
              uppercase
              tracking-[0.25em]
              text-(--brick-500)
            "
          >
            Kometik
          </p>

          {/* ==================================================
              TITLE
          ================================================== */}

          <h1
            className="
              mt-3
              text-3xl
              font-bold
              tracking-tight
              text-(--olive-900)
              sm:text-4xl
            "
          >
            تم تأكيد طلبك بنجاح
          </h1>

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <p
            className="
              mx-auto
              mt-4
              max-w-xl
              leading-8
              text-(--olive-600)
            "
          >
            شكرًا لك على طلبك.
            <br />
            تم استلام طلبك وسيتم التعامل
            معه في أقرب وقت ممكن.
          </p>

          {/* ==================================================
              ORDER ID
          ================================================== */}

          {orderId && (
            <div
              className="
                mx-auto
                mt-8
                max-w-md
                rounded-2xl
                border
                border-(--olive-200)
                bg-white
                p-5
                shadow-[var(--shadow-soft)]
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-(--brick-600)
                "
              >
                <ClipboardList
                  size={17}
                  strokeWidth={1.9}
                />

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.15em]
                  "
                >
                  رقم الطلب
                </p>
              </div>

              <p
                dir="ltr"
                className="
                  mt-3
                  break-all
                  font-mono
                  text-sm
                  font-semibold
                  text-(--olive-900)
                "
              >
                {orderId}
              </p>
            </div>
          )}

          {/* ==================================================
              STATUS CARD
          ================================================== */}

          <div
            className="
              mx-auto
              mt-6
              max-w-md
              rounded-2xl
              border
              border-(--olive-200)
              bg-(--olive-50)
              p-5
              text-right
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-(--brick-100)
                  text-(--brick-700)
                "
              >
                <Check
                  size={17}
                  strokeWidth={2}
                />
              </div>

              <div>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-(--olive-900)
                  "
                >
                  تم استلام طلبك
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-(--olive-600)
                  "
                >
                  يمكنك متابعة حالة طلبك من
                  خلال صفحة طلباتي في حسابك.
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div
            className="
              mt-8
              flex
              flex-col
              justify-center
              gap-3
              sm:flex-row
            "
          >
            {/* ORDERS */}

            <Link
              href="/account/orders"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-(--brick-600)
                px-6
                py-3.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-(--brick-700)
              "
            >
              <ClipboardList
                size={17}
                strokeWidth={1.9}
              />

              طلباتي
            </Link>

            {/* SHOP */}

            <Link
              href="/shop"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-(--olive-300)
                bg-white
                px-6
                py-3.5
                text-sm
                font-semibold
                text-(--olive-900)
                transition
                hover:border-(--brick-200)
                hover:bg-(--olive-50)
                hover:text-(--brick-700)
              "
            >
              <ShoppingBag
                size={17}
                strokeWidth={1.9}
              />

              متابعة التسوق
            </Link>
          </div>

          {/* ==================================================
              BACK
          ================================================== */}

          <Link
            href="/"
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              text-sm
              font-medium
              text-(--olive-600)
              transition
              hover:text-(--brick-600)
            "
          >
            <ArrowRight
              size={16}
              strokeWidth={1.8}
            />

            العودة إلى الرئيسية
          </Link>
        </div>
      </section>
    </main>
  );
}
