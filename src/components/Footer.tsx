import Link from "next/link";

export default function Footer() {
  return (
    <footer
      dir="rtl"
      className="
        border-t
        border-(--olive-200)
        bg-(--surface)
        text-(--olive-900)
      "
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ==================================================
            MAIN
        ================================================== */}

        <div
          className="
            grid
            gap-10
            py-14
            sm:grid-cols-2
            lg:grid-cols-4
            lg:py-16
          "
        >

          {/* ==================================================
              BRAND
          ================================================== */}

          <div>
            <Link
              href="/"
              className="
                inline-block
                text-2xl
                font-bold
                tracking-[0.12em]
                text-(--olive-900)
                transition-colors
                hover:text-(--brick-600)
              "
            >
              KOMETIK
            </Link>

            <p
              className="
                mt-4
                max-w-xs
                text-sm
                leading-7
                text-(--olive-600)
              "
            >
              اكتشف منتجات مختارة بعناية
              للعناية بالبشرة والجمال،
              مصممة لتكون جزءًا من روتينك
              اليومي.
            </p>

            <div
              className="
                mt-5
                h-1
                w-12
                rounded-full
                bg-(--brick-600)
              "
            />
          </div>

          {/* ==================================================
              SHOP
          ================================================== */}

          <div>
            <h3
              className="
                text-sm
                font-bold
                text-(--olive-900)
              "
            >
              المتجر
            </h3>

            <ul className="mt-5 kometik-space-y-3">
              <li>
                <Link
                  href="/shop"
                  className="
                    text-sm
                    text-(--olive-600)
                    transition-colors
                    hover:text-(--brick-600)
                  "
                >
                  جميع المنتجات
                </Link>
              </li>

              <li>
                <Link
                  href="/shop/categories"
                  className="
                    text-sm
                    text-(--olive-600)
                    transition-colors
                    hover:text-(--brick-600)
                  "
                >
                  التصنيفات
                </Link>
              </li>

              <li>
                <Link
                  href="/shop/products"
                  className="
                    text-sm
                    text-(--olive-600)
                    transition-colors
                    hover:text-(--brick-600)
                  "
                >
                  أحدث المنتجات
                </Link>
              </li>

              <li>
                <Link
                  href="/blog"
                  className="
                    text-sm
                    text-(--olive-600)
                    transition-colors
                    hover:text-(--brick-600)
                  "
                >
                  المدونة
                </Link>
              </li>
            </ul>
          </div>

          {/* ==================================================
              CUSTOMER SERVICE
          ================================================== */}

          <div>
            <h3
              className="
                text-sm
                font-bold
                text-(--olive-900)
              "
            >
              خدمة العملاء
            </h3>

            <ul className="mt-5 kometik-space-y-3">
              <li>
                <Link
                  href="/account"
                  className="
                    text-sm
                    text-(--olive-600)
                    transition-colors
                    hover:text-(--brick-600)
                  "
                >
                  حسابي
                </Link>
              </li>

              <li>
                <Link
                  href="/account/orders"
                  className="
                    text-sm
                    text-(--olive-600)
                    transition-colors
                    hover:text-(--brick-600)
                  "
                >
                  طلباتي
                </Link>
              </li>

              <li>
                <Link
                  href="/cart"
                  className="
                    text-sm
                    text-(--olive-600)
                    transition-colors
                    hover:text-(--brick-600)
                  "
                >
                  سلة المشتريات
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="
                    text-sm
                    text-(--olive-600)
                    transition-colors
                    hover:text-(--brick-600)
                  "
                >
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </div>

          {/* ==================================================
              CONTACT
          ================================================== */}

          <div>
            <h3
              className="
                text-sm
                font-bold
                text-(--olive-900)
              "
            >
              تواصل معنا
            </h3>

            <ul className="mt-5 kometik-space-y-3">
              <li>
                <a
                  href="mailto:support@kometik.com"
                  dir="ltr"
                  className="
                    text-sm
                    text-(--olive-600)
                    transition-colors
                    hover:text-(--brick-600)
                  "
                >
                  support@kometik.com
                </a>
              </li>

              <li
                className="
                  text-sm
                  leading-6
                  text-(--olive-600)
                "
              >
                من الإثنين إلى الجمعة
                <br />
                09:00 – 18:00
              </li>
            </ul>

            {/* ==================================================
                SOCIAL
            ================================================== */}

            <div className="mt-6 flex gap-2.5">

              {/* INSTAGRAM */}

              <a
                href="#"
                aria-label="Instagram"
                title="Instagram"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-(--olive-300)
                  bg-(--olive-50)
                  text-sm
                  font-bold
                  text-(--olive-700)
                  transition-all
                  hover:border-(--brick-300)
                  hover:bg-(--brick-50)
                  hover:text-(--brick-600)
                "
              >
                IG
              </a>

              {/* FACEBOOK */}

              <a
                href="#"
                aria-label="Facebook"
                title="Facebook"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-(--olive-300)
                  bg-(--olive-50)
                  text-base
                  font-bold
                  text-(--olive-700)
                  transition-all
                  hover:border-(--brick-300)
                  hover:bg-(--brick-50)
                  hover:text-(--brick-600)
                "
              >
                f
              </a>

              {/* TIKTOK */}

              <a
                href="#"
                aria-label="TikTok"
                title="TikTok"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-(--olive-300)
                  bg-(--olive-50)
                  text-xs
                  font-bold
                  text-(--olive-700)
                  transition-all
                  hover:border-(--brick-300)
                  hover:bg-(--brick-50)
                  hover:text-(--brick-600)
                "
              >
                TT
              </a>
            </div>
          </div>
        </div>

        {/* ==================================================
            BOTTOM
        ================================================== */}

        <div
          className="
            flex
            flex-col
            gap-4
            border-t
            border-(--olive-200)
            py-6
            text-sm
            text-(--olive-600)
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          {/* COPYRIGHT */}

          <p>
            © {new Date().getFullYear()} Kometik.
            جميع الحقوق محفوظة.
          </p>

          {/* LINKS */}

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-5
            "
          >
            <Link
              href="/privacy"
              className="
                transition-colors
                hover:text-(--brick-600)
              "
            >
              الخصوصية
            </Link>

            <Link
              href="/terms"
              className="
                transition-colors
                hover:text-(--brick-600)
              "
            >
              الشروط والأحكام
            </Link>

            <Link
              href="/blog"
              className="
                transition-colors
                hover:text-(--brick-600)
              "
            >
              المدونة
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}