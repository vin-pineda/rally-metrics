import { motion } from "framer-motion";

import { Player } from "@/types/player";
import { teamColors } from "@/config/teamColors";
import { backendToSlug } from "@/config/teamNames";

type PlayerCardProps = {
  player: Player | null;
};

/**
 * Stat card for a single player, used by the match predictor.
 * Colors are derived from the player's team via the shared maps.
 */
export default function PlayerCard({ player }: PlayerCardProps) {
  if (!player) return null;

  const teamSlug = backendToSlug[player.team] || "";
  const colors = teamColors[teamSlug] || {
    border: "border-gray-300",
    bg: "bg-gray-100",
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl overflow-hidden border-2 ${colors.border} ${colors.bg} w-full transition-all shadow-xl`}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="font-bold text-xl text-gray-900">{player.name}</div>
            <div className="text-xs text-gray-500">#{player.rank} Rank</div>
          </div>
          <div className="px-3 py-1 rounded-full bg-black bg-opacity-10 text-xs font-semibold">
            {player.team}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex flex-col">
            <div className="text-xs text-gray-500">W/L</div>
            <div className="font-semibold text-gray-900">
              {player.games_won}
              <span className="text-gray-400">/</span>
              {player.games_lost}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="text-xs text-gray-500">Win %</div>
            <div className="font-semibold text-gray-900">
              {player.games_won_percent.toFixed(1)}%
            </div>
          </div>

          <div className="flex flex-col">
            <div className="text-xs text-gray-500">Points</div>
            <div className="font-semibold text-gray-900">
              {player.pts_won}
              <span className="text-gray-400">/</span>
              {player.pts_lost}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="text-xs text-gray-500">Pts %</div>
            <div className="font-semibold text-gray-900">
              {player.pts_won_percent.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className={`h-2 ${colors.border.replace("border", "bg")}`} />
    </motion.div>
  );
}
