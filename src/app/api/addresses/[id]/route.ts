import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/user";

// ==========================================
// PUT /api/addresses/:id
// Update address
// ==========================================

export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
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

    const { id } =
      await context.params;

    const existingAddress =
      await prisma.address.findFirst({
        where: {
          id,
          userId: user.id,
        },
      });

    if (!existingAddress) {
      return NextResponse.json(
        {
          message: "Address not found",
        },
        {
          status: 404,
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
          message: "City is required",
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
    // DEFAULT ADDRESS RULE
    // ======================================

    // If the current address is default,
    // we must keep it default unless another
    // address is explicitly selected as default.

    if (
      existingAddress.isDefault &&
      !isDefault
    ) {
      return NextResponse.json(
        {
          message:
            "At least one default address is required",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================
    // UPDATE
    // ======================================

    const updatedAddress =
      await prisma.$transaction(
        async (tx) => {
          if (isDefault) {
            await tx.address.updateMany({
              where: {
                userId: user.id,
                isDefault: true,
                NOT: {
                  id,
                },
              },
              data: {
                isDefault: false,
              },
            });
          }

          return tx.address.update({
            where: {
              id,
            },
            data: {
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

              isDefault,
            },
          });
        }
      );

    return NextResponse.json({
      address: updatedAddress,
    });
  } catch (error) {
    console.error(
      "PUT ADDRESS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update address",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// DELETE /api/addresses/:id
// Delete address
// ==========================================

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
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

    const { id } =
      await context.params;

    const existingAddress =
      await prisma.address.findFirst({
        where: {
          id,
          userId: user.id,
        },
      });

    if (!existingAddress) {
      return NextResponse.json(
        {
          message: "Address not found",
        },
        {
          status: 404,
        }
      );
    }

    // ======================================
    // DELETE
    // ======================================

    await prisma.address.delete({
      where: {
        id,
      },
    });

    // ======================================
    // REPLACE DEFAULT ADDRESS
    // ======================================

    if (existingAddress.isDefault) {
      const nextAddress =
        await prisma.address.findFirst({
          where: {
            userId: user.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      if (nextAddress) {
        await prisma.address.update({
          where: {
            id: nextAddress.id,
          },
          data: {
            isDefault: true,
          },
        });
      }
    }

    return NextResponse.json({
      message:
        "Address deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE ADDRESS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to delete address",
      },
      {
        status: 500,
      }
    );
  }
}