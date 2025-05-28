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

export default function TeamPage() {
  const router = useRouter();
  const { team } = router.query;
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const slug = team?.toString() || "";
  const backendTeamName = slugToBackendName[slug] || "";
  const logoFilename = slugToLogoFilename[slug] || "";

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
      {/* Floating visuals */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="absolute w-96 h-96 bg-yellow-400 opacity-10 rounded-full blur-3xl bottom-[-150px] right-[-150px]"
        />
        {[
          { src: "/rm/racket.png", style: { top: "20%", left: "5%" } },
          { src: "/rm/pickleball.png", style: { bottom: "15%", right: "7.5%" } },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            className="absolute z-20 transition-transform hover:scale-110"
            animate={{ y: [0, -30, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            style={item.style}
          >
            <Image src={item.src} alt="Decoration" width={150} height={150} className="object-contain" />
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="p-8 flex flex-col md:flex-row gap-12 items-start min-h-screen z-10 relative">
        {/* Left Panel */}
        <div className="md:w-1/3 w-full text-center md:text-left">
          <div className="border-5 border-orange-300 dark:border-orange-500 rounded-xl inline-block mx-auto mb-6 hover:scale-105 transition-transform duration-300">

            <Image
              src={`/teams/${logoFilename}`}
              alt={`${backendTeamName} Logo`}
              width={300}
              height={300}
              className="object-contain bg-white dark:bg-neutral-900 rounded-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-orange-500 capitalize mb-3">
            {backendTeamName}
          </h1>
          <p className="text-gray-700 dark:text-gray-300">
            Welcome to the <strong>{backendTeamName}</strong> team page! Explore player stats and dominate your fantasy league with precision insights.
          </p>
        </div>

        {/* Table */}
        <div className="md:w-2/3 w-full">
          {loading ? (
            <p className="text-center text-orange-500 text-lg">Loading player stats...</p>
          ) : players.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 text-lg">No players found for this team.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl shadow-lg border dark:border-neutral-800">
              <table className="min-w-full w-full text-sm text-left bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200">
                <thead className="bg-orange-200 dark:bg-orange-500/20 text-orange-900 dark:text-orange-300">
                  <tr>
                    <th className="px-4 py-3">Name</th>
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
                    <tr key={player.name} className="even:bg-gray-50 dark:even:bg-neutral-800/50">
                      <td className="px-4 py-3 font-medium">{player.name}</td>
                      <td className="px-4 py-3">{player.rank}</td>
                      <td className="px-4 py-3">{player.games_won}</td>
                      <td className="px-4 py-3">{player.games_lost}</td>
                      <td className="px-4 py-3">{player.games_won_percent.toFixed(1)}%</td>
                      <td className="px-4 py-3">{player.pts_won}</td>
                      <td className="px-4 py-3">{player.pts_lost}</td>
                      <td className="px-4 py-3">{player.pts_won_percent.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
