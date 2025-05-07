"use client";
import Image from "next/image";
import { useState } from "react";

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
}

export function ProductImage({
  src,
  alt,
  className,
  width,
  height,
  fill = true,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 300px",
  style = { objectFit: "cover" },
}: ProductImageProps) {
  const [error, setError] = useState(false);
  const fallbackSrc = "/images/placeholder-image.jpg";
  const imageSrc = error ? fallbackSrc : src || fallbackSrc;

  // Check if image is external (doesn't start with /)
  const isExternal = !!(
    src &&
    !src.startsWith("/") &&
    !src.startsWith("data:")
  );

  return (
    <Image
      src={imageSrc}
      alt={alt}
      className={className}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      sizes={sizes}
      style={style}
      priority={priority}
      unoptimized={isExternal}
      onError={() => setError(true)}
    />
  );
}
