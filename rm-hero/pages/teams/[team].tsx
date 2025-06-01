import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import DefaultLayout from "@/layouts/default";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

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


const teamColors: Record<
  string,
  { text: string; border: string; thead: string; glow: string }
> = {
  "atlanta-bouncers": {
    text: "text-orange-500",
    border: "border-orange-500",
    thead: "bg-orange-500/20 text-orange-900",
    glow: "bg-orange-500",
  },
  "brooklyn-pickleball-team": {
    text: "text-gray-700",
    border: "border-gray-700",
    thead: "bg-gray-700/20 text-gray-700",
    glow: "bg-gray-700",
  },
  "carolina-hogs": {
    text: "text-red-500",
    border: "border-red-500",
    thead: "bg-red-500/20 text-red-900",
    glow: "bg-red-500",
  },
  "chicago-slice": {
    text: "text-red-600",
    border: "border-red-600",
    thead: "bg-red-600/20 text-red-600",
    glow: "bg-red-600",
  },
  "columbus-sliders": {
    text: "text-blue-600",
    border: "border-blue-600",
    thead: "bg-blue-600/20 text-blue-600",
    glow: "bg-blue-600",
  },
  "dallas-flash": {
    text: "text-sky-500",
    border: "border-sky-500",
    thead: "bg-sky-500/20 text-sky-900",
    glow: "bg-sky-500",
  },
  "la-mad-drops": {
    text: "text-teal-500",
    border: "border-teal-500",
    thead: "bg-teal-500/20 text-teal-900",
    glow: "bg-teal-500",
  },
  "miami-pickleball-team": {
    text: "text-pink-500",
    border: "border-pink-500",
    thead: "bg-pink-500/20 text-pink-900",
    glow: "bg-pink-500",
  },
  "nj-fives": {
    text: "text-indigo-600",
    border: "border-indigo-600",
    thead: "bg-indigo-600/20 text-indigo-600",
    glow: "bg-indigo-600",
  },
  "orlando-squeeze": {
    text: "text-yellow-500",
    border: "border-yellow-500",
    thead: "bg-yellow-500/20 text-yellow-900",
    glow: "bg-yellow-500",
  },
  "phoenix-flames": {
    text: "text-red-500",
    border: "border-red-500",
    thead: "bg-red-500/20 text-red-900",
    glow: "bg-red-500",
  },
  "socal-hard-eights": {
    text: "text-sky-500",
    border: "border-sky-500",
    thead: "bg-sky-500/20 text-sky-900",
    glow: "bg-sky-500",
  },
  "stl-shock": {
    text: "text-blue-600",
    border: "border-blue-600",
    thead: "bg-blue-600/20 text-blue-600",
    glow: "bg-blue-600",
  },
  "texas-ranchers": {
    text: "text-blue-600",
    border: "border-blue-600",
    thead: "bg-blue-600/20 text-blue-600",
    glow: "bg-blue-600",
  },
  "utah-black-diamonds": {
    text: "text-gray-700",
    border: "border-gray-700",
    thead: "bg-gray-700/20 text-gray-700",
    glow: "bg-gray-700",
  },
  "new-york-hustlers": {
    text: "text-cyan-500",
    border: "border-cyan-500",
    thead: "bg-cyan-500/20 text-cyan-900",
    glow: "bg-cyan-500",
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
  };

  const currentIndex = teamSlugsOrdered.indexOf(slug);
  const goToTeam = (index: number) => {
    const nextSlug = teamSlugsOrdered[index];
    if (nextSlug) router.push(`/teams/${nextSlug}`);
  };

  const isMobile = useBreakpoint(480);
  const isTabletOrSmaller = useBreakpoint(1024); 

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

  useEffect(() => {
    if (router.isReady && backendTeamName) {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/player?team=${encodeURIComponent(backendTeamName)}`)
        .then((res) => res.json())
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
        .catch((err) => {
          console.error("Failed to fetch players:", err);
          setLoading(false);
        });
    }
  }, [router.isReady, backendTeamName]);

  return (
    <DefaultLayout>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div
  animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
  className="absolute z-20 hidden md:block"
  style={{ top: "20%", left: "5%" }}
  transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
>
  <Image
    alt="Animated Racket"
    className="object-contain"
    height={125}
    src="/rm/racket.png"
    width={250}
  />
</motion.div>

      </div>
      <div className="relative overflow-hidden min-h-screen">
        {/* Arrows */}
        <div className="relative z-20 w-full flex justify-center items-center mt-2">
          {/* Arrows on the sides */}
          {currentIndex > 0 && (
            <button
              className="fixed z-50 p-2 rounded-full bg-white dark:bg-neutral-800 shadow-md hover:scale-110 hover:shadow-xl transition
                         top-[10%] left-2 md:top-1/2 md:left-4 md:transform md:-translate-y-1/2"
              onClick={() => goToTeam(currentIndex - 1)}
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
          )}

          {currentIndex < teamSlugsOrdered.length - 1 && (
            <button
              className="fixed z-50 p-2 rounded-full bg-white dark:bg-neutral-800 shadow-md hover:scale-110 hover:shadow-xl transition
                         top-[10%] right-2 md:top-1/2 md:right-4 md:transform md:-translate-y-1/2"
              onClick={() => goToTeam(currentIndex + 1)}
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          )}


        </div>

        <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row gap-10 md:gap-16 justify-center items-start">
          <div className="md:w-1/3 w-full text-center md:text-left min-h-[410px]">
            <div className={`border-8 ${teamStyle.border} rounded-xl transition-transform hover:scale-105 w-[360px] mx-auto`}>
              <Image
                alt={`${backendTeamName} Logo`}
                className="rounded-lg mx-auto"
                height={360}
                width={360}
                src={`/teams/${logoFilename}`}
              />
            </div>

            <h1
              className={`mt-6 text-4xl font-bold capitalize ${teamStyle.text}`}
            >
              {backendTeamName}
            </h1>
            <p className="text-gray-700 dark:text-gray-300 mt-2 leading-relaxed">
              Welcome to the <strong>{backendTeamName}</strong> team page. Dive
              into stats and dominate your fantasy draft.
            </p>
          </div>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="md:w-2/3 w-full"
            initial={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.6 }}
          >
            {loading ? (
              <div className="animate-pulse text-center text-lg text-gray-400 dark:text-gray-500">
                Loading player stats...
              </div>
            ) : players.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 text-lg">
                No players found for this team.
              </p>
            ) : (
              <div className="overflow-x-auto scrollbar-hide rounded-xl shadow-lg border dark:border-neutral-800">
                <table className="w-full text-md bg-white dark:bg-neutral-800 text-gray-800 dark:text-white">
                  <thead className={`sticky top-0 z-20 shadow-md ${teamStyle.thead} dark:text-white dark:bg-neutral-700`}>
                    <tr>
                      <th className="px-6 py-4">Player</th>
                      <th className="w-6" />
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
                      <>
                        <tr key={player.name} className="even:bg-gray-50 dark:even:bg-neutral-700/50 transition-all hover:scale-[1.01] hover:bg-gray-100 dark:hover:bg-neutral-700">
                          <td className="px-6 py-4 font-semibold cursor-pointer" onClick={() => handleTogglePlayer(player)}>
                            {player.name}
                          </td>
                          <td className="w-6 text-center cursor-pointer" onClick={() => handleTogglePlayer(player)}>
                            {expandedPlayer === player.name ? "▼" : "▶"}
                          </td>
                          <td className="px-6 py-4">{player.rank}</td>
                          <td className="px-6 py-4">{player.gamesWon}</td>
                          <td className="px-6 py-4">{player.gamesLost}</td>
                          <td className="px-6 py-4">{player.gamesWonPercent != null ? player.gamesWonPercent.toFixed(1) + '%' : 'N/A'}</td>
                          <td className="px-6 py-4">{player.ptsWon}</td>
                          <td className="px-6 py-4">{player.ptsLost}</td>
                          <td className="px-6 py-4">{player.ptsWonPercent != null ? player.ptsWonPercent.toFixed(1) + '%' : 'N/A'}</td>
                        </tr>
                        {expandedPlayer === player.name && (
                          <tr>
                            <td className="px-6 py-4 text-sm italic text-gray-600 dark:text-gray-300 whitespace-pre-line bg-neutral-50 dark:bg-neutral-700" colSpan={9}>
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
          </motion.div>
        </div>
      </div>
    </DefaultLayout>
  );
}