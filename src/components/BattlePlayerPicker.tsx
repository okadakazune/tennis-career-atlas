"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getPlayers, getPlayersBySport, Player } from "@/data/players";
import type { SportId } from "@/data/sports/types";
import { PlayerAvatar } from "@/components/PlayerAvatar";

interface BattlePlayerPickerProps {
  label: string;
  sport: SportId;
  selectedId: string;
  otherSelectedId: string;
  onChange: (playerId: string) => void;
}

export function BattlePlayerPicker({
  label,
  sport,
  selectedId,
  otherSelectedId,
  onChange,
}: BattlePlayerPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedPlayer = getPlayers().find((player) => player.id === selectedId);

  const options = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return getPlayersBySport(sport)
      .filter((player) => player.id !== otherSelectedId)
      .filter((player) => {
        if (!normalized) return true;
        return (
          player.name.toLowerCase().includes(normalized) ||
          player.shortName.toLowerCase().includes(normalized) ||
          player.id.toLowerCase().includes(normalized)
        );
      })
      .slice(0, 12);
  }, [otherSelectedId, query, sport]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(player: Player) {
    onChange(player.id);
    setQuery("");
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-[#86868b]">
        {label}
      </p>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-black/[0.08] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)]"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {selectedPlayer ? (
          <>
            <PlayerAvatar
              name={selectedPlayer.name}
              color={selectedPlayer.color}
              imageUrl={selectedPlayer.imageUrl}
              imagePosition={selectedPlayer.imagePosition}
              size="summary"
            />
            <span className="truncate text-base font-semibold text-[#1d1d1f] sm:text-lg">
              {selectedPlayer.shortName}
            </span>
          </>
        ) : (
          <span className="text-sm text-[#86868b]">Select player</span>
        )}
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.12)]">
          <div className="border-b border-black/[0.06] p-3">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search players…"
              className="w-full rounded-xl bg-[#f5f5f7] px-3 py-2 text-sm text-[#1d1d1f] outline-none ring-[#0071e3] focus:ring-2"
              autoFocus
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1" role="listbox">
            {options.map((player) => (
              <li key={player.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={player.id === selectedId}
                  onClick={() => handleSelect(player)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[#f5f5f7]"
                >
                  <PlayerAvatar
                    name={player.name}
                    color={player.color}
                    imageUrl={player.imageUrl}
                    imagePosition={player.imagePosition}
                    size="chip"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#1d1d1f]">
                      {player.shortName}
                    </p>
                    <p className="truncate text-xs text-[#86868b]">{player.name}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
