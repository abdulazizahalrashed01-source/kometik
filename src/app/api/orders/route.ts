import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/user";

// ==========================================
// TYPES
// ==========================================

type CheckoutCustomer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
};

type CheckoutItem = {
  productId: string;
  quantity: number;
};

// ==========================================
// GET /api/orders
// Get current user's orders
// ==========================================

export async function GET(
  request: NextRequest
) {
  try {
    // ========================================
    // CURRENT USER
    // ========================================

    const user =
      await getCurrentUser(request);

    if (!user) {
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

    // ========================================
    // GET ORDERS
    // ========================================

    const orders =
      await prisma.order.findMany({
        where: {
          userId: user.id,
        },

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          shippingAddress: true,
          shippingCity: true,
          shippingPostalCode: true,
          subtotal: true,
          shipping: true,
          total: true,
          status: true,
          createdAt: true,

          items: {
            select: {
              id: true,
              productId: true,
              name: true,
              price: true,
              quantity: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        orders,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET ORDERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to load orders",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// POST /api/orders
// Create order
// ==========================================

export async function POST(
  request: NextRequest
) {
  try {
    // ========================================
    // CURRENT USER
    // ========================================

    const user =
      await getCurrentUser(request);

    // ========================================
    // READ BODY
    // ========================================

    const body =
      await request.json();

    const customer =
      body.customer as CheckoutCustomer;

    const items =
      body.items as CheckoutItem[];

    // ========================================
    // VALIDATE CUSTOMER
    // ========================================

    if (
      !customer ||
      typeof customer !== "object"
    ) {
      return NextResponse.json(
        {
          message:
            "Customer information is required",
        },
        {
          status: 400,
        }
      );
    }

    const name =
      typeof customer.name === "string"
        ? customer.name.trim()
        : "";

    const email =
      typeof customer.email === "string"
        ? customer.email
            .trim()
            .toLowerCase()
        : "";

    const phone =
      typeof customer.phone === "string"
        ? customer.phone.trim()
        : "";

    const address =
      typeof customer.address === "string"
        ? customer.address.trim()
        : "";

    const city =
      typeof customer.city === "string"
        ? customer.city.trim()
        : "";

    const postalCode =
      typeof customer.postalCode ===
      "string"
        ? customer.postalCode.trim()
        : "";

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

    if (!email) {
      return NextResponse.json(
        {
          message:
            "Email is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!phone) {
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

    if (!address) {
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

    if (!city) {
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

    if (!postalCode) {
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

    // ========================================
    // VALIDATE ITEMS
    // ========================================

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "Your cart is empty",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // NORMALIZE + VALIDATE ITEMS
    // ========================================

    const normalizedItems =
      items.map((item) => ({
        productId:
          typeof item.productId ===
          "string"
            ? item.productId.trim()
            : "",

        quantity:
          Number.isSafeInteger(
            item.quantity
          )
            ? item.quantity
            : 0,
      }));

    const invalidItem =
      normalizedItems.find(
        (item) =>
          !item.productId ||
          item.quantity <= 0
      );

    if (invalidItem) {
      return NextResponse.json(
        {
          message:
            "Invalid cart item",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // MERGE DUPLICATE PRODUCT IDS
    // ========================================

    const quantityMap =
      new Map<string, number>();

    for (const item of normalizedItems) {
      const currentQuantity =
        quantityMap.get(
          item.productId
        ) ?? 0;

      const newQuantity =
        currentQuantity +
        item.quantity;

      if (
        !Number.isSafeInteger(
          newQuantity
        )
      ) {
        return NextResponse.json(
          {
            message:
              "Invalid product quantity",
          },
          {
            status: 400,
          }
        );
      }

      quantityMap.set(
        item.productId,
        newQuantity
      );
    }

    const normalizedUniqueItems =
      Array.from(
        quantityMap.entries()
      ).map(
        ([productId, quantity]) => ({
          productId,
          quantity,
        })
      );

    const productIds =
      normalizedUniqueItems.map(
        (item) =>
          item.productId
      );

    // ========================================
    // CREATE ORDER + DECREMENT STOCK
    // EVERYTHING MUST HAPPEN IN ONE TRANSACTION
    // ========================================

    let stockError = false;

    let order;

    try {
      order =
        await prisma.$transaction(
          async (tx) => {
            // ==================================
            // GET PRODUCTS FROM DATABASE
            // INSIDE TRANSACTION
            // ==================================

            const products =
              await tx.product.findMany({
                where: {
                  id: {
                    in: productIds,
                  },
                },

                select: {
                  id: true,
                  name: true,
                  price: true,
                  stock: true,
                },
              });

            // ==================================
            // CHECK PRODUCTS EXIST
            // ==================================

            if (
              products.length !==
              productIds.length
            ) {
              throw new Error(
                "PRODUCT_NOT_FOUND"
              );
            }

            // ==================================
            // CREATE QUICK LOOKUP MAP
            // ==================================

            const productMap =
              new Map(
                products.map(
                  (product) => [
                    product.id,
                    product,
                  ]
                )
              );

            // ==================================
            // CHECK + DECREMENT STOCK
            // ==================================

            for (
              const item of
                normalizedUniqueItems
            ) {
              const product =
                productMap.get(
                  item.productId
                );

              if (!product) {
                throw new Error(
                  "PRODUCT_NOT_FOUND"
                );
              }

              // ==================================
              // ATOMIC STOCK UPDATE
              // ==================================

              const updated =
                await tx.product.updateMany({
                  where: {
                    id: product.id,
                    stock: {
                      gte: item.quantity,
                    },
                  },

                  data: {
                    stock: {
                      decrement:
                        item.quantity,
                    },
                  },
                });

              if (
                updated.count !== 1
              ) {
                stockError = true;

                throw new Error(
                  `INSUFFICIENT_STOCK:${product.name}`
                );
              }
            }

            // ==================================
            // BUILD ORDER ITEMS
            // USING DATABASE PRICES
            // ==================================

            let subtotal = 0;

            const orderItems =
              normalizedUniqueItems.map(
                (item) => {
                  const product =
                    productMap.get(
                      item.productId
                    );

                  if (!product) {
                    throw new Error(
                      "PRODUCT_NOT_FOUND"
                    );
                  }

                  const itemTotal =
                    product.price *
                    item.quantity;

                  subtotal += itemTotal;

                  return {
                    productId:
                      product.id,
                    name:
                      product.name,
                    price:
                      product.price,
                    quantity:
                      item.quantity,
                  };
                }
              );

            // ==================================
            // SHIPPING
            // ==================================

            const shipping =
              subtotal >= 50
                ? 0
                : 5.99;

            // ==================================
            // TOTAL
            // ==================================

            const total =
              subtotal + shipping;

            // ==================================
            // CREATE ORDER
            // ==================================

            const createdOrder =
              await tx.order.create({
                data: {
                  userId:
                    user?.id ?? null,

                  customerName:
                    name,

                  customerEmail:
                    email,

                  customerPhone:
                    phone,

                  shippingAddress:
                    address,

                  shippingCity:
                    city,

                  shippingPostalCode:
                    postalCode,

                  subtotal,
                  shipping,
                  total,

                  status:
                    "PENDING",

                  items: {
                    create:
                      orderItems,
                  },
                },

                include: {
                  items: true,
                },
              });

            return createdOrder;
          }
        );
    } catch (error) {
      // ======================================
      // HANDLE STOCK ERROR
      // ======================================

      if (stockError) {
        return NextResponse.json(
          {
            message:
              "One or more products do not have enough stock",
          },
          {
            status: 409,
          }
        );
      }

      // ======================================
      // HANDLE KNOWN ERRORS
      // ======================================

      if (
        error instanceof Error
      ) {
        if (
          error.message ===
          "PRODUCT_NOT_FOUND"
        ) {
          return NextResponse.json(
            {
              message:
                "One or more products are no longer available",
            },
            {
              status: 400,
            }
          );
        }

        if (
          error.message.startsWith(
            "INSUFFICIENT_STOCK:"
          )
        ) {
          const productName =
            error.message.replace(
              "INSUFFICIENT_STOCK:",
              ""
            );

          return NextResponse.json(
            {
              message:
                `Insufficient stock for product: ${productName}`,
            },
            {
              status: 409,
            }
          );
        }
      }

      throw error;
    }

    // ========================================
    // RESPONSE
    // ========================================

    return NextResponse.json(
      {
        message:
          "Order created successfully",

        order: {
          id: order.id,
          status:
            order.status,
          subtotal:
            order.subtotal,
          shipping:
            order.shipping,
          total:
            order.total,
          createdAt:
            order.createdAt,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to create order",
      },
      {
        status: 500,
      }
    );
  }
}