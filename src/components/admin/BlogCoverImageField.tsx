"use client";

import { useState } from "react";
import ProductImageUpload from "@/components/admin/ProductImageUpload";

type BlogCoverImageFieldProps = {
  imageUrl?: string | null;
  imagePublicId?: string | null;
};

export default function BlogCoverImageField({
  imageUrl = "",
  imagePublicId = "",
}: BlogCoverImageFieldProps) {
  const [url, setUrl] = useState(imageUrl || "");
  const [publicId, setPublicId] = useState(
    imagePublicId || ""
  );

  function handleUpload({
    imageUrl: uploadedUrl,
    imagePublicId: uploadedPublicId,
  }: {
    imageUrl: string;
    imagePublicId: string;
  }) {
    setUrl(uploadedUrl);
    setPublicId(uploadedPublicId);
  }

  return (
    <div className="kometik-space-y-4">
      <ProductImageUpload
        imageUrl={url || null}
        onUpload={handleUpload}
      />

      <input
        type="hidden"
        name="coverImageUrl"
        value={url}
        readOnly
      />

      <input
        type="hidden"
        name="coverImagePublicId"
        value={publicId}
        readOnly
      />

      {url && (
        <div className="rounded-xl border border-(--olive-100) bg-(--olive-50) px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-(--olive-400)">
            Cloudinary
          </p>

          <p
            dir="ltr"
            className="mt-1 truncate text-xs text-(--olive-600)"
            title={url}
          >
            {url}
          </p>

          {publicId && (
            <p
              dir="ltr"
              className="mt-1 truncate text-[10px] text-(--olive-400)"
              title={publicId}
            >
              {publicId}
            </p>
          )}
        </div>
      )}
    </div>
  );
}