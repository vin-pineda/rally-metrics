import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import React from "react";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

import { useBreakpoint } from "@/hooks/useBreakpoint";
import DefaultLayout from "@/layouts/default";
import { teamColors } from "@/config/teamColors";
import { backendToSlug } from "@/config/teamNames";
import { Player, PlayerView, toPlayerView } from "@/types/player";
import { usePlayerSummary, SnapshotState } from "@/hooks/usePlayerSummary";
import PlayerSnapshotCard, {
  PlayerSnapshotSkeleton,
} from "@/components/PlayerSnapshotCard";

function ExpandedSnapshot({
  state,
  player,
}: {
  state?: SnapshotState;
  player?: PlayerView;
}) {
  if (!state || state.loading) {
    return <PlayerSnapshotSkeleton />;
  }
  if (state.error || !state.snapshot) {
    return (
      <div className="text-sm text-gray-400 italic">Summary unavailable</div>
    );
  }

  return <PlayerSnapshotCard player={player} snapshot={state.snapshot} />;
}

type SortOption = {
  field: keyof PlayerView;
  label: string;
  isPercentage?: boolean;
  isDescending?: boolean;
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<PlayerView[]>([]);
  const [loading, setLoading] = useState(true);
  const { expandedPlayer, summaries, toggleSummary } = usePlayerSummary();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    field: keyof PlayerView;
    direction: "asc" | "desc";
  }>({ field: "rank", direction: "asc" });
  const [showSortMenu, setShowSortMenu] = useState(false);
  const isMobile = useBreakpoint(768);

  const router = useRouter();
  const { search = "" } = router.query;

  useEffect(() => {
    const searchValue = search?.toString() || "";

    setSearchTerm(searchValue);

    if (!searchValue) {
      router.replace("/players", undefined, { shallow: true });
    }

    const query = new URLSearchParams();

    if (searchValue) query.append("name", searchValue);

    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/player?${query.toString()}`,
    )
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const text = await res.text();

        return text ? JSON.parse(text) : [];
      })
      .then((data) => {
        const formatted = (data as Player[]).map(toPlayerView);

        setPlayers(formatted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search]);

  const sortOptions: SortOption[] = [
    { field: "rank", label: "Rank" },
    { field: "gamesWon", label: "Wins", isDescending: true },
    { field: "gamesLost", label: "Losses", isDescending: true },
    {
      field: "gamesWonPercent",
      label: "Win %",
      isPercentage: true,
      isDescending: true,
    },
    { field: "ptsWon", label: "Points Won", isDescending: true },
    { field: "ptsLost", label: "Points Lost", isDescending: true },
    {
      field: "ptsWonPercent",
      label: "Points %",
      isPercentage: true,
      isDescending: true,
    },
  ];

  const filteredPlayers = useMemo(() => {
    return players.filter((player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [players, searchTerm]);

  const sortedPlayers = useMemo(() => {
    const sortablePlayers = [...filteredPlayers];

    if (sortConfig.field) {
      sortablePlayers.sort((a, b) => {
        let aValue = a[sortConfig.field];
        let bValue = b[sortConfig.field];

        if (sortConfig.field.includes("Percent")) {
          aValue = parseFloat(aValue as any);
          bValue = parseFloat(bValue as any);
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }

        return 0;
      });
    }

    return sortablePlayers;
  }, [filteredPlayers, sortConfig]);

  const getTeamClasses = (player: PlayerView) => {
    const teamSlug = backendToSlug[player.team] || "";
    const colors = teamColors[teamSlug];

    return {
      border: colors?.border || "border-gray-300",
      bg: colors?.bg || "bg-white",
    };
  };

  const handleSortChange = (field: keyof PlayerView) => {
    if (sortConfig.field === field) {
      setSortConfig({
        field,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      const option = sortOptions.find((opt) => opt.field === field);

      setSortConfig({
        field,
        direction: option?.isDescending ? "desc" : "asc",
      });
    }
    setShowSortMenu(false);
  };

  const getSortIcon = (field: keyof PlayerView) => {
    if (sortConfig.field !== field) return null;

    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  return (
    <DefaultLayout>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-10 min-h-screen max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-extrabold mb-6 bg-gradient-to-r from-orange-400 to-orange-600 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
        >
          Premier Players
        </motion.h1>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 relative z-30"
          initial={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                placeholder="Search players..."
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;

                  setSearchTerm(value);

                  if (value === "") {
                    router.push("/players");
                  }
                }}
              />
              {searchTerm && (
                <button
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setSearchTerm("")}
                >
                  <XMarkIcon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                </button>
              )}
            </div>

            <div className="relative w-full md:w-auto z-40">
              <button
                className="flex items-center gap-2 w-full md:w-auto px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition text-gray-700 shadow-sm hover:shadow-md"
                onClick={() => setShowSortMenu(!showSortMenu)}
              >
                <ArrowsUpDownIcon className="h-5 w-5 text-gray-500" />
                <span>Sort Players</span>
              </button>

              {showSortMenu && (
                <motion.div
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute z-50 mt-2 w-full md:w-64 bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{
                    duration: 0.2,
                    ease: "easeOut",
                  }}
                >
                  <div className="py-1">
                    {sortOptions.map((option) => (
                      <motion.button
                        key={option.field}
                        className={`flex justify-between items-center w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors ${
                          sortConfig.field === option.field
                            ? "bg-orange-50 text-orange-600 font-medium"
                            : "text-gray-700"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSortChange(option.field)}
                      >
                        <span>{option.label}</span>
                        {sortConfig.field === option.field && (
                          <span className="text-orange-500 text-sm">
                            {sortConfig.direction === "asc" ? "Asc" : "Desc"}
                          </span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
        {!loading && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="text-gray-600">
              Showing {filteredPlayers.length} of {players.length} players
            </div>

            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full">
              <span className="text-orange-700 font-medium">
                Sorted by:{" "}
                {
                  sortOptions.find((opt) => opt.field === sortConfig.field)
                    ?.label
                }{" "}
                {getSortIcon(sortConfig.field)}
              </span>
              <span className="text-orange-500">
                ({sortConfig.direction === "asc" ? "Ascending" : "Descending"})
              </span>
            </div>

            {(searchTerm ||
              sortConfig.field !== "rank" ||
              sortConfig.direction !== "asc") && (
              <button
                className="text-orange-500 hover:text-orange-700 font-medium"
                onClick={() => {
                  setSearchTerm("");
                  setSortConfig({ field: "rank", direction: "asc" });
                }}
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-lg">Loading...</p>
        ) : sortedPlayers.length > 0 ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="overflow-x-auto scrollbar-hide rounded-xl shadow-lg border"
            initial={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.6 }}
          >
            {isMobile ? (
              <div className="space-y-4 p-4">
                {sortedPlayers.map((player) => {
                  const colors = getTeamClasses(player);

                  return (
                    <motion.div
                      key={player.name}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl overflow-hidden border-2 ${colors.border} ${colors.bg} transition-all shadow-lg`}
                      initial={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="p-4">
                        <div
                          className="flex justify-between items-center cursor-pointer"
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleSummary(player.name)}
                          onKeyDown={(e) =>
                            (e.key === "Enter" || e.key === " ") &&
                            toggleSummary(player.name)
                          }
                        >
                          <div>
                            <div className="font-bold text-lg text-gray-900">
                              {player.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              #{player.rank} Rank
                            </div>
                          </div>
                          {expandedPlayer === player.name ? (
                            <ChevronDownIcon className="h-5 w-5 text-gray-600" />
                          ) : (
                            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <div className="flex flex-col">
                            <div className="text-xs text-gray-500">Team</div>
                            <div className="font-semibold text-gray-900">
                              {player.team}
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="text-xs text-gray-500">W/L</div>
                            <div className="font-semibold text-gray-900">
                              {player.gamesWon}
                              <span className="text-gray-400">/</span>
                              {player.gamesLost}
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="text-xs text-gray-500">Win %</div>
                            <div className="font-semibold text-gray-900">
                              {player.gamesWonPercent.toFixed(1)}%
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="text-xs text-gray-500">Pts %</div>
                            <div className="font-semibold text-gray-900">
                              {player.ptsWonPercent.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        {expandedPlayer === player.name && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <ExpandedSnapshot
                              player={player}
                              state={summaries[player.name]}
                            />
                          </div>
                        )}
                      </div>
                      <div
                        className={`h-2 ${colors.border.replace("border", "bg")}`}
                      />
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <table className="w-full text-md bg-white text-gray-800">
                <thead className="sticky top-0 z-20 shadow-md bg-gray-100">
                  <tr>
                    <th
                      className="px-6 py-4 text-left cursor-pointer"
                      onClick={() => handleSortChange("name")}
                    >
                      <div className="flex items-center gap-1">
                        Player
                        {sortConfig.field === "name" && (
                          <span className="text-orange-500">
                            {getSortIcon("name")}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="w-6" />
                    <th className="px-6 py-4 text-left">Team</th>
                    <th
                      className="px-6 py-4 text-right cursor-pointer"
                      onClick={() => handleSortChange("rank")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {sortConfig.field === "rank" && (
                          <span className="text-orange-500">
                            {getSortIcon("rank")}
                          </span>
                        )}
                        Rank
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-right cursor-pointer"
                      onClick={() => handleSortChange("gamesWon")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {sortConfig.field === "gamesWon" && (
                          <span className="text-orange-500">
                            {getSortIcon("gamesWon")}
                          </span>
                        )}
                        W
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-right cursor-pointer"
                      onClick={() => handleSortChange("gamesLost")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {sortConfig.field === "gamesLost" && (
                          <span className="text-orange-500">
                            {getSortIcon("gamesLost")}
                          </span>
                        )}
                        L
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-right cursor-pointer"
                      onClick={() => handleSortChange("gamesWonPercent")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {sortConfig.field === "gamesWonPercent" && (
                          <span className="text-orange-500">
                            {getSortIcon("gamesWonPercent")}
                          </span>
                        )}
                        Win %
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-right cursor-pointer"
                      onClick={() => handleSortChange("ptsWon")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {sortConfig.field === "ptsWon" && (
                          <span className="text-orange-500">
                            {getSortIcon("ptsWon")}
                          </span>
                        )}
                        Pts Won
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-right cursor-pointer"
                      onClick={() => handleSortChange("ptsLost")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {sortConfig.field === "ptsLost" && (
                          <span className="text-orange-500">
                            {getSortIcon("ptsLost")}
                          </span>
                        )}
                        Pts Lost
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-right cursor-pointer"
                      onClick={() => handleSortChange("ptsWonPercent")}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {sortConfig.field === "ptsWonPercent" && (
                          <span className="text-orange-500">
                            {getSortIcon("ptsWonPercent")}
                          </span>
                        )}
                        Pts %
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlayers.map((player) => {
                    const colors = getTeamClasses(player);

                    return (
                      <React.Fragment key={player.name}>
                        <motion.tr
                          animate={{ opacity: 1 }}
                          className={`even:bg-gray-50 transition-all hover:scale-[1.005] border-l-4 ${colors.border}`}
                          initial={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <td
                            className="px-6 py-4 font-semibold cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleSummary(player.name)}
                            onKeyDown={(e) =>
                              (e.key === "Enter" || e.key === " ") &&
                              toggleSummary(player.name)
                            }
                          >
                            {player.name}
                          </td>
                          <td
                            className="w-6 text-center cursor-pointer"
                            onClick={() => toggleSummary(player.name)}
                          >
                            {expandedPlayer === player.name ? (
                              <ChevronDownIcon className="h-4 w-4 text-gray-600 mx-auto" />
                            ) : (
                              <ChevronRightIcon className="h-4 w-4 text-gray-600 mx-auto" />
                            )}
                          </td>
                          <td className="px-6 py-4">{player.team}</td>
                          <td className="px-6 py-4 text-right">
                            {player.rank}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {player.gamesWon}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {player.gamesLost}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {player.gamesWonPercent.toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 text-right">
                            {player.ptsWon}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {player.ptsLost}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {player.ptsWonPercent.toFixed(1)}%
                          </td>
                        </motion.tr>
                        {expandedPlayer === player.name && (
                          <tr>
                            <td
                              className="px-6 py-4 bg-neutral-50"
                              colSpan={10}
                            >
                              <ExpandedSnapshot
                                player={player}
                                state={summaries[player.name]}
                              />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No players found</div>
            <button
              className="text-orange-500 hover:text-orange-700 font-medium"
              onClick={() => {
                setSearchTerm("");
                setSortConfig({ field: "rank", direction: "asc" });
              }}
            >
              Reset filters
            </button>
          </div>
        )}
      </motion.div>
    </DefaultLayout>
  );
}
