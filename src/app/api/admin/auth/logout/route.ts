import { NextResponse } from "next/server";


// ==========================================
// POST /api/admin/auth/logout
// ==========================================

export async function POST() {
  try {

    const response =
      NextResponse.json(
        {
          message:
            "Admin logout successful",
        },
        {
          status: 200,
        }
      );


    // ----------------------------------------
    // Delete admin authentication cookie
    // ----------------------------------------

    response.cookies.set(
      "admin_token",
      "",
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite: "lax",

        expires: new Date(0),

        path: "/",
      }
    );


    return response;

  } catch (error) {

    console.error(
      "ADMIN LOGOUT ERROR:",
      error
    );


    return NextResponse.json(
      {
        message:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}