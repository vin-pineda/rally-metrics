import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronRightIcon as ChevronRight,
} from "@heroicons/react/24/solid";

import DefaultLayout from "@/layouts/default";
import { useBreakpoint } from "@/hooks/useBreakpoint";

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

const slugToLogoFilename: Record<string, string> = Object.fromEntries(
  Object.entries(slugToBackendName).map(([slug]) => [
    slug,
    slug.replace(/-/g, "_") + ".png",
  ]),
);

const teamColors: Record<
  string,
  { text: string; border: string; thead: string; glow: string; bg: string }
> = {
  "atlanta-bouncers": {
    text: "text-orange-500",
    border: "border-orange-500",
    thead: "bg-orange-500/20 text-orange-900",
    glow: "bg-orange-500",
    bg: "bg-orange-100",
  },
  "brooklyn-pickleball-team": {
    text: "text-gray-700",
    border: "border-gray-700",
    thead: "bg-gray-700/20 text-gray-700",
    glow: "bg-gray-700",
    bg: "bg-gray-100",
  },
  "carolina-hogs": {
    text: "text-red-500",
    border: "border-red-500",
    thead: "bg-red-500/20 text-red-900",
    glow: "bg-red-500",
    bg: "bg-red-100",
  },
  "chicago-slice": {
    text: "text-red-600",
    border: "border-red-600",
    thead: "bg-red-600/20 text-red-600",
    glow: "bg-red-600",
    bg: "bg-red-100",
  },
  "columbus-sliders": {
    text: "text-blue-600",
    border: "border-blue-600",
    thead: "bg-blue-600/20 text-blue-600",
    glow: "bg-blue-600",
    bg: "bg-blue-100",
  },
  "dallas-flash": {
    text: "text-sky-500",
    border: "border-sky-500",
    thead: "bg-sky-500/20 text-sky-900",
    glow: "bg-sky-500",
    bg: "bg-sky-100",
  },
  "la-mad-drops": {
    text: "text-teal-500",
    border: "border-teal-500",
    thead: "bg-teal-500/20 text-teal-900",
    glow: "bg-teal-500",
    bg: "bg-teal-100",
  },
  "miami-pickleball-team": {
    text: "text-pink-500",
    border: "border-pink-500",
    thead: "bg-pink-500/20 text-pink-900",
    glow: "bg-pink-500",
    bg: "bg-pink-100",
  },
  "nj-fives": {
    text: "text-indigo-600",
    border: "border-indigo-600",
    thead: "bg-indigo-600/20 text-indigo-600",
    glow: "bg-indigo-600",
    bg: "bg-indigo-100",
  },
  "orlando-squeeze": {
    text: "text-yellow-500",
    border: "border-yellow-500",
    thead: "bg-yellow-500/20 text-yellow-900",
    glow: "bg-yellow-500",
    bg: "bg-yellow-100",
  },
  "phoenix-flames": {
    text: "text-red-500",
    border: "border-red-500",
    thead: "bg-red-500/20 text-red-900",
    glow: "bg-red-500",
    bg: "bg-red-100",
  },
  "socal-hard-eights": {
    text: "text-sky-500",
    border: "border-sky-500",
    thead: "bg-sky-500/20 text-sky-900",
    glow: "bg-sky-500",
    bg: "bg-sky-100",
  },
  "stl-shock": {
    text: "text-blue-600",
    border: "border-blue-600",
    thead: "bg-blue-600/20 text-blue-600",
    glow: "bg-blue-600",
    bg: "bg-blue-100",
  },
  "texas-ranchers": {
    text: "text-blue-600",
    border: "border-blue-600",
    thead: "bg-blue-600/20 text-blue-600",
    glow: "bg-blue-600",
    bg: "bg-blue-100",
  },
  "utah-black-diamonds": {
    text: "text-gray-700",
    border: "border-gray-700",
    thead: "bg-gray-700/20 text-gray-700",
    glow: "bg-gray-700",
    bg: "bg-gray-100",
  },
  "new-york-hustlers": {
    text: "text-cyan-500",
    border: "border-cyan-500",
    thead: "bg-cyan-500/20 text-cyan-900",
    glow: "bg-cyan-500",
    bg: "bg-cyan-100",
  },
};

