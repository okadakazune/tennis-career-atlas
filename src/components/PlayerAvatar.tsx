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

/** Fixed pixel sizes — inline styles avoid Tailwind preflight `img { max-width: 100% }` blow-ups. */
const SIZE_PX: Record<PlayerAvatarSize, number> = {
  chip: 28,
  sm: 28,
  md: 40,
  tooltip: 64,
  summary: 96,
  lg: 96,
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
  const px = SIZE_PX[size];
  const dimensionStyle = {
    width: px,
    height: px,
    minWidth: px,
    minHeight: px,
    maxWidth: px,
  } as const;
  const showImage = Boolean(imageUrl) && !imageFailed;

  if (showImage && imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        width={px}
        height={px}
        className={`shrink-0 rounded-full object-cover ring-1 ring-black/[0.08] ${className}`}
        style={{
          ...dimensionStyle,
          objectPosition: imagePosition,
        }}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span
      className={`inline-block shrink-0 rounded-full ${className}`}
      style={{ ...dimensionStyle, backgroundColor: color }}
      aria-hidden="true"
    />
  );
}
