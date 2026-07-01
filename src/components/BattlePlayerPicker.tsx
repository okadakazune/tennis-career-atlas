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

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
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

  const triggerLabel = selectedPlayer
    ? `Change ${selectedPlayer.shortName}`
    : "Select player";

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-[#86868b]">
        {label}
      </p>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={triggerLabel}
        className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-black/[0.08] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all hover:border-[#0071e3]/30 hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
      >
        {selectedPlayer ? (
          <>
            <span className="flex min-w-0 items-center gap-3">
              <PlayerAvatar
                name={selectedPlayer.name}
                color={selectedPlayer.color}
                imageUrl={selectedPlayer.imageUrl}
                imagePosition={selectedPlayer.imagePosition}
                size="summary"
              />
              <span className="min-w-0 text-left">
                <span className="block truncate text-base font-semibold text-[#1d1d1f] sm:text-lg">
                  {selectedPlayer.shortName}
                </span>
                <span className="mt-0.5 block text-xs font-medium text-[#0071e3]">
                  Tap to change
                </span>
              </span>
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] text-[#86868b] transition-colors group-hover:bg-[#0071e3]/10 group-hover:text-[#0071e3]">
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </span>
          </>
        ) : (
          <span className="flex w-full items-center justify-between text-sm text-[#86868b]">
            Select player
            <ChevronDownIcon className="h-4 w-4" />
          </span>
        )}
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.12)]">
          <div className="border-b border-black/[0.06] p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#86868b]">
              Choose a player
            </p>
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
