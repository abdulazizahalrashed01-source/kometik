import { NextResponse } from "next/server";


// ==========================================
// POST /api/auth/logout
// ==========================================

export async function POST() {
  try {

    const response =
      NextResponse.json(
        {
          message:
            "Logout successful",
        },
        {
          status: 200,
        }
      );


    // ----------------------------------------
    // Delete authentication cookie
    // ----------------------------------------

    response.cookies.set(
      "auth_token",
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
      "LOGOUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}