import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DefaultLayout from "@/layouts/default";
import Image from "next/image";
import { motion } from "framer-motion";

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

const slugToLogoFilename: Record<string, string> = {
  "atlanta-bouncers": "atlanta_bouncers.png",
  "brooklyn-pickleball-team": "brooklyn_pickleball_team.png",
  "carolina-hogs": "carolina_hogs.png",
  "chicago-slice": "chicago_slice.png",
  "columbus-sliders": "columbus_sliders.png",
  "dallas-flash": "dallas_flash.png",
  "la-mad-drops": "la_mad_drops.png",
  "miami-pickleball-team": "miami_pickleball_team.png",
  "nj-fives": "nj_fives.png",
  "orlando-squeeze": "orlando_squeeze.png",
  "phoenix-flames": "phoenix_flames.png",
  "socal-hard-eights": "socal_hard_eights.png",
  "stl-shock": "stl_shock.png",
  "texas-ranchers": "texas_ranchers.png",
  "utah-black-diamonds": "utah_black_diamonds.png",
  "new-york-hustlers": "new_york_hustlers.png",
};

const teamColors: Record<string, { text: string; border: string; thead: string }> = {
  "atlanta-bouncers": { text: "text-orange-500", border: "border-orange-500", thead: "bg-orange-500/20 text-orange-900" },
  "brooklyn-pickleball-team": { text: "text-gray-700", border: "border-gray-700", thead: "bg-gray-700/20 text-gray-700" },
  "carolina-hogs": { text: "text-red-500", border: "border-red-500", thead: "bg-red-500/20 text-red-900" },
  "chicago-slice": { text: "text-red-600", border: "border-red-600", thead: "bg-red-600/20 text-red-600" },
  "columbus-sliders": { text: "text-blue-600", border: "border-blue-600", thead: "bg-blue-600/20 text-blue-600" },
  "dallas-flash": { text: "text-sky-500", border: "border-sky-500", thead: "bg-sky-500/20 text-sky-900" },
  "la-mad-drops": { text: "text-teal-500", border: "border-teal-500", thead: "bg-teal-500/20 text-teal-900" },
  "miami-pickleball-team": { text: "text-pink-500", border: "border-pink-500", thead: "bg-pink-500/20 text-pink-900" },
  "nj-fives": { text: "text-indigo-600", border: "border-indigo-600", thead: "bg-indigo-600/20 text-indigo-600" },
  "orlando-squeeze": { text: "text-yellow-500", border: "border-yellow-500", thead: "bg-yellow-500/20 text-yellow-900" },
  "phoenix-flames": { text: "text-red-500", border: "border-red-500", thead: "bg-red-500/20 text-red-900" },
  "socal-hard-eights": { text: "text-sky-500", border: "border-sky-500", thead: "bg-sky-500/20 text-sky-900" },
  "stl-shock": { text: "text-blue-600", border: "border-blue-600", thead: "bg-blue-600/20 text-blue-600" },
  "texas-ranchers": { text: "text-blue-600", border: "border-blue-600", thead: "bg-blue-600/20 text-blue-600" },
  "utah-black-diamonds": { text: "text-gray-700", border: "border-gray-700", thead: "bg-gray-700/20 text-gray-700" },
  "new-york-hustlers": { text: "text-cyan-500", border: "border-cyan-500", thead: "bg-cyan-500/20 text-cyan-900" },
};

export default function TeamPage() {
  const router = useRouter();
  const { team } = router.query;
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const slug = team?.toString() || "";
  const backendTeamName = slugToBackendName[slug] || "";
  const logoFilename = slugToLogoFilename[slug] || "";
  const teamStyle = teamColors[slug] || {
    text: "text-orange-500",
    border: "border-orange-500",
    thead: "bg-orange-500/20 text-orange-900",
  };

  useEffect(() => {
    if (backendTeamName) {
      fetch(`http://localhost:8080/api/v1/player?team=${encodeURIComponent(backendTeamName)}`)
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
  }, [backendTeamName]);

  return (
    <DefaultLayout>
      <div className="relative overflow-hidden min-h-screen">
        {/* Animated visuals */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute w-80 h-80 bg-yellow-400 opacity-10 blur-3xl bottom-[-100px] left-[-100px] rounded-full" />
        </motion.div>

        {/* Main layout */}
        <div className="relative z-10 p-10 flex flex-col md:flex-row gap-16 justify-center items-start">
          {/* Team Logo + Info */}
          <div className="md:w-1/3 w-full text-center md:text-left">
            <div className={`border-8 ${teamStyle.border} rounded-xl transition-transform hover:scale-105`}>
              <Image
                src={`/teams/${logoFilename}`}
                alt={`${backendTeamName} Logo`}
                width={350}
                height={350}
                className="rounded-lg"
              />
            </div>
            <h1 className={`mt-6 text-4xl font-bold capitalize ${teamStyle.text}`}>{backendTeamName}</h1>
            <p className="text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">
              Welcome to the <strong>{backendTeamName}</strong> team page. Dive into stats and dominate your fantasy draft.
            </p>
          </div>

          {/* Player Stats */}
          <div className="md:w-2/3 w-full">
            {loading ? (
              <p className={`${teamStyle.text} text-center text-lg`}>Loading player stats...</p>
            ) : players.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 text-lg">No players found for this team.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl shadow-lg border dark:border-neutral-800">
                <table className="w-full text-md bg-white dark:bg-neutral-800 text-gray-800 dark:text-white">
                  <thead className={`${teamStyle.thead} dark:bg-neutral-700`}>
                    <tr>
                      <th className="px-6 py-4">Name</th>
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
                      <tr key={player.name} className="even:bg-gray-50 dark:even:bg-neutral-700/50">
                        <td className="px-6 py-4 font-semibold">{player.name}</td>
                        <td className="px-6 py-4">{player.rank}</td>
                        <td className="px-6 py-4">{player.games_won}</td>
                        <td className="px-6 py-4">{player.games_lost}</td>
                        <td className="px-6 py-4">{player.games_won_percent.toFixed(1)}%</td>
                        <td className="px-6 py-4">{player.pts_won}</td>
                        <td className="px-6 py-4">{player.pts_lost}</td>
                        <td className="px-6 py-4">{player.pts_won_percent.toFixed(1)}%</td>
                      </tr>
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
