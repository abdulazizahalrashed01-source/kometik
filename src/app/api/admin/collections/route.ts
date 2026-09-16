
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";

import {
  AdminAuthError,
  requireAdmin,
} from "@/lib/admin-auth";


// =========================================================
// SLUG HELPER
// =========================================================

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}


// =========================================================
// GET COLLECTIONS
// =========================================================

export async function GET(
  request: NextRequest
) {
  try {

    // ==========================================
    // AUTH
    // ==========================================

    await requireAdmin(request);


    // ==========================================
    // GET COLLECTIONS
    // ==========================================

    const collections =
      await prisma.collection.findMany({
        orderBy: {
          createdAt: "desc",
        },

        include: {
          tag: true,

          _count: {
            select: {
              products: true,
            },
          },
        },
      });


    return NextResponse.json({
      collections,
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
      "GET ADMIN COLLECTIONS ERROR:",
      error
    );


    return NextResponse.json(
      {
        message:
          "تعذر تحميل المجموعات.",
      },
      {
        status: 500,
      }
    );
  }
}


// =========================================================
// CREATE COLLECTION
// =========================================================

export async function POST(
  request: NextRequest
) {
  try {

    // ==========================================
    // AUTH
    // ==========================================

    await requireAdmin(request);


    // ==========================================
    // BODY
    // ==========================================

    const body =
      await request.json();


    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";


    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";


    const imageUrl =
      typeof body.imageUrl === "string"
        ? body.imageUrl.trim()
        : "";


    const imagePublicId =
      typeof body.imagePublicId === "string"
        ? body.imagePublicId.trim()
        : "";


    const active =
      typeof body.active === "boolean"
        ? body.active
        : true;


    const type =
      body.type === "TAG"
        ? "TAG"
        : "MANUAL";


    const tagId =
      typeof body.tagId === "string" &&
      body.tagId.trim()
        ? body.tagId.trim()
        : null;


    // ==========================================
    // VALIDATION - NAME
    // ==========================================

    if (!name) {
      return NextResponse.json(
        {
          message:
            "اسم المجموعة مطلوب.",
        },
        {
          status: 400,
        }
      );
    }


    // ==========================================
    // SLUG
    // ==========================================

    const slug =
      createSlug(name);


    if (!slug) {
      return NextResponse.json(
        {
          message:
            "تعذر إنشاء slug صالح للمجموعة.",
        },
        {
          status: 400,
        }
      );
    }


    // ==========================================
    // VALIDATION - TYPE / TAG
    // ==========================================

    if (
      type === "TAG" &&
      !tagId
    ) {
      return NextResponse.json(
        {
          message:
            "يجب اختيار وسم للمجموعة.",
        },
        {
          status: 400,
        }
      );
    }


    if (
      type === "MANUAL" &&
      tagId
    ) {
      return NextResponse.json(
        {
          message:
            "المجموعة اليدوية لا تحتاج إلى وسم.",
        },
        {
          status: 400,
        }
      );
    }


    // ==========================================
    // CHECK TAG
    // ==========================================

    if (type === "TAG") {

      const tag =
        await prisma.tag.findUnique({
          where: {
            id: tagId!,
          },
        });


      if (!tag) {
        return NextResponse.json(
          {
            message:
              "الوسم المحدد غير موجود.",
          },
          {
            status: 404,
          }
        );
      }
    }


    // ==========================================
    // DUPLICATE CHECK
    // ==========================================

    const existing =
      await prisma.collection.findFirst({
        where: {
          OR: [
            {
              name,
            },
            {
              slug,
            },
          ],
        },
      });


    if (existing) {
      return NextResponse.json(
        {
          message:
            "هذه المجموعة موجودة بالفعل.",
        },
        {
          status: 409,
        }
      );
    }


    // ==========================================
    // CREATE
    // ==========================================

    const collection =
      await prisma.collection.create({
        data: {
          name,

          slug,

          description:
            description || null,

          imageUrl:
            imageUrl || null,

          imagePublicId:
            imagePublicId || null,

          active,

          type,

          tagId:
            type === "TAG"
              ? tagId
              : null,
        },

        include: {
          tag: true,
        },
      });


    // ==========================================
    // RESPONSE
    // ==========================================

    return NextResponse.json(
      {
        message:
          "تم إنشاء المجموعة بنجاح.",

        collection,
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    // ==========================================
    // ADMIN AUTH ERROR
    // ==========================================

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


    // ==========================================
    // PRISMA UNIQUE ERROR
    // ==========================================

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          message:
            "اسم أو slug المجموعة مستخدم مسبقًا.",
        },
        {
          status: 409,
        }
      );
    }


    // ==========================================
    // UNEXPECTED ERROR
    // ==========================================

    console.error(
      "CREATE COLLECTION ERROR:",
      error
    );


    return NextResponse.json(
      {
        message:
          "تعذر إنشاء المجموعة.",
      },
      {
        status: 500,
      }
    );
  }
}