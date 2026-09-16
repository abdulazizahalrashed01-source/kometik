import {
  NextRequest,
  NextResponse,
} from "next/server";

import { v2 as cloudinary } from "cloudinary";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/user";


// ==========================================
// Cloudinary configuration
// ==========================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// ==========================================
// Constants
// ==========================================

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB


// ==========================================
// GET /api/account/profile
// ==========================================

export async function GET() {
  try {
    const currentUser =
      await getCurrentUser();

    // ----------------------------------------
    // Authentication
    // ----------------------------------------

    if (!currentUser) {
      return NextResponse.json(
        {
          message:
            "Authentication required",
        },
        {
          status: 401,
        }
      );
    }


    // ----------------------------------------
    // Get user
    // ----------------------------------------

    const user =
      await prisma.user.findUnique({
        where: {
          id: currentUser.id,
        },

        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
          role: true,
        },
      });


    // ----------------------------------------
    // User not found
    // ----------------------------------------

    if (!user) {
      return NextResponse.json(
        {
          message:
            "User not found",
        },
        {
          status: 404,
        }
      );
    }


    // ----------------------------------------
    // Only normal users
    // ----------------------------------------

    if (user.role !== "USER") {
      return NextResponse.json(
        {
          message:
            "User account required",
        },
        {
          status: 403,
        }
      );
    }


    return NextResponse.json({
      user,
    });

  } catch (error) {

    console.error(
      "GET PROFILE ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load profile",
      },
      {
        status: 500,
      }
    );
  }
}


// ==========================================
// PATCH /api/account/profile
//
// Accepts:
// multipart/form-data
//
// Fields:
// - name: string
// - image: File (optional)
// - removeImage: "true" | "false" (optional)
//
// ==========================================

export async function PATCH(
  request: NextRequest
) {
  try {

    // ----------------------------------------
    // Authentication
    // ----------------------------------------

    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          message:
            "Authentication required",
        },
        {
          status: 401,
        }
      );
    }


    // ----------------------------------------
    // Get current user
    // ----------------------------------------

    const existingUser =
      await prisma.user.findUnique({
        where: {
          id: currentUser.id,
        },

        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
          role: true,
        },
      });


    if (!existingUser) {
      return NextResponse.json(
        {
          message:
            "User not found",
        },
        {
          status: 404,
        }
      );
    }


    // ----------------------------------------
    // Only normal users
    // ----------------------------------------

    if (existingUser.role !== "USER") {
      return NextResponse.json(
        {
          message:
            "User account required",
        },
        {
          status: 403,
        }
      );
    }


    // ----------------------------------------
    // Read multipart/form-data
    // ----------------------------------------

    const formData =
      await request.formData();


    // ----------------------------------------
    // Name
    // ----------------------------------------

    const nameValue =
      formData.get("name");

    const name =
      typeof nameValue === "string"
        ? nameValue.trim()
        : "";


    // ----------------------------------------
    // Validate name
    // ----------------------------------------

    if (!name) {
      return NextResponse.json(
        {
          message:
            "Name is required",
        },
        {
          status: 400,
        }
      );
    }


    // ----------------------------------------
    // Remove image
    // ----------------------------------------

    const removeImageValue =
      formData.get("removeImage");

    const removeImage =
      removeImageValue === "true";


    // ----------------------------------------
    // Image
    // ----------------------------------------

    const imageValue =
      formData.get("image");

    let imageUrl =
      existingUser.imageUrl;


    // ========================================
    // Remove current image
    // ========================================

    if (removeImage) {
      imageUrl = null;
    }


    // ========================================
    // Upload new image
    // ========================================

    if (
      imageValue instanceof File &&
      imageValue.size > 0
    ) {

      // --------------------------------------
      // Validate MIME type
      // --------------------------------------

      if (
        !imageValue.type.startsWith(
          "image/"
        )
      ) {
        return NextResponse.json(
          {
            message:
              "Only image files are allowed",
          },
          {
            status: 400,
          }
        );
      }


      // --------------------------------------
      // Validate file size
      // --------------------------------------

      if (
        imageValue.size >
        MAX_IMAGE_SIZE
      ) {
        return NextResponse.json(
          {
            message:
              "Image must be smaller than 5 MB",
          },
          {
            status: 400,
          }
        );
      }


      // --------------------------------------
      // Convert File -> Buffer
      // --------------------------------------

      const arrayBuffer =
        await imageValue.arrayBuffer();

      const buffer =
        Buffer.from(arrayBuffer);


      // --------------------------------------
      // Upload to Cloudinary
      //
      // We use a fixed public_id based on
      // the user ID.
      //
      // This means a new profile image
      // replaces the previous one.
      // --------------------------------------

      const uploadResult =
        await new Promise<{
          secure_url: string;
          public_id: string;
        }>(
          (
            resolve,
            reject
          ) => {

            const uploadStream =
              cloudinary.uploader.upload_stream(
                {
                  folder:
                    "kometik/users/profile",

                  public_id:
                    currentUser.id,

                  resource_type:
                    "image",

                  overwrite:
                    true,

                  invalidate:
                    true,

                  transformation: [
                    {
                      width: 800,
                      height: 800,
                      crop: "fill",
                      gravity: "face",
                      quality: "auto",
                      fetch_format: "auto",
                    },
                  ],
                },

                (
                  error,
                  result
                ) => {

                  if (
                    error ||
                    !result
                  ) {
                    reject(
                      error ??
                        new Error(
                          "Cloudinary upload failed"
                        )
                    );

                    return;
                  }


                  resolve({
                    secure_url:
                      result.secure_url,

                    public_id:
                      result.public_id,
                  });
                }
              );


            uploadStream.end(buffer);
          }
        );


      imageUrl =
        uploadResult.secure_url;
    }


    // ========================================
    // Update user
    // ========================================

    const user =
      await prisma.user.update({
        where: {
          id: currentUser.id,
        },

        data: {
          name,

          imageUrl,
        },

        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
          role: true,
        },
      });


    // ========================================
    // Response
    // ========================================

    return NextResponse.json({
      message:
        "Profile updated successfully",

      user,
    });

  } catch (error) {

    console.error(
      "UPDATE PROFILE ERROR:",
      error
    );


    return NextResponse.json(
      {
        message:
          "Failed to update profile",
      },
      {
        status: 500,
      }
    );
  }
} 