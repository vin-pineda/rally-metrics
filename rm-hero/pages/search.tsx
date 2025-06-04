import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import React from "react";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/solid";

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
  "nj-fives": "New Jersey 5S",
  "orlando-squeeze": "Orlando Squeeze",
  "phoenix-flames": "Phoenix Flames",
  "socal-hard-eights": "Socal Hard Eights",
  "stl-shock": "St. Louis Shock",
  "texas-ranchers": "Texas Ranchers",
  "utah-black-diamonds": "Utah Black Diamonds",
  "new-york-hustlers": "New York Hustlers",
};
const backendToSlug = Object.fromEntries(
  Object.entries(slugToBackendName).map(([slug, name]) => [name, slug]),
);

const teamColors: Record<string, { border: string; bg: string }> = {
  "atlanta-bouncers": {
    border: "border-orange-500",
    bg: "bg-orange-100",
  },
  "brooklyn-pickleball-team": {
    border: "border-gray-700",
    bg: "bg-gray-100",
  },
  "carolina-hogs": {
    border: "border-red-500",
    bg: "bg-red-100",
  },
  "chicago-slice": {
    border: "border-red-600",
    bg: "bg-red-100",
  },
  "columbus-sliders": {
    border: "border-blue-600",
    bg: "bg-blue-100",
  },
  "dallas-flash": {
    border: "border-sky-500",
    bg: "bg-sky-100",
  },
  "la-mad-drops": {
    border: "border-teal-500",
    bg: "bg-teal-100",
  },
  "miami-pickleball-team": {
    border: "border-pink-500",
    bg: "bg-pink-100",
  },
  "nj-fives": {
    border: "border-indigo-600",
    bg: "bg-indigo-100",
  },
  "orlando-squeeze": {
    border: "border-yellow-500",
    bg: "bg-yellow-100",
  },
  "phoenix-flames": {
    border: "border-red-500",
    bg: "bg-red-100",
  },
  "socal-hard-eights": {
    border: "border-sky-500",
    bg: "bg-sky-100",
  },
  "stl-shock": {
    border: "border-blue-600",
    bg: "bg-blue-100",
  },
  "texas-ranchers": {
    border: "border-blue-600",
    bg: "bg-blue-100",
  },
  "utah-black-diamonds": {
    border: "border-gray-700",
    bg: "bg-gray-100",
  },
  "new-york-hustlers": {
    border: "border-cyan-500",
    bg: "bg-cyan-100",
  },
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

export default function SearchPage() {
  const router = useRouter();
  const { name, team } = router.query;
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string>>({});

  useEffect(() => {
    const query = new URLSearchParams();

    if (name) query.append("name", name as string);
    if (team) query.append("team", team as string);

    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/player?${query.toString()}`,
    )
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const text = await res.text();

        return text ? JSON.parse(text) : [];
      })
      .then((data) => {
        const formatted = data.map(
          (p: any): Player => ({
            name: p.name,
            rank: p.rank,
            team: p.team,
            gamesWon: p.games_won,
            gamesLost: p.games_lost,
            gamesWonPercent: p.games_won_percent,
            ptsWon: p.pts_won,
            ptsLost: p.pts_lost,
            ptsWonPercent: p.pts_won_percent,
          }),
        );

        setPlayers(formatted);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [name, team]);

  const isMobile = useBreakpoint(768);

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
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/player/${encodeURIComponent(player.name)}/summary`,
        );
        const text = await res.text();

        setSummaries((prev) => ({ ...prev, [player.name]: text }));
      } catch (err) {
        setSummaries((prev) => ({
          ...prev,
          [player.name]: "Failed to load summary.",
        }));
      }
    }
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
          Search Results for &quot;{name}&quot;
          {team ? ` on team "${team}"` : ""}
        </motion.h1>

        {loading ? (
          <p className="text-gray-500 text-lg">Loading...</p>
        ) : players.length === 0 ? (
          <p className="text-gray-500 text-lg">
            No players found.
          </p>
        ) : (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="overflow-x-auto scrollbar-hide rounded-xl shadow-lg border"
            initial={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.6 }}
          >
            {isMobile ? (
              <div className="space-y-4 p-4">
                {players.map((player) => {
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
                            <div className="text-xs text-gray-500">
                              Team
                            </div>
                            <div className="font-semibold text-gray-900">
                              {player.team}
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="text-xs text-gray-500">
                              W/L
                            </div>
                            <div className="font-semibold text-gray-900">
                              {player.gamesWon}
                              <span className="text-gray-400">/</span>
                              {player.gamesLost}
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="text-xs text-gray-500">
                              Win %
                            </div>
                            <div className="font-semibold text-gray-900">
                              {player.gamesWonPercent.toFixed(1)}%
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="text-xs text-gray-500">
                              Pts %
                            </div>
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
                    <th className="px-6 py-4 text-left">Player</th>
                    <th className="w-6" />
                    <th className="px-6 py-4 text-left">Team</th>
                    <th className="px-6 py-4 text-right">Rank</th>
                    <th className="px-6 py-4 text-right">W</th>
                    <th className="px-6 py-4 text-right">L</th>
                    <th className="px-6 py-4 text-right">Win %</th>
                    <th className="px-6 py-4 text-right">Pts Won</th>
                    <th className="px-6 py-4 text-right">Pts Lost</th>
                    <th className="px-6 py-4 text-right">Pts %</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => {
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
        )}
      </motion.div>
    </DefaultLayout>
  );
}
