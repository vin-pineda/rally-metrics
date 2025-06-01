import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import React from "react";

import DefaultLayout from "@/layouts/default";

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
      .catch(() => {
        setLoading(false);
      });
  }, [name, team]);

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
      <div className="p-6 md:p-10 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">
          Search Results for &quot;{name}&quot;
          {team ? ` on team "${team}"` : ""}
        </h1>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 text-lg">Loading...</p>
        ) : players.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No players found.
          </p>
        ) : (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="overflow-x-auto scrollbar-hide rounded-xl shadow-lg border dark:border-neutral-800"
            initial={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.6 }}
          >
            <table className="w-full text-md bg-white dark:bg-neutral-800 text-gray-800 dark:text-white">
              <thead className="sticky top-0 z-20 shadow-md bg-gray-100 dark:bg-neutral-700 dark:text-white">
                <tr>
                  <th className="px-6 py-4">Player</th>
                  <th className="w-6" />
                  <th className="px-6 py-4">Team</th>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">W</th>
                  <th className="px-6 py-4">L</th>
                  <th className="px-6 py-4">Win %</th>
                  <th className="px-6 py-4">Pts Won</th>
                  <th className="px-6 py-4">Pts Lost</th>
                  <th className="px-6 py-4">Pts %</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <React.Fragment key={player.name}>
                    <tr className="even:bg-gray-50 dark:even:bg-neutral-700/50 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all">
                      <td
                        className="px-6 py-4 font-semibold cursor-pointer"
                        onClick={() => toggleSummary(player)}
                      >
                        {player.name}
                      </td>
                      <td
                        className="w-6 text-center cursor-pointer"
                        onClick={() => toggleSummary(player)}
                      >
                        {expandedPlayer === player.name ? "▼" : "▶"}
                      </td>
                      <td className="px-6 py-4">{player.team}</td>
                      <td className="px-6 py-4">{player.rank}</td>
                      <td className="px-6 py-4">{player.gamesWon}</td>
                      <td className="px-6 py-4">{player.gamesLost}</td>
                      <td className="px-6 py-4">
                        {player.gamesWonPercent.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4">{player.ptsWon}</td>
                      <td className="px-6 py-4">{player.ptsLost}</td>
                      <td className="px-6 py-4">
                        {player.ptsWonPercent.toFixed(1)}%
                      </td>
                    </tr>
                    {expandedPlayer === player.name && (
                      <tr>
                        <td
                          className="px-6 py-4 italic text-gray-600 dark:text-gray-300 bg-neutral-50 dark:bg-neutral-700"
                          colSpan={10}
                        >
                          <p className="line-clamp-5 whitespace-pre-line">
                            {summaries[player.name] || "Loading summary..."}
                          </p>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </DefaultLayout>
  );
}