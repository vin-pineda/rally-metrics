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
import { teamColors, defaultTeamColor } from "@/config/teamColors";
import {
  slugToBackendName,
  slugToLogoFilename,
  teamSlugsOrdered,
} from "@/config/teamNames";
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

export default function TeamPage() {
  const router = useRouter();
  const { team } = router.query;
  const [players, setPlayers] = useState<PlayerView[]>([]);
  const [loading, setLoading] = useState(true);
  const { expandedPlayer, summaries, toggleSummary } = usePlayerSummary({
    errorMessage: "Error loading summary.",
  });

  const slug = team?.toString() || "";
  const backendTeamName = slugToBackendName[slug] || "";
  const logoFilename = slugToLogoFilename[slug] || "";
  const teamStyle = teamColors[slug] || defaultTeamColor;

  const currentIndex = teamSlugsOrdered.indexOf(slug);
  const goToTeam = (index: number) => {
    const nextSlug = teamSlugsOrdered[index];

    if (nextSlug) router.push(`/teams/${nextSlug}`);
  };

  const isMobile = useBreakpoint(768);
  const isNarrowScreen = useBreakpoint(1760);

  useEffect(() => {
    if (router.isReady && backendTeamName) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/player?team=${encodeURIComponent(backendTeamName)}`,
      )
        .then((res) => res.json())
        .then((data) => {
          const formatted = (data as Player[])
            .map(toPlayerView)
            .sort((a: PlayerView, b: PlayerView) => a.rank - b.rank);

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
                {logoFilename ? (
                  <Image
                    alt={`${backendTeamName} Logo`}
                    className="rounded-lg"
                    height={360}
                    src={`/teams/${logoFilename}`}
                    width={360}
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-100 text-gray-400 text-sm">
                    No logo available
                  </div>
                )}
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
                              <ChevronRight className="h-5 w-5 text-gray-600" />
                            )}
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-3">
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
                              <div className="text-xs text-gray-500">Pts</div>
                              <div className="font-semibold text-gray-900">
                                {player.ptsWon}
                                <span className="text-gray-400">/</span>
                                {player.ptsLost}
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
                                  className="px-6 py-4 bg-neutral-50"
                                  colSpan={7}
                                >
                                  <ExpandedSnapshot
                                    player={player}
                                    state={summaries[player.name]}
                                  />
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
