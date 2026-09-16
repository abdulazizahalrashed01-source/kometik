"use client";


import { CldImage } from "next-cloudinary";
import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";


// ==========================================
// TYPES
// ==========================================

type CloudinaryUploadInfo = {
  secure_url?: string;
  public_id?: string;
};

type ProductImageUploadProps = {
  imageUrl?: string | null;
  onUpload: (data: {
    imageUrl: string;
    imagePublicId: string;
  }) => void;
};


// ==========================================
// COMPONENT
// ==========================================

export default function ProductImageUpload({
  imageUrl,
  onUpload,
}: ProductImageUploadProps) {
  const [preview, setPreview] =
    useState<string | null>(
      imageUrl || null
    );

  const [uploading, setUploading] =
    useState(false);


  return (
    <div className="kometik-space-y-4">

      {/* ====================================
          IMAGE PREVIEW
      ==================================== */}

      <div
        className="
          relative
          flex
          aspect-square
          w-full
          max-w-sm
          items-center
          justify-center
          overflow-hidden
          rounded-2xl
          border
          border-dashed
          border-gray-300
          bg-gray-50
        "
      >

        {preview ? (

          <CldImage
  src={preview}
  alt="Product image"
  fill
  sizes="384px"
  className="object-contain p-6"
/>

        ) : (

          <div className="text-center">

            <div className="text-4xl">
              📷
            </div>

            <p
              className="
                mt-3
                text-sm
                font-medium
                text-gray-600
              "
            >
              No image selected
            </p>

          </div>

        )}

        {uploading && (

          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-white/80
              backdrop-blur-sm
            "
          >

            <div
              className="
                flex
                flex-col
                items-center
                gap-3
              "
            >

              <div
                className="
                  h-8
                  w-8
                  animate-spin
                  rounded-full
                  border-2
                  border-gray-300
                  border-t-black
                "
              />

              <p className="text-sm font-medium">
                Uploading...
              </p>

            </div>

          </div>

        )}

      </div>


      {/* ====================================
          UPLOAD WIDGET
      ==================================== */}

      <CldUploadWidget
        signatureEndpoint="/api/admin/cloudinary/sign"

        options={{
          sources: [
            "local",
          ],

          multiple: false,

          folder: "kometik/products",

          clientAllowedFormats: [
            "jpg",
            "jpeg",
            "png",
            "webp",
            "avif",
          ],

          maxFileSize: 5_000_000,

          resourceType: "image",

          cropping: false,
        }}

        onOpen={() => {
          setUploading(true);
        }}

        onSuccess={(result) => {

          const info =
            result.info as CloudinaryUploadInfo;


          if (
            !info.secure_url ||
            !info.public_id
          ) {
            setUploading(false);
            return;
          }


          setPreview(
            info.secure_url
          );


          onUpload({
            imageUrl:
              info.secure_url,

            imagePublicId:
              info.public_id,
          });


          setUploading(false);
        }}

        onError={() => {
          setUploading(false);
        }}

        onClose={() => {
          setUploading(false);
        }}
      >

        {({ open }) => (

          <button
            type="button"
            onClick={() => open()}
            disabled={uploading}
            className="
              inline-flex
              items-center
              justify-center
              rounded-xl
              bg-black
              px-6
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-gray-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {uploading
              ? "Uploading..."
              : preview
                ? "Change Image"
                : "Upload Image"}
          </button>

        )}

      </CldUploadWidget>


      {/* ====================================
          INFO
      ==================================== */}

      <p
        className="
          text-xs
          leading-5
          text-gray-400
        "
      >
        JPG, PNG, WEBP or AVIF.
        Maximum size: 5 MB.
      </p>

    </div>
  );
}