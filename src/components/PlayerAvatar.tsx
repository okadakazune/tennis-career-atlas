"use client";

import { useState } from "react";

interface PlayerAvatarProps {
  name: string;
  color: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-8 w-8",
} as const;

export function PlayerAvatar({
  name,
  color,
  imageUrl,
  size = "md",
  className = "",
}: PlayerAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const sizeClass = SIZE_CLASSES[size];
  const showImage = Boolean(imageUrl) && !imageFailed;

  if (showImage && imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-1 ring-black/[0.08] ${className}`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span
      className={`${sizeClass} shrink-0 rounded-full ${className}`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}
