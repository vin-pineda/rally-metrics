import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import React from "react";
import { ChevronRightIcon, ChevronDownIcon, MagnifyingGlassIcon, ArrowsUpDownIcon, XMarkIcon } from "@heroicons/react/24/solid";

import { useBreakpoint } from "@/hooks/useBreakpoint";
import DefaultLayout from "@/layouts/default";

const slugToBackendName: Record<string, string> = {
  "atlanta-bouncers": "Atlanta Bouncers",
  "brooklyn-pickleball-team": "Brooklyn Pickleball Team",
  "carolina-hogs": "Carolina Hogs",
  "chicago-slice": "Chicago Slice",
  "columbus-sliders": "Columbus Sliders",
  "dallas-flash": "Dallas Flash",
  "la-mad-drops": "Los Angeles Mad Drops",
  "miami-pickleball-team": "Miami Pickleball Club",
  "nj-fives": "New Jersey 5s",
  "orlando-squeeze": "Orlando Squeeze",
  "phoenix-flames": "Phoenix Flames",
  "socal-hard-eights": "SoCal Hard Eights",
  "stl-shock": "St. Louis Shock",
  "texas-ranchers": "Texas Ranchers",
  "utah-black-diamonds": "Utah Black Diamonds",
  "new-york-hustlers": "New York Hustlers",
};
const backendToSlug = Object.fromEntries(
  Object.entries(slugToBackendName).map(([slug, name]) => [name, slug]),
);

const teamColors: Record<string, { border: string; bg: string }> = {
  "atlanta-bouncers": { border: "border-orange-500", bg: "bg-orange-100" },
  "brooklyn-pickleball-team": { border: "border-gray-700", bg: "bg-gray-100" },
  "carolina-hogs": { border: "border-red-500", bg: "bg-red-100" },
  "chicago-slice": { border: "border-red-600", bg: "bg-red-100" },
  "columbus-sliders": { border: "border-blue-600", bg: "bg-blue-100" },
  "dallas-flash": { border: "border-sky-500", bg: "bg-sky-100" },
  "la-mad-drops": { border: "border-teal-500", bg: "bg-teal-100" },
  "miami-pickleball-team": { border: "border-pink-500", bg: "bg-pink-100" },
  "nj-fives": { border: "border-indigo-600", bg: "bg-indigo-100" },
  "orlando-squeeze": { border: "border-yellow-500", bg: "bg-yellow-100" },
  "phoenix-flames": { border: "border-red-500", bg: "bg-red-100" },
  "socal-hard-eights": { border: "border-sky-500", bg: "bg-sky-100" },
  "stl-shock": { border: "border-blue-600", bg: "bg-blue-100" },
  "texas-ranchers": { border: "border-blue-600", bg: "bg-blue-100" },
  "utah-black-diamonds": { border: "border-gray-700", bg: "bg-gray-100" },
  "new-york-hustlers": { border: "border-cyan-500", bg: "bg-cyan-100" },
};

type Player = {
  name: string;
  rank: number;
  team: string;
  gamesWon: number;
  gamesLost: number;
  gamesWonPercent: number;
  ptsWon: number;
  ptsLost: number;
  ptsWonPercent: number;
};

