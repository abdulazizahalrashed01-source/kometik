"use client";

import Image from "next/image";
import { CldImage } from "next-cloudinary";

type CloudinaryProductImageProps = {
  imagePublicId?: string | null;
  imageUrl?: string | null;

  alt: string;

  fill?: boolean;

  width?: number;
  height?: number;

  sizes?: string;

  className?: string;
};

export default function CloudinaryProductImage({
  imagePublicId,
  imageUrl,
  alt,
  fill = false,
  width,
  height,
  sizes,
  className = "",
}: CloudinaryProductImageProps) {
  // ==========================================
  // CLOUDINARY IMAGE
  // ==========================================

  if (imagePublicId) {
    return (
      <CldImage
        src={imagePublicId}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        sizes={sizes}
        className={className}
        crop={fill ? "fit" : undefined}
      />
    );
  }


  // ==========================================
  // OLD IMAGE URL FALLBACK
  // ==========================================

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        sizes={sizes}
        className={className}
      />
    );
  }


  // ==========================================
  // NO IMAGE
  // ==========================================

  return (
    <div
      className="
        flex
        h-full
        w-full
        items-center
        justify-center
        bg-gray-100
        text-xs
        text-gray-400
      "
    >
      No image
    </div>
  );
}