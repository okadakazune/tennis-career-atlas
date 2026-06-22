"use client";

import { useState } from "react";

export type PlayerAvatarSize = "chip" | "tooltip" | "summary" | "sm" | "md" | "lg";

interface PlayerAvatarProps {
  name: string;
  color: string;
  imageUrl?: string;
  imagePosition?: string;
  size?: PlayerAvatarSize;
  className?: string;
}

const SIZE_CLASSES: Record<PlayerAvatarSize, string> = {
  chip: "h-7 w-7",
  tooltip: "h-10 w-10",
  summary: "h-[72px] w-[72px] sm:h-24 sm:w-24",
  sm: "h-7 w-7",
  md: "h-10 w-10",
  lg: "h-[72px] w-[72px] sm:h-24 sm:w-24",
};

export function PlayerAvatar({
  name,
  color,
  imageUrl,
  imagePosition = "center center",
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
        style={{ objectPosition: imagePosition }}
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
