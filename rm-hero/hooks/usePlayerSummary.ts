import { useState } from "react";

type Options = {
  errorMessage?: string;
};

/**
 * Structured player snapshot returned by the backend
 * `/api/v1/player/{name}/summary` endpoint.
 */
export type PlayerSnapshot = {
  draft_tier: string;
  /** Model's 0-100 skill rating. Optional/guarded for older responses. */
  skill_rating?: number;
  /** Number of players in the league (paired with the player's rank for standing). */
  league_size?: number;
  /** League benchmarks so each stat is shown against the field, not in a vacuum. */
  avg_skill_rating?: number;
  league_avg_win_pct?: number;
  league_avg_pt_win_pct?: number;
  scouting: {
    archetype: string;
    strengths: string[];
    weaknesses: string[];
    outlook: string;
  };
};

/** Per-player fetch state for the expandable snapshot. */
export type SnapshotState = {
  loading: boolean;
  error: boolean;
  snapshot: PlayerSnapshot | null;
};

/**
 * Encapsulates the expand/collapse + lazy-fetch-snapshot toggle that is shared
 * by the players list and the team detail page.
 */
export function usePlayerSummary(options: Options = {}) {
  const errorMessage = options.errorMessage ?? "Failed to load summary.";
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, SnapshotState>>({});

  const toggleSummary = async (playerName: string) => {
    const isExpanded = expandedPlayer === playerName;

    setExpandedPlayer(isExpanded ? null : playerName);

    if (isExpanded || summaries[playerName]) return;

    setSummaries((prev) => ({
      ...prev,
      [playerName]: { loading: true, error: false, snapshot: null },
    }));

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/player/${encodeURIComponent(playerName)}/summary`,
      );

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const snapshot = (await res.json()) as PlayerSnapshot;

      setSummaries((prev) => ({
        ...prev,
        [playerName]: { loading: false, error: false, snapshot },
      }));
    } catch (err) {
      console.error("Failed to fetch summary:", errorMessage, err);
      setSummaries((prev) => ({
        ...prev,
        [playerName]: { loading: false, error: true, snapshot: null },
      }));
    }
  };

  return { expandedPlayer, summaries, toggleSummary };
}
