import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import {
  requireAdmin,
  AdminAuthError,
} from "@/lib/admin-auth";


// ==========================================
// CLOUDINARY CONFIG
// ==========================================

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,
});


// ==========================================
// POST /api/admin/cloudinary/sign
// ==========================================

export async function POST(
  request: NextRequest
) {
  try {
    await requireAdmin(request);

    const body =
      await request.json();

    const paramsToSign =
      body.paramsToSign;


    if (
      !paramsToSign ||
      typeof paramsToSign !== "object"
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid parameters",
        },
        {
          status: 400,
        }
      );
    }


    const signature =
      cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET as string
      );


    return NextResponse.json({
      signature,

      apiKey:
        process.env
          .NEXT_PUBLIC_CLOUDINARY_API_KEY,
    });

  } catch (error) {

    if (
      error instanceof AdminAuthError
    ) {
      return NextResponse.json(
        {
          message:
            error.message,
        },
        {
          status:
            error.status,
        }
      );
    }


    console.error(
      "CLOUDINARY SIGN ERROR:",
      error
    );


    return NextResponse.json(
      {
        message:
          "Failed to generate upload signature",
      },
      {
        status: 500,
      }
    );
  }
}