const teamSlugsOrdered = Object.keys(slugToBackendName);

export default function TeamPage() {
  const router = useRouter();
  const { team } = router.query;
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string>>({});

  const slug = team?.toString() || "";
  const backendTeamName = slugToBackendName[slug] || "";
  const logoFilename = slugToLogoFilename[slug] || "";
  const teamStyle = teamColors[slug] || {
    text: "text-orange-500",
    border: "border-orange-500",
    thead: "bg-orange-500/20 text-orange-900",
    glow: "bg-orange-500",
    bg: "bg-orange-100",
  };

  const currentIndex = teamSlugsOrdered.indexOf(slug);
  const goToTeam = (index: number) => {
    const nextSlug = teamSlugsOrdered[index];

    if (nextSlug) router.push(`/teams/${nextSlug}`);
  };

  const isMobile = useBreakpoint(768);
  const isNarrowScreen = useBreakpoint(1760);

  const handleTogglePlayer = async (player: Player) => {
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
        console.error("Failed to fetch summary:", err);
        setSummaries((prev) => ({
          ...prev,
          [player.name]: "Error loading summary.",
        }));
      }
    }
  };

  useEffect(() => {
    if (router.isReady && backendTeamName) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/player?team=${encodeURIComponent(backendTeamName)}`,
      )
        .then((res) => res.json())
        .then((data) => {
          const formatted = data
        .map(
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
        )
        .sort((a: Player, b: Player) => a.rank - b.rank);
          setPlayers(formatted);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch players:", err);
          setLoading(false);
        });
    }
  }, [router.isReady, backendTeamName]);

  return (
    <DefaultLayout>
      {!isNarrowScreen && (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <motion.div
            animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
            className="absolute z-20"
            style={{ top: "22.5%", left: "2.5%" }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          >
            <Image
              alt="Animated Racket"
              className="object-contain"
              height={300}
              src="/rm/racket.png"
              width={300}
            />
          </motion.div>
        </div>
      )}

      <div className="relative overflow-hidden min-h-screen">
        <div className="relative z-20 w-full flex justify-center items-center mt-2">
          {currentIndex > 0 && (
            <motion.button
              className="fixed z-50 p-2 rounded-full bg-white shadow-md hover:scale-110 hover:shadow-xl transition
                         top-[10%] left-2 md:top-1/2 md:left-4 md:transform md:-translate-y-1/2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => goToTeam(currentIndex - 1)}
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </motion.button>
          )}

          {currentIndex < teamSlugsOrdered.length - 1 && (
            <motion.button
              className="fixed z-50 p-2 rounded-full bg-white shadow-md hover:scale-110 hover:shadow-xl transition
                         top-[10%] right-2 md:top-1/2 md:right-4 md:transform md:-translate-y-1/2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => goToTeam(currentIndex + 1)}
            >
              <ChevronRightIcon className="w-6 h-6" />
            </motion.button>
          )}
        </div>
        <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row gap-10 md:gap-16 justify-center items-start">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="md:w-1/3 w-full text-center md:text-left min-h-[410px]"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center">
              <div
                className={`border-8 ${teamStyle.border} rounded-xl transition-transform md:hover:scale-105 w-[280px] sm:w-[320px] md:w-[360px]`}
              >
                <Image
                  alt={`${backendTeamName} Logo`}
                  className="rounded-lg"
                  height={360}
                  src={`/teams/${logoFilename}`}
                  width={360}
                />
              </div>
            </div>
            <motion.h1
              animate={{ opacity: 1 }}
              className={`mt-6 text-4xl font-bold capitalize ${teamStyle.text}`}
              initial={{ opacity: 0 }}
              transition={{ delay: 0.2 }}
            >
              {backendTeamName}
            </motion.h1>
            <motion.p
              animate={{ opacity: 1 }}
              className="text-gray-700 mt-2 leading-relaxed"
              initial={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
            >
              Welcome to the <strong>{backendTeamName}</strong> team page. Dive
              into stats and dominate your fantasy draft.
            </motion.p>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="md:w-2/3 w-full"
            initial={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.6 }}
          >
            {loading ? (
              <div className="animate-pulse text-center text-lg text-gray-400">
                Loading player stats...
              </div>
            ) : players.length === 0 ? (
              <p className="text-center text-gray-500 text-lg">
                No players found for this team.
              </p>
            ) : (
              <div className="overflow-x-auto scrollbar-hide rounded-xl shadow-lg border">
                {isMobile ? (
                  <div className="space-y-4 p-4">
                    {players.map((player) => (
                      <motion.div
                        key={player.name}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-xl overflow-hidden border-l-4 ${teamStyle.border} ${teamStyle.bg} transition-all shadow-lg`}
                        initial={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="p-4">
                          <div
                            className="flex justify-between items-center cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onClick={() => handleTogglePlayer(player)}
                            onKeyDown={(e) =>
                              (e.key === "Enter" || e.key === " ") &&
                              handleTogglePlayer(player)
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
                              <ChevronRight className="h-5 w-5 text-gray-600" />
                            )}
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-3">
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
                                Pts
                              </div>
                              <div className="font-semibold text-gray-900">
                                {player.ptsWon}
                                <span className="text-gray-400">/</span>
                                {player.ptsLost}
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
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div
                    className={`rounded-xl overflow-hidden border-l-4 ${teamStyle.border}`}
                  >
                    <table className="w-full text-md bg-white text-gray-800">
                      <thead
                        className={`sticky top-0 z-20 shadow-md ${teamStyle.thead}`}
                      >
                        <tr>
                          <th className="px-6 py-4 text-left">Player</th>
                          <th className="w-6" />
                          <th className="px-6 py-4 text-right">Rank</th>
                          <th className="px-6 py-4 text-right">W</th>
                          <th className="px-6 py-4 text-right">L</th>
                          <th className="px-6 py-4 text-right">Win %</th>
                          <th className="px-6 py-4 text-right">Pts %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {players.map((player) => (
                          <React.Fragment key={player.name}>
                            <motion.tr
                              animate={{ opacity: 1 }}
                              className={`even:bg-gray-50 transition-all hover:scale-[1.005]  ${teamStyle.border}`}
                              initial={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <td
                                className="px-6 py-4 font-semibold cursor-pointer"
                                role="button"
                                tabIndex={0}
                                onClick={() => handleTogglePlayer(player)}
                                onKeyDown={(e) =>
                                  (e.key === "Enter" || e.key === " ") &&
                                  handleTogglePlayer(player)
                                }
                              >
                                {player.name}
                              </td>
                              <td
                                className="w-6 text-center cursor-pointer"
                                onClick={() => handleTogglePlayer(player)}
                              >
                                {expandedPlayer === player.name ? (
                                  <ChevronDownIcon className="h-4 w-4 text-gray-600" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-600" />
                                )}
                              </td>
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
                                {player.gamesWonPercent?.toFixed(1)}%
                              </td>
                              <td className="px-6 py-4 text-right">
                                {player.ptsWonPercent?.toFixed(1)}%
                              </td>
                            </motion.tr>
                            {expandedPlayer === player.name && (
                              <tr>
                                <td
                                  className="px-6 py-4 text-sm italic text-gray-600 whitespace-pre-line bg-neutral-50"
                                  colSpan={7}
                                >
                                  {summaries[player.name] ||
                                    "Loading summary..."}
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                      Points Won: {player.ptsWon}
                                    </span>
                                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                      Points Lost: {player.ptsLost}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DefaultLayout>
  );
}