type SortOption = {
  field: keyof Player;
  label: string;
  isPercentage?: boolean;
  isDescending?: boolean;
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    field: keyof Player;
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

  fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/player?${query.toString()}`)
    .then(async (res) => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const text = await res.text();
      return text ? JSON.parse(text) : [];
    })
    .then((data) => {
      const formatted = data.map((p: any): Player => ({
        name: p.name,
        rank: p.rank,
        team: p.team,
        gamesWon: p.games_won,
        gamesLost: p.games_lost,
        gamesWonPercent: p.games_won_percent,
        ptsWon: p.pts_won,
        ptsLost: p.pts_lost,
        ptsWonPercent: p.pts_won_percent,
      }));
      setPlayers(formatted);
      setLoading(false);
    })
    .catch(() => setLoading(false));
}, [search]);

  const sortOptions: SortOption[] = [
    { field: "rank", label: "Rank" },
    { field: "gamesWon", label: "Wins", isDescending: true },
    { field: "gamesLost", label: "Losses", isDescending: true },
    { field: "gamesWonPercent", label: "Win %", isPercentage: true, isDescending: true },
    { field: "ptsWon", label: "Points Won", isDescending: true },
    { field: "ptsLost", label: "Points Lost", isDescending: true },
    { field: "ptsWonPercent", label: "Points %", isPercentage: true, isDescending: true },
  ];

  const filteredPlayers = useMemo(() => {
  return players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase()));},
    [players, searchTerm]);

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

  const getTeamClasses = (player: Player) => {
    const teamSlug = backendToSlug[player.team] || "";
    const colors = teamColors[teamSlug];
    return {
      border: colors?.border || "border-gray-300",
      bg: colors?.bg || "bg-white",
    };
  };

  const toggleSummary = async (player: Player) => {
    const isExpanded = expandedPlayer === player.name;
    setExpandedPlayer(isExpanded ? null : player.name);

    if (!summaries[player.name]) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/player/${encodeURIComponent(player.name)}/summary`
        );
        const text = await res.text();
        setSummaries((prev) => ({ ...prev, [player.name]: text }));
      } catch {
        setSummaries((prev) => ({
          ...prev,
          [player.name]: "Failed to load summary.",
        }));
      }
    }
  };

  const handleSortChange = (field: keyof Player) => {
    if (sortConfig.field === field) {
      setSortConfig({
        field,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      const option = sortOptions.find(opt => opt.field === field);
      setSortConfig({
        field,
        direction: option?.isDescending ? "desc" : "asc",
      });
    }
    setShowSortMenu(false);
  };

  const getSortIcon = (field: keyof Player) => {
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
          className="mb-6 relative z-30"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                placeholder="Search players..."
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
                  className="absolute z-50 mt-2 w-full md:w-64 bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.2,
                    ease: "easeOut"
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
                        onClick={() => handleSortChange(option.field)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
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
                Sorted by: {
                  sortOptions.find(opt => opt.field === sortConfig.field)?.label
                } {getSortIcon(sortConfig.field)}
              </span>
              <span className="text-orange-500">
                ({sortConfig.direction === "asc" ? "Ascending" : "Descending"})
              </span>
            </div>
            
            {(searchTerm || sortConfig.field !== "rank" || sortConfig.direction !== "asc") && (
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
                          onClick={() => toggleSummary(player)}
                          onKeyDown={(e) =>
                            (e.key === "Enter" || e.key === " ") &&
                            toggleSummary(player)
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
                            <div className="text-sm italic text-gray-600 whitespace-pre-line">
                              {summaries[player.name] || "Loading summary..."}
                            </div>
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
                    <th className="px-6 py-4 text-left cursor-pointer" onClick={() => handleSortChange("name")}>
                      <div className="flex items-center gap-1">
                        Player
                        {sortConfig.field === "name" && (
                          <span className="text-orange-500">{getSortIcon("name")}</span>
                        )}
                      </div>
                    </th>
                    <th className="w-6" />
                    <th className="px-6 py-4 text-left">Team</th>
                    <th className="px-6 py-4 text-right cursor-pointer" onClick={() => handleSortChange("rank")}>
                      <div className="flex items-center justify-end gap-1">
                        {sortConfig.field === "rank" && (
                          <span className="text-orange-500">{getSortIcon("rank")}</span>
                        )}
                        Rank
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right cursor-pointer" onClick={() => handleSortChange("gamesWon")}>
                      <div className="flex items-center justify-end gap-1">
                        {sortConfig.field === "gamesWon" && (
                          <span className="text-orange-500">{getSortIcon("gamesWon")}</span>
                        )}
                        W
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right cursor-pointer" onClick={() => handleSortChange("gamesLost")}>
                      <div className="flex items-center justify-end gap-1">
                        {sortConfig.field === "gamesLost" && (
                          <span className="text-orange-500">{getSortIcon("gamesLost")}</span>
                        )}
                        L
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right cursor-pointer" onClick={() => handleSortChange("gamesWonPercent")}>
                      <div className="flex items-center justify-end gap-1">
                        {sortConfig.field === "gamesWonPercent" && (
                          <span className="text-orange-500">{getSortIcon("gamesWonPercent")}</span>
                        )}
                        Win %
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right cursor-pointer" onClick={() => handleSortChange("ptsWon")}>
                      <div className="flex items-center justify-end gap-1">
                        {sortConfig.field === "ptsWon" && (
                          <span className="text-orange-500">{getSortIcon("ptsWon")}</span>
                        )}
                        Pts Won
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right cursor-pointer" onClick={() => handleSortChange("ptsLost")}>
                      <div className="flex items-center justify-end gap-1">
                        {sortConfig.field === "ptsLost" && (
                          <span className="text-orange-500">{getSortIcon("ptsLost")}</span>
                        )}
                        Pts Lost
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right cursor-pointer" onClick={() => handleSortChange("ptsWonPercent")}>
                      <div className="flex items-center justify-end gap-1">
                        {sortConfig.field === "ptsWonPercent" && (
                          <span className="text-orange-500">{getSortIcon("ptsWonPercent")}</span>
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
                            onClick={() => toggleSummary(player)}
                            onKeyDown={(e) =>
                              (e.key === "Enter" || e.key === " ") &&
                              toggleSummary(player)
                            }
                          >
                            {player.name}
                          </td>
                          <td
                            className="w-6 text-center cursor-pointer"
                            onClick={() => toggleSummary(player)}
                          >
                            {expandedPlayer === player.name ? (
                              <ChevronDownIcon className="h-4 w-4 text-gray-600 mx-auto" />
                            ) : (
                              <ChevronRightIcon className="h-4 w-4 text-gray-600 mx-auto" />
                            )}
                          </td>
                          <td className="px-6 py-4">{player.team}</td>
                          <td className="px-6 py-4 text-right">{player.rank}</td>
                          <td className="px-6 py-4 text-right">{player.gamesWon}</td>
                          <td className="px-6 py-4 text-right">{player.gamesLost}</td>
                          <td className="px-6 py-4 text-right">
                            {player.gamesWonPercent.toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 text-right">{player.ptsWon}</td>
                          <td className="px-6 py-4 text-right">{player.ptsLost}</td>
                          <td className="px-6 py-4 text-right">
                            {player.ptsWonPercent.toFixed(1)}%
                          </td>
                        </motion.tr>
                        {expandedPlayer === player.name && (
                          <tr>
                            <td
                              className="px-6 py-4 text-sm italic text-gray-600 whitespace-pre-line bg-neutral-50"
                              colSpan={10}
                            >
                              {summaries[player.name] || "Loading summary..."}
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