import { computeBattleScore, type BattleScoreResult } from "@/data/sports/battle-engine";
import { resolveExploreDisplayAge } from "@/data/explore/category-engine";
import { getSuggestableExploreModes } from "@/data/explore/explore-modes";
import type { ExploreModeId, ExploreSuggestionPreview } from "@/data/explore/explore-types";
import { getWhatIfQuestion } from "@/data/what-if-brand";
import type { Player } from "@/data/players";
import type { SportId } from "@/data/sports/types";

export interface BuildExploreSuggestionsInput {
  sport: SportId;
  playerA: Player;
  playerB: Player;
  currentModeId: ExploreModeId;
  currentResult: BattleScoreResult;
  selectedAge: number;
  limit?: number;
}

function resolveWinnerShortName(result: BattleScoreResult): string | null {
  if (result.overallWinner === "a") return result.playerA.shortName;
  if (result.overallWinner === "b") return result.playerB.shortName;
  return null;
}

export function buildExploreSuggestions({
  sport,
  playerA,
  playerB,
  currentModeId,
  currentResult,
  selectedAge,
  limit = 8,
}: BuildExploreSuggestionsInput): ExploreSuggestionPreview[] {
  const currentWinner = currentResult.overallWinner;
  const suggestableModes = getSuggestableExploreModes(sport).filter(
    (modeDef) => modeDef.id !== currentModeId,
  );

  const previews: ExploreSuggestionPreview[] = [];

  for (const modeDef of suggestableModes) {
    if (previews.length >= limit) break;

    const isLive = modeDef.status === "live";
    let winnerShortName: string | null = null;
    let isTie = false;

    if (isLive) {
      const displayAge = resolveExploreDisplayAge(
        modeDef.id,
        playerA,
        playerB,
        selectedAge,
      );
      const preview = computeBattleScore({
        sport,
        playerA,
        playerB,
        displayAge,
        exploreModeId: modeDef.id,
      });
      winnerShortName = resolveWinnerShortName(preview);
      isTie = preview.overallWinner === "tie";
    }

    const previewWinnerSide =
      winnerShortName === playerA.shortName
        ? "a"
        : winnerShortName === playerB.shortName
          ? "b"
          : isTie
            ? "tie"
            : null;

    previews.push({
      modeId: modeDef.id,
      label: modeDef.label,
      description: modeDef.description,
      whatIfQuestion: getWhatIfQuestion(modeDef.id, modeDef.label),
      emoji: modeDef.emoji,
      status: modeDef.status,
      winnerShortName,
      isTie,
      isDifferentWinner:
        isLive &&
        previewWinnerSide != null &&
        currentWinner != null &&
        previewWinnerSide !== currentWinner,
      isCurrentMode: false,
    });
  }

  return previews;
}

export function sortSuggestionsForDiscovery(
  suggestions: ExploreSuggestionPreview[],
): ExploreSuggestionPreview[] {
  return [...suggestions].sort((a, b) => {
    if (a.isDifferentWinner !== b.isDifferentWinner) {
      return a.isDifferentWinner ? -1 : 1;
    }
    if (a.status !== b.status) {
      return a.status === "live" ? -1 : 1;
    }
    return 0;
  });
}
