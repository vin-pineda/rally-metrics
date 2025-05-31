import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import DefaultLayout from "@/layouts/default";

type Player = {
  name: string;
  rank: number;
  team: string;
  games_won: number;
  games_lost: number;
  games_won_percent: number;
  pts_won: number;
  pts_lost: number;
  pts_won_percent: number;
};

const slugToBackendName: Record<string, string> = {
  "atlanta-bouncers": "Atlanta Bouncers",
  "brooklyn-pickleball-team": "Brooklyn Pickleball Team",
  "carolina-hogs": "Carolina Hogs",
  "chicago-slice": "Chicago Slice",
  "columbus-sliders": "Columbus Sliders",
  "dallas-flash": "Dallas Flash Pickleball",
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

const slugToLogoFilename: Record<string, string> = Object.fromEntries(
  Object.entries(slugToBackendName).map(([slug]) => [
    slug,
    slug.replace(/-/g, "_") + ".png",
  ])
);

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

  useEffect(() => {
    if (router.isReady && backendTeamName) {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/player?team=${encodeURIComponent(backendTeamName)}`)
        .then((res) => res.json())
        .then((data) => {
          setPlayers(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch players:", err);
          setLoading(false);
        });
    }
  }, [router.isReady, backendTeamName]);

  const handleTogglePlayer = async (player: Player) => {
    const isExpanded = expandedPlayer === player.name;
    setExpandedPlayer(isExpanded ? null : player.name);

    if (!summaries[player.name]) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/player/${encodeURIComponent(player.name)}/summary`);
        const text = await res.text();
        setSummaries((prev) => ({ ...prev, [player.name]: text }));
      } catch (err) {
        console.error("Failed to fetch summary:", err);
        setSummaries((prev) => ({ ...prev, [player.name]: "Error loading summary." }));
      }
    }
  };

  return (
    <DefaultLayout>
      <div className="relative overflow-hidden min-h-screen py-10 px-6 md:px-16">
        <div className="flex flex-col md:flex-row gap-10 justify-center items-start">
          <div className="md:w-1/3 w-full text-center md:text-left">
            <div className="border-8 rounded-xl p-4 mx-auto w-[300px]">
              <Image
                alt={`${backendTeamName} Logo`}
                src={`/teams/${logoFilename}`}
                width={300}
                height={300}
                className="rounded-lg object-contain"
              />
            </div>
            <h1 className="mt-6 text-4xl font-bold text-center md:text-left">
              {backendTeamName}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Welcome to the <strong>{backendTeamName}</strong> team page. Dive into stats and dominate your fantasy draft.
            </p>
          </div>

          <div className="md:w-2/3 w-full">
            {loading ? (
              <p className="text-center text-gray-400">Loading player stats...</p>
            ) : players.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">No players found for this team.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border dark:border-neutral-700">
                <table className="w-full text-md text-left bg-white dark:bg-neutral-800 text-gray-900 dark:text-white">
                  <thead className="bg-gray-100 dark:bg-neutral-700">
                    <tr>
                      <th className="px-4 py-3">Player</th>
                      <th className="w-6"></th>
                      <th className="px-4 py-3">Rank</th>
                      <th className="px-4 py-3">W</th>
                      <th className="px-4 py-3">L</th>
                      <th className="px-4 py-3">Win %</th>
                      <th className="px-4 py-3">Pts Won</th>
                      <th className="px-4 py-3">Pts Lost</th>
                      <th className="px-4 py-3">Pts %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player) => (
                      <>
                        <tr key={player.name} className="hover:bg-gray-50 dark:hover:bg-neutral-700">
                          <td className="px-4 py-3 cursor-pointer" onClick={() => handleTogglePlayer(player)}>{player.name}</td>
                          <td className="text-center cursor-pointer" onClick={() => handleTogglePlayer(player)}>{expandedPlayer === player.name ? "▼" : "▶"}</td>
                          <td className="px-4 py-3">{player.rank}</td>
                          <td className="px-4 py-3">{player.games_won}</td>
                          <td className="px-4 py-3">{player.games_lost}</td>
                          <td className="px-4 py-3">{player.games_won_percent?.toFixed(1) ?? "N/A"}%</td>
                          <td className="px-4 py-3">{player.pts_won}</td>
                          <td className="px-4 py-3">{player.pts_lost}</td>
                          <td className="px-4 py-3">{player.pts_won_percent?.toFixed(1) ?? "N/A"}%</td>
                        </tr>
                        {expandedPlayer === player.name && (
                          <tr>
                            <td colSpan={9} className="px-4 py-3 italic text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line bg-gray-50 dark:bg-neutral-700">
                              {summaries[player.name] || "Loading summary..."}
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
