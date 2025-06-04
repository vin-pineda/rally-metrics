import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { motion } from "framer-motion";

import DefaultLayout from "@/layouts/default";
import { useBreakpoint } from "@/hooks/useBreakpoint";

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
  games_won: number;
  games_lost: number;
  games_won_percent: number;
  pts_won: number;
  pts_lost: number;
  pts_won_percent: number;
};

export default function MatchPredictorPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerA, setPlayerA] = useState("");
  const [playerB, setPlayerB] = useState("");
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);
  const isMobile = useBreakpoint(768);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/player`)
      .then((res) => res.json())
      .then((data) =>
        setPlayers(
          data.map(
            (p: any): Player => ({
              name: p.name,
              rank: p.rank,
              team: p.team,
              games_won: p.games_won,
              games_lost: p.games_lost,
              games_won_percent: p.games_won_percent,
              pts_won: p.pts_won,
              pts_lost: p.pts_lost,
              pts_won_percent: p.pts_won_percent,
            }),
          ),
        ),
      )
      .catch(() => setPlayers([]));
  }, []);

  const getPlayerData = (name: string) =>
    players.find((p) => p.name === name) || null;
  const playerAData = getPlayerData(playerA);
  const playerBData = getPlayerData(playerB);

  const handlePredict = async () => {
    if (!playerA || !playerB || playerA === playerB) return;
    setLoading(true);
    setPrediction("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/player/predict`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerA, playerB }),
        },
      );
      const text = await res.text();

      setPrediction(text);
    } catch {
      setPrediction("Error generating prediction.");
    } finally {
      setLoading(false);
    }
  };

  const getTeamClasses = (player: Player | null) => {
    if (!player)
      return { border: "border-gray-300", bg: "bg-white" };
    const teamSlug = backendToSlug[player.team] || "";
    const colors = teamColors[teamSlug];

    return {
      border: colors?.border || "border-gray-300",
      bg: colors?.bg || "bg-white",
    };
  };

  const renderPlayerCard = (player: Player | null) => {
    if (!player) return null;
    const teamSlug = backendToSlug[player.team] || "";
    const colors = teamColors[teamSlug] || {
      border: "border-gray-300",
      bg: "bg-gray-100",
    };

    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl overflow-hidden border-2 ${colors.border} ${colors.bg} w-full transition-all shadow-lg`}
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="font-bold text-xl text-gray-900">
                {player.name}
              </div>
              <div className="text-xs text-gray-500">
                #{player.rank} Rank
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-black bg-opacity-10 text-xs font-semibold">
              {player.team}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="flex flex-col">
              <div className="text-xs text-gray-500">
                W/L
              </div>
              <div className="font-semibold text-gray-900">
                {player.games_won}
                <span className="text-gray-400">/</span>
                {player.games_lost}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="text-xs text-gray-500">
                Win %
              </div>
              <div className="font-semibold text-gray-900">
                {player.games_won_percent.toFixed(1)}%
              </div>
            </div>

            <div className="flex flex-col">
              <div className="text-xs text-gray-500">
                Points
              </div>
              <div className="font-semibold text-gray-900">
                {player.pts_won}
                <span className="text-gray-400">/</span>
                {player.pts_lost}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="text-xs text-gray-500">
                Pts %
              </div>
              <div className="font-semibold text-gray-900">
                {player.pts_won_percent.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        <div className={`h-2 ${colors.border.replace("border", "bg")}`} />
      </motion.div>
    );
  };

  const playerAClasses = getTeamClasses(playerAData);
  const playerBClasses = getTeamClasses(playerBData);

  return (
    <DefaultLayout>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto pt-16 pb-32 text-center px-4"
        initial={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-orange-400 to-orange-600 text-transparent bg-clip-text"
          initial={{ opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
        >
          Match Predictor
        </motion.h1>

        <p className="text-gray-600 mb-10 text-lg">
          Select two players and get a bold, AI-powered fantasy prediction.
        </p>

        <div className="flex flex-col gap-6 md:flex-row md:justify-center md:items-start md:gap-8">
          <div className="flex flex-col gap-4 w-full md:w-1/2">
            <select
              className={`rounded-xl px-4 py-2 text-center focus:ring-2 focus:outline-none transition-all border-2
                          ${playerAClasses.border} ${playerAClasses.bg} text-gray-900`}
              value={playerA}
              onChange={(e) => setPlayerA(e.target.value)}
            >
              <option value="">Select Player A</option>
              {players.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            {renderPlayerCard(playerAData)}
          </div>
          <div className="flex justify-center items-center">
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              className="font-bold text-lg text-orange-400"
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              VS
            </motion.span>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-1/2">
            <select
              className={`rounded-xl px-4 py-2 text-center focus:ring-2 focus:outline-none transition-all border-2
                          ${playerBClasses.border} ${playerBClasses.bg} text-gray-900`}
              value={playerB}
              onChange={(e) => setPlayerB(e.target.value)}
            >
              <option value="">Select Player B</option>
              {players.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            {renderPlayerCard(playerBData)}
          </div>
        </div>

        <motion.div
          animate={{ opacity: 1 }}
          className="mt-8"
          initial={{ opacity: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:brightness-110 transition-all shadow-md"
            color="primary"
            isDisabled={!playerA || !playerB || playerA === playerB}
            size="lg"
            variant="solid"
            onClick={handlePredict}
          >
            {loading ? "Generating..." : "Predict Winner"}
          </Button>
        </motion.div>

        {prediction && (
          <motion.div className="mt-10 p-6 max-w-3xl mx-auto rounded-2xl shadow-lg border border-gray-300 bg-gray-100 text-gray-900 whitespace-pre-line">
            {prediction}
          </motion.div>
        )}
      </motion.div>
    </DefaultLayout>
  );
}
