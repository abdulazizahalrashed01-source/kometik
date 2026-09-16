"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

type Category = {
  id: string;
  name: string;
  parentId: string | null;
  parent?: {
    id: string;
    name: string;
    parentId: string | null;
  } | null;
  _count: {
    products: number;
    children: number;
  };
};

type CategoryNode = Category & {
  childrenNodes: CategoryNode[];
};

export default function CategoriesPage() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [name, setName] =
    useState("");

  const [parentId, setParentId] =
    useState<string>("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editingName, setEditingName] =
    useState("");

  const [editingParentId, setEditingParentId] =
    useState<string>("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ==========================================
  // LOAD CATEGORIES
  // ==========================================

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          "/api/admin/categories"
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load categories"
        );
      }

      setCategories(
        data.categories
      );

    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load categories"
      );

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  // ==========================================
  // BUILD CATEGORY TREE
  // ==========================================

  const categoryTree =
    useMemo<CategoryNode[]>(() => {
      const map =
        new Map<string, CategoryNode>();

      for (const category of categories) {
        map.set(
          category.id,
          {
            ...category,
            childrenNodes: [],
          }
        );
      }

      const roots: CategoryNode[] = [];

      for (const category of categories) {
        const node =
          map.get(category.id);

        if (!node) {
          continue;
        }

        if (
          category.parentId &&
          map.has(category.parentId)
        ) {
          map
            .get(category.parentId)!
            .childrenNodes.push(node);
        } else {
          roots.push(node);
        }
      }

      function sortNodes(
        nodes: CategoryNode[]
      ) {
        nodes.sort((a, b) =>
          a.name.localeCompare(
            b.name,
            undefined,
            {
              sensitivity: "base",
            }
          )
        );

        for (const node of nodes) {
          sortNodes(
            node.childrenNodes
          );
        }
      }

      sortNodes(roots);

      return roots;
    }, [categories]);

  // ==========================================
  // FIND DESCENDANTS
  // ==========================================

  function getDescendantIds(
    categoryId: string
  ) {
    const ids = new Set<string>();

    function collect(id: string) {
      for (const category of categories) {
        if (
          category.parentId === id &&
          !ids.has(category.id)
        ) {
          ids.add(category.id);
          collect(category.id);
        }
      }
    }

    collect(categoryId);

    return ids;
  }

  // ==========================================
  // CREATE CATEGORY
  // ==========================================

  async function handleCreate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response =
        await fetch(
          "/api/admin/categories",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name: name.trim(),
              parentId:
                parentId || null,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create category"
        );
      }

      setName("");
      setParentId("");

      setSuccess(
        "Category created successfully."
      );

      await loadCategories();

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create category"
      );

    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // START EDIT
  // ==========================================

  function startEdit(
    category: Category
  ) {
    setEditingId(category.id);
    setEditingName(category.name);
    setEditingParentId(
      category.parentId || ""
    );

    setError("");
    setSuccess("");
  }

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
    setEditingParentId("");
  }

  // ==========================================
  // UPDATE CATEGORY
  // ==========================================

  async function handleUpdate(
    id: string
  ) {
    if (!editingName.trim()) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `/api/admin/categories/${id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name:
                editingName.trim(),

              parentId:
                editingParentId || null,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update category"
        );
      }

      setEditingId(null);
      setEditingName("");
      setEditingParentId("");

      setSuccess(
        "Category updated successfully."
      );

      await loadCategories();

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update category"
      );

    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // DELETE CATEGORY
  // ==========================================

  async function handleDelete(
    category: Category
  ) {
    const confirmed =
      window.confirm(
        `Delete "${category.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `/api/admin/categories/${category.id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete category"
        );
      }

      setSuccess(
        "Category deleted successfully."
      );

      await loadCategories();

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete category"
      );

    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // RENDER CATEGORY
  // ==========================================

  function renderCategory(
    category: CategoryNode,
    level = 0
  ): React.ReactNode {
    const excludedIds =
      editingId
        ? new Set([
            editingId,
            ...getDescendantIds(
              editingId
            ),
          ])
        : new Set<string>();

    return (
      <div key={category.id}>
        <div
          className="
            flex
            flex-col
            gap-4
            border-b
            border-gray-100
            px-6
            py-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          {/* CATEGORY */}

          <div
            className="min-w-0 flex-1"
            style={{
              paddingRight:
                `${level * 28}px`,
            }}
          >
            {editingId === category.id ? (
              <div className="max-w-xl kometik-space-y-3">

                <input
                  autoFocus
                  type="text"
                  value={editingName}
                  onChange={(event) =>
                    setEditingName(
                      event.target.value
                    )
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    px-3
                    py-2
                    outline-none
                    focus:border-black
                    focus:ring-1
                    focus:ring-black
                  "
                />

                <select
                  value={
                    editingParentId
                  }
                  onChange={(event) =>
                    setEditingParentId(
                      event.target.value
                    )
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-3
                    py-2
                    outline-none
                    focus:border-black
                    focus:ring-1
                    focus:ring-black
                  "
                >
                  <option value="">
                    Main category
                  </option>

                  {categories
                    .filter(
                      (item) =>
                        !excludedIds.has(
                          item.id
                        )
                    )
                    .sort((a, b) =>
                      a.name.localeCompare(
                        b.name,
                        undefined,
                        {
                          sensitivity:
                            "base",
                        }
                      )
                    )
                    .map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  {level > 0 && (
                    <span className="text-gray-300">
                      └─
                    </span>
                  )}

                  <p
                    className={`
                      font-medium
                      ${
                        level === 0
                          ? "text-gray-900"
                          : "text-gray-700"
                      }
                    `}
                  >
                    {category.name}
                  </p>
                </div>

                <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
                  <span>
                    {category._count.products}{" "}
                    {category._count.products === 1
                      ? "product"
                      : "products"}
                  </span>

                  {category._count.children > 0 && (
                    <>
                      <span>•</span>

                      <span>
                        {category._count.children}{" "}
                        {category._count.children === 1
                          ? "subcategory"
                          : "subcategories"}
                      </span>
                    </>
                  )}

                  {category.parent && (
                    <>
                      <span>•</span>

                      <span>
                        Parent:{" "}
                        {category.parent.name}
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ACTIONS */}

          <div className="flex gap-2">
            {editingId === category.id ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdate(
                      category.id
                    )
                  }
                  disabled={
                    saving ||
                    !editingName.trim()
                  }
                  className="
                    rounded-lg
                    bg-black
                    px-4
                    py-2
                    text-sm
                    font-medium
                    text-white
                    hover:bg-gray-800
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={
                    cancelEdit
                  }
                  disabled={saving}
                  className="
                    rounded-lg
                    border
                    px-4
                    py-2
                    text-sm
                    hover:bg-gray-50
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() =>
                    startEdit(category)
                  }
                  disabled={saving}
                  className="
                    rounded-lg
                    border
                    px-4
                    py-2
                    text-sm
                    hover:bg-gray-50
                    disabled:opacity-50
                  "
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      category
                    )
                  }
                  disabled={saving}
                  className="
                    rounded-lg
                    border
                    border-red-200
                    px-4
                    py-2
                    text-sm
                    text-red-600
                    hover:bg-red-50
                    disabled:opacity-50
                  "
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {category.childrenNodes.map(
          (child) =>
            renderCategory(
              child,
              level + 1
            )
        )}
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="mx-auto max-w-6xl">

      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Categories
        </h1>

        <p className="mt-2 text-gray-500">
          Manage your category hierarchy.
        </p>
      </div>

      {/* MESSAGES */}

      {error && (
        <div
          className="
            mb-6
            rounded-lg
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-700
          "
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="
            mb-6
            rounded-lg
            border
            border-green-200
            bg-green-50
            px-4
            py-3
            text-sm
            text-green-700
          "
        >
          {success}
        </div>
      )}

      {/* ADD CATEGORY */}

      <div
        className="
          mb-8
          rounded-xl
          bg-white
          p-6
          shadow-sm
        "
      >
        <h2 className="mb-4 text-lg font-semibold">
          Add Category
        </h2>

        <form
          onSubmit={handleCreate}
          className="
            grid
            gap-3
            sm:grid-cols-[1fr_1fr_auto]
          "
        >
          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Category name"
            className="
              rounded-lg
              border
              border-gray-300
              px-4
              py-3
              outline-none
              focus:border-black
              focus:ring-1
              focus:ring-black
            "
          />

          <select
            value={parentId}
            onChange={(event) =>
              setParentId(
                event.target.value
              )
            }
            className="
              rounded-lg
              border
              border-gray-300
              bg-white
              px-4
              py-3
              outline-none
              focus:border-black
              focus:ring-1
              focus:ring-black
            "
          >
            <option value="">
              Main category
            </option>

            {categories
              .slice()
              .sort((a, b) =>
                a.name.localeCompare(
                  b.name,
                  undefined,
                  {
                    sensitivity:
                      "base",
                  }
                )
              )
              .map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
          </select>

          <button
            type="submit"
            disabled={
              saving ||
              !name.trim()
            }
            className="
              rounded-lg
              bg-black
              px-6
              py-3
              font-medium
              text-white
              transition
              hover:bg-gray-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {saving
              ? "Saving..."
              : "Add Category"}
          </button>
        </form>
      </div>

      {/* CATEGORY TREE */}

      <div
        className="
          overflow-hidden
          rounded-xl
          bg-white
          shadow-sm
        "
      >
        <div
          className="
            border-b
            px-6
            py-5
          "
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold">
                Category Hierarchy
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {categories.length}{" "}
                categories
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium">
              No categories yet.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Create your first category above.
            </p>
          </div>
        ) : (
          <div>
            {categoryTree.map(
              (category) =>
                renderCategory(
                  category
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
