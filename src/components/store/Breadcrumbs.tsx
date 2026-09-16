import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({
  items,
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-8"
      dir="rtl"
    >
      <ol
        className="
          flex
          flex-wrap
          items-center
          gap-1.5
          text-sm
          text-(--olive-500)
        "
      >
        <li className="flex items-center">
          <Link
            href="/"
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-lg
              px-1.5
              py-1
              transition
              hover:bg-(--olive-50)
              hover:text-(--brick-600)
            "
          >
            <Home
              size={15}
              strokeWidth={1.8}
            />

            <span>الرئيسية</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast =
            index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="
                flex
                items-center
                gap-1.5
              "
            >
              <ChevronLeft
                size={15}
                strokeWidth={1.8}
                className="
                  shrink-0
                  text-(--olive-400)
                "
              />

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="
                    rounded-lg
                    px-1.5
                    py-1
                    transition
                    hover:bg-(--olive-50)
                    hover:text-(--brick-600)
                  "
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`
                    rounded-lg
                    px-1.5
                    py-1
                    ${
                      isLast
                        ? "font-semibold text-(--olive-800)"
                        : ""
                    }
                  `}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
