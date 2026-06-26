"use client";

import { useEffect, useRef, useState } from "react";
import {
  PlayerIndexEntry,
  formatBirthDate,
  getPlayerByAtpId,
} from "@/data/players";
import {
  loadPlayerSearchIndex,
  searchPlayerIndex,
} from "@/data/player-index-search";

interface PlayerSearchProps {
  selectedIds: string[];
  onAddToComparison: (entry: PlayerIndexEntry) => void;
}

export function PlayerSearch({ selectedIds, onAddToComparison }: PlayerSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<PlayerIndexEntry[]>([]);
  const [isLoadingIndex, setIsLoadingIndex] = useState(false);
  const [indexError, setIndexError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerIndexRef = useRef<PlayerIndexEntry[] | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const normalized = query.trim();
    if (!normalized) {
      setResults([]);
      return;
    }

    let cancelled = false;

    async function runSearch() {
      try {
        if (!playerIndexRef.current) {
          setIsLoadingIndex(true);
          setIndexError(null);
          playerIndexRef.current = await loadPlayerSearchIndex();
        }

        if (cancelled) return;

        setResults(searchPlayerIndex(playerIndexRef.current, normalized, 12));
      } catch {
        if (!cancelled) {
          setIndexError("Player search is temporarily unavailable.");
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingIndex(false);
        }
      }
    }

    void runSearch();

    return () => {
      cancelled = true;
    };
  }, [query]);

  function handleSelect(entry: PlayerIndexEntry) {
    setQuery(entry.name);
    setIsOpen(false);
    onAddToComparison(entry);
  }

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor="player-search" className="sr-only">
        Search players
      </label>
      <input
        id="player-search"
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search ATP players by name..."
        className="w-full rounded-xl border border-black/[0.08] bg-[#fafafa] px-4 py-3 text-sm text-[#1d1d1f] outline-none transition-colors placeholder:text-[#86868b] focus:border-[#0071E3] focus:bg-white"
      />

      {isOpen && query.trim() && isLoadingIndex && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-black/[0.06] bg-white px-4 py-3 text-sm text-[#86868b] shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
          Loading player index…
        </div>
      )}

      {isOpen && query.trim() && indexError && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-[#FFCCBC] bg-[#FFF3E0] px-4 py-3 text-sm text-[#E65100] shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
          {indexError}
        </div>
      )}

      {isOpen && query.trim() && !isLoadingIndex && !indexError && results.length > 0 && (
        <ul className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-black/[0.06] bg-white py-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
          {results.map((entry) => {
            const isSelected = entry.slug ? selectedIds.includes(entry.slug) : false;
            const featuredPlayer = entry.hasRankingData
              ? getPlayerByAtpId(entry.atpPlayerId)
              : undefined;

            return (
              <li key={entry.atpPlayerId}>
                <button
                  type="button"
                  onClick={() => handleSelect(entry)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left transition-colors hover:bg-[#f5f5f7]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#1d1d1f]">{entry.name}</p>
                    <p className="truncate text-xs text-[#86868b]">
                      {entry.countryCode || "—"}
                      {entry.birthDate ? ` · Born ${formatBirthDate(entry.birthDate)}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {entry.hasRankingData ? (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          isSelected
                            ? "bg-[#1d1d1f] text-white"
                            : "bg-[#E8F5E9] text-[#1B5E20]"
                        }`}
                      >
                        {featuredPlayer && (
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: featuredPlayer.color }}
                          />
                        )}
                        Chart available
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#f5f5f7] px-2.5 py-1 text-xs font-medium text-[#86868b]">
                        Index only
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {isOpen && query.trim() && !isLoadingIndex && !indexError && results.length === 0 && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-black/[0.06] bg-white px-4 py-3 text-sm text-[#86868b] shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
          No players found.
        </div>
      )}
    </div>
  );
}
