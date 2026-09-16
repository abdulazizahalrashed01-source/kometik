"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteProductButtonProps = {
  productId: string;
  productName: string;
};

export default function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const router = useRouter();

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");


  async function handleDelete() {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${productName}"?`
      );

    if (!confirmed) {
      return;
    }


    setDeleting(true);
    setError("");


    try {
      const response =
        await fetch(
          `/api/admin/products/${productId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );


      const data =
        await response.json();


      if (!response.ok) {
        setError(
          data.message ||
            "Failed to delete product"
        );

        return;
      }


      router.refresh();

    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error
      );

      setError(
        "Unable to connect to server"
      );

    } finally {
      setDeleting(false);
    }
  }


  return (
    <div className="flex flex-col items-end gap-1">

      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="
          rounded-lg
          bg-red-50
          px-3
          py-2
          text-sm
          text-red-600
          transition
          hover:bg-red-100
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {deleting
          ? "Deleting..."
          : "Delete"}
      </button>


      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}

    </div>
  );
}