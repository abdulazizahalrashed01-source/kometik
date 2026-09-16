import { prisma } from "@/lib/prisma";

import Breadcrumbs from "./Breadcrumbs";

type CategoryBreadcrumbsProps = {
  categoryId: string;
  productName: string;
};

type CategoryNode = {
  id: string;
  name: string;
  parentId: string | null;
};

export default async function CategoryBreadcrumbs({
  categoryId,
  productName,
}: CategoryBreadcrumbsProps) {
  const categories: CategoryNode[] = [];

  let currentId: string | null = categoryId;

  const visited = new Set<string>();

  while (
    currentId &&
    !visited.has(currentId)
  ) {
    visited.add(currentId);

    const category: CategoryNode | null =
      await prisma.category.findUnique({
        where: {
          id: currentId,
        },
        select: {
          id: true,
          name: true,
          parentId: true,
        },
      });

    if (!category) {
      break;
    }

    categories.unshift(category);

    currentId = category.parentId;
  }

  return (
    <Breadcrumbs
      items={[
        {
          label: "المتجر",
          href: "/shop",
        },

        ...categories.map(
          (category) => ({
            label: category.name,
            href: `/shop/products?categoryId=${category.id}`,
          })
        ),

        {
          label: productName,
        },
      ]}
    />
  );
}
