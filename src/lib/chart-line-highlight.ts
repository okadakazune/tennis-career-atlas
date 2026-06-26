export function getLineHighlightStyle(
  playerId: string,
  hoveredPlayerId: string | null,
  baseOpacity: number,
  baseWidth: number,
): { strokeOpacity: number; strokeWidth: number } {
  if (!hoveredPlayerId) {
    return { strokeOpacity: baseOpacity, strokeWidth: baseWidth };
  }

  if (hoveredPlayerId === playerId) {
    return { strokeOpacity: 1, strokeWidth: baseWidth + 1.5 };
  }

  return { strokeOpacity: 0.35, strokeWidth: baseWidth };
}
