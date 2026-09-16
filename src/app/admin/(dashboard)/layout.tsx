import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

import { prisma } from "@/lib/prisma";


// ==========================================
// TYPES
// ==========================================

type AdminLayoutProps = {
  children: React.ReactNode;
};

type AdminToken = {
  id: string;
  role: "ADMIN";
};


// ==========================================
// JWT SECRET
// ==========================================

const JWT_SECRET =
  process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not configured"
  );
}


// ==========================================
// ADMIN LAYOUT
// ==========================================

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {

  // ========================================
  // GET ADMIN TOKEN
  // ========================================

  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      "admin_token"
    )?.value;


  // ========================================
  // NO TOKEN
  // ========================================

  if (!token) {
    redirect("/admin/login");
  }


  // ========================================
  // VERIFY TOKEN
  // ========================================

  let decoded: AdminToken;


  try {

    decoded =
      jwt.verify(
        token,
        JWT_SECRET
      ) as AdminToken;

  } catch {

    redirect("/admin/login");

  }


  // ========================================
  // CHECK ROLE
  // ========================================

  if (
    decoded.role !==
    "ADMIN"
  ) {
    redirect("/admin/login");
  }


  // ========================================
  // FIND ADMIN
  // ========================================

  const admin =
    await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },

      select: {
        id: true,
        email: true,
        role: true,
      },
    });


  // ========================================
  // CHECK ADMIN
  // ========================================

  if (
    !admin ||
    admin.role !==
      "ADMIN"
  ) {
    redirect("/admin/login");
  }


  // ========================================
  // ADMIN LAYOUT
  // ========================================

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="flex min-h-screen">


        {/* ==================================
            SIDEBAR
        ================================== */}

        <aside
          className="
            hidden
            w-64
            shrink-0
            border-r
            bg-white
            md:block
          "
        >

          {/* ==================================
              BRAND
          ================================== */}

          <div
            className="
              border-b
              p-6
            "
          >

            <h1
              className="
                text-xl
                font-bold
              "
            >
              Kometik
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
              "
            >
              Admin Panel
            </p>

          </div>


          {/* ==================================
              NAVIGATION
          ================================== */}

          <nav className="p-4">

            <div className="kometik-space-y-1">


              {/* DASHBOARD */}

              <Link
                href="/admin"
                className="
                  block
                  rounded-lg
                  px-4
                  py-3
                  text-sm
                  font-medium
                  hover:bg-gray-100
                "
              >
                Dashboard
              </Link>


              {/* PRODUCTS */}

              <Link
                href="/admin/products"
                className="
                  block
                  rounded-lg
                  px-4
                  py-3
                  text-sm
                  font-medium
                  hover:bg-gray-100
                "
              >
                Products
              </Link>


              {/* CATEGORIES */}

              <Link
                href="/admin/categories"
                className="
                  block
                  rounded-lg
                  px-4
                  py-3
                  text-sm
                  font-medium
                  hover:bg-gray-100
                "
              >
                Categories
              </Link>


              {/* COLLECTIONS */}

              <Link
                href="/admin/collections"
                className="
                  block
                  rounded-lg
                  px-4
                  py-3
                  text-sm
                  font-medium
                  hover:bg-gray-100
                "
              >
                Collections
              </Link>


              {/* TAGS */}

              <Link
                href="/admin/tags"
                className="
                  block
                  rounded-lg
                  px-4
                  py-3
                  text-sm
                  font-medium
                  hover:bg-gray-100
                "
              >
                Tags
              </Link>


              {/* ORDERS */}

              <Link
                href="/admin/orders"
                className="
                  block
                  rounded-lg
                  px-4
                  py-3
                  text-sm
                  font-medium
                  hover:bg-gray-100
                "
              >
                Orders
              </Link>


              {/* USERS */}

              <Link
                href="/admin/users"
                className="
                  block
                  rounded-lg
                  px-4
                  py-3
                  text-sm
                  font-medium
                  hover:bg-gray-100
                "
              >
                Users
              </Link>

            </div>


            {/* ==================================
                DIVIDER
            ================================== */}

            <div
              className="
                my-6
                border-t
              "
            />


            {/* ==================================
                BACK TO SHOP
            ================================== */}

            <Link
              href="/shop"
              className="
                block
                rounded-lg
                px-4
                py-3
                text-sm
                text-gray-600
                hover:bg-gray-100
              "
            >
              ← Back to Shop
            </Link>

          </nav>

        </aside>


        {/* ==================================
            MAIN
        ================================== */}

        <div
          className="
            flex
            min-w-0
            flex-1
            flex-col
          "
        >


          {/* ==================================
              HEADER
          ================================== */}

          <header
            className="
              border-b
              bg-white
            "
          >

            <div
              className="
                flex
                h-16
                items-center
                justify-between
                px-6
              "
            >


              {/* ==================================
                  TITLE
              ================================== */}

              <div>

                <h2
                  className="
                    font-semibold
                  "
                >
                  Admin Dashboard
                </h2>

              </div>


              {/* ==================================
                  ADMIN
              ================================== */}

              <div
                className="
                  flex
                  items-center
                  gap-4
                "
              >


                {/* ==================================
                    ADMIN INFO
                ================================== */}

                <div
                  className="
                    hidden
                    text-right
                    sm:block
                  "
                >

                  <p
                    className="
                      text-sm
                      font-medium
                    "
                  >
                    {admin.email}
                  </p>

                  <p
                    className="
                      text-xs
                      text-gray-500
                    "
                  >
                    Administrator
                  </p>

                </div>


                {/* ==================================
                    LOGOUT
                ================================== */}

                <form
                  action="/api/admin/auth/logout"
                  method="POST"
                >

                  <button
                    type="submit"
                    className="
                      rounded-lg
                      border
                      px-4
                      py-2
                      text-sm
                      hover:bg-gray-50
                    "
                  >
                    Logout
                  </button>

                </form>

              </div>

            </div>

          </header>


          {/* ==================================
              CONTENT
          ================================== */}

          <main
            className="
              flex-1
              p-6
            "
          >

            {children}

          </main>

        </div>

      </div>

    </div>
  );
}