import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/user";

// ==========================================
// GET /api/addresses
// Get current user's addresses
// ==========================================

export async function GET(
  request: NextRequest
) {
  try {
    const user =
      await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const addresses =
      await prisma.address.findMany({
        where: {
          userId: user.id,
        },

        orderBy: [
          {
            isDefault: "desc",
          },
          {
            createdAt: "desc",
          },
        ],
      });

    return NextResponse.json({
      addresses,
    });
  } catch (error) {
    console.error(
      "GET ADDRESSES ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load addresses",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// POST /api/addresses
// Create address
// ==========================================

export async function POST(
  request: NextRequest
) {
  try {
    const user =
      await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const name = body.name;
    const address = body.address;
    const city = body.city;
    const postalCode =
      body.postalCode;
    const phone = body.phone;

    const isDefault =
      body.isDefault === true;

    // ======================================
    // VALIDATION
    // ======================================

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Address name is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof address !== "string" ||
      !address.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Address is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof city !== "string" ||
      !city.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "City is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof postalCode !== "string" ||
      !postalCode.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Postal code is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof phone !== "string" ||
      !phone.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Phone is required",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================
    // CHECK EXISTING ADDRESSES
    // ======================================

    const addressCount =
      await prisma.address.count({
        where: {
          userId: user.id,
        },
      });

    // First address automatically default
    const shouldBeDefault =
      addressCount === 0 ||
      isDefault;

    // ======================================
    // TRANSACTION
    // ======================================

    const addressRecord =
      await prisma.$transaction(
        async (tx) => {
          // Remove default from old
          // addresses if necessary

          if (shouldBeDefault) {
            await tx.address.updateMany({
              where: {
                userId: user.id,
                isDefault: true,
              },

              data: {
                isDefault: false,
              },
            });
          }

          return tx.address.create({
            data: {
              userId: user.id,

              name:
                name.trim(),

              address:
                address.trim(),

              city:
                city.trim(),

              postalCode:
                postalCode.trim(),

              phone:
                phone.trim(),

              isDefault:
                shouldBeDefault,
            },
          });
        }
      );

    return NextResponse.json(
      {
        address: addressRecord,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST ADDRESS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to create address",
      },
      {
        status: 500,
      }
    );
  }
}