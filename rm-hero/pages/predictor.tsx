import { useState, useEffect, useRef } from "react";
import { Button } from "@heroui/button";
import { motion } from "framer-motion";

import DefaultLayout from "@/layouts/default";
import PlayerCard from "@/components/PlayerCard";
import ModelInfoDisclosure from "@/components/ModelInfoDisclosure";
import { Player } from "@/types/player";

type KeyFactor = {
  label: string;
  display_a: string;
  display_b: string;
  advantage: "A" | "B" | "EVEN";
};

type ScoutReport = {
  archetype: string;
  strengths: string[];
  weaknesses: string[];
  outlook: string;
};

type MatchPrediction = {
  winner_name: string;
  win_probability: number;
  moneyline_odds: number;
  reasoning: string;
  confidence?: string;
  key_factors?: KeyFactor[];
  scouting_a?: ScoutReport;
  scouting_b?: ScoutReport;
  model_version?: string;
};

/**
 * Single AI scouting report card (archetype pill, strengths, weaknesses,
 * outlook). Renders a muted placeholder when the report is missing or the
 * backend flagged it as unavailable.
 */
function ScoutingCard({
  name,
  report,
}: {
  name: string;
  report?: ScoutReport;
}) {
  const unavailable =
    !report ||
    report.archetype === "Unavailable" ||
    !report.strengths ||
    report.strengths.length === 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
      <div className="text-xs text-gray-500 mb-1">{name}</div>

      {unavailable ? (
        <div className="text-sm text-gray-400 italic py-2">
          Scouting unavailable
        </div>
      ) : (
        <>
          <div className="inline-block rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-semibold text-orange-600 mb-3">
            {report.archetype}
          </div>

          {report.strengths.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Strengths
              </div>
              <ul className="space-y-1">
                {report.strengths.map((s, i) => (
                  <li
                    key={`s-${i}`}
                    className="flex gap-2 text-sm text-gray-700"
                  >
                    <span aria-hidden="true" className="text-green-500">
                      ▲
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.weaknesses && report.weaknesses.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Weaknesses
              </div>
              <ul className="space-y-1">
                {report.weaknesses.map((w, i) => (
                  <li
                    key={`w-${i}`}
                    className="flex gap-2 text-sm text-gray-700"
                  >
                    <span aria-hidden="true" className="text-amber-500">
                      ▼
                    </span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.outlook && (
            <div className="text-sm text-gray-500 italic leading-relaxed">
              {report.outlook}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function MatchPredictorPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerA, setPlayerA] = useState("");
  const [playerB, setPlayerB] = useState("");
  const [prediction, setPrediction] = useState<MatchPrediction | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSelectAFocused, setIsSelectAFocused] = useState(false);
  const [isSelectBFocused, setIsSelectBFocused] = useState(false);
  const selectARef = useRef<HTMLSelectElement>(null);
  const selectBRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/player`)
      .then((res) => res.json())
      .then((data) =>
        setPlayers(
          (data as Player[])
            .map(
              (p): Player => ({
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
            )
            .sort((a, b) => a.name.localeCompare(b.name)),
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
    setPrediction(null);
    setErrorMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/player/predict`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerA, playerB }),
        },
      );

      if (res.status === 404) {
        const text = await res.text();

        setErrorMessage(
          text?.trim() ||
            "One of the selected players could not be found. Please try again.",
        );

        return;
      }

      if (!res.ok) {
        setErrorMessage("Error generating prediction. Please try again.");

        return;
      }

      const data: MatchPrediction = await res.json();

      setPrediction(data);
    } catch {
      setErrorMessage("Error generating prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatMoneyline = (odds: number) => (odds > 0 ? `+${odds}` : `${odds}`);

  const getConfidenceStyle = (confidence?: string) => {
    switch (confidence?.toUpperCase()) {
      case "HIGH":
        return "bg-green-50 text-green-700 border border-green-200";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "LOW":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

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

        <p className="text-gray-600 mb-4 text-lg max-w-2xl mx-auto">
          Select two players and get a bold, AI-powered fantasy prediction.
        </p>

        <ModelInfoDisclosure />

        <div className="mt-10 flex flex-col gap-8 md:flex-row md:justify-center md:items-start md:gap-10">
          <div className="flex flex-col gap-4 w-full md:w-1/2">
            <div className="relative w-full">
              <select
                ref={selectARef}
                className={`rounded-xl px-4 py-3 text-center focus:ring-2 focus:outline-none transition-all border-2 w-full
                             text-gray-900 appearance-none pr-10 bg-white`}
                value={playerA}
                onBlur={() => setIsSelectAFocused(false)}
                onChange={(e) => {
                  setPlayerA(e.target.value);
                  setTimeout(() => setIsSelectAFocused(false), 100);
                }}
                onFocus={() => setIsSelectAFocused(true)}
              >
                <option value="">Select Player</option>
                {players.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
              <motion.div
                animate={{ rotate: isSelectAFocused ? 180 : 0 }}
                className="pointer-events-none absolute right-3 top-[40%] -translate-y-1/2"
                transition={{ duration: 0.2 }}
              >
                <svg
                  className="h-4 w-4 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    fillRule="evenodd"
                  />
                </svg>
              </motion.div>
            </div>
            <PlayerCard player={playerAData} />
          </div>

          <div className="flex justify-center items-center my-4 md:my-0">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              className="font-bold text-2xl text-orange-400 bg-white rounded-full p-3 shadow-lg"
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              VS
            </motion.div>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-1/2">
            <div className="relative w-full">
              <select
                ref={selectBRef}
                className={`rounded-xl px-4 py-3 text-center focus:ring-2 focus:outline-none transition-all border-2 w-full
                             text-gray-900 appearance-none pr-10 bg-white`}
                value={playerB}
                onBlur={() => setIsSelectBFocused(false)}
                onChange={(e) => {
                  setPlayerB(e.target.value);
                  setTimeout(() => setIsSelectBFocused(false), 100);
                }}
                onFocus={() => setIsSelectBFocused(true)}
              >
                <option value="">Select Player</option>
                {players.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
              <motion.div
                animate={{ rotate: isSelectBFocused ? 180 : 0 }}
                className="pointer-events-none absolute right-3 top-[40%] -translate-y-1/2"
                transition={{ duration: 0.2 }}
              >
                <svg
                  className="h-4 w-4 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    fillRule="evenodd"
                  />
                </svg>
              </motion.div>
            </div>
            <PlayerCard player={playerBData} />
          </div>
        </div>

        <motion.div
          animate={{ opacity: 1 }}
          className="mt-10"
          initial={{ opacity: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:brightness-110 transition-all shadow-lg hover:shadow-xl"
            color="primary"
            isDisabled={!playerA || !playerB || playerA === playerB || loading}
            size="lg"
            variant="solid"
            onClick={handlePredict}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    fill="currentColor"
                  />
                </svg>
                Generating...
              </div>
            ) : (
              "Predict Winner"
            )}
          </Button>
        </motion.div>

        {errorMessage && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 p-6 max-w-3xl mx-auto rounded-2xl shadow-xl border border-red-200 bg-red-50 text-red-700"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
          >
            {errorMessage}
          </motion.div>
        )}

        {prediction && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 p-6 md:p-8 max-w-3xl mx-auto rounded-2xl shadow-xl border border-gray-300 bg-white text-gray-900 text-left"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="text-sm font-semibold text-orange-500 uppercase tracking-wide">
                Prediction
              </div>
              {prediction.confidence && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getConfidenceStyle(
                    prediction.confidence,
                  )}`}
                >
                  {prediction.confidence.toUpperCase()} confidence
                </span>
              )}
            </div>

            <div className="text-xs text-gray-500 mb-4">
              Multi-agent analysis · scouted, synthesized &amp; fact-checked
            </div>

            {prediction.confidence?.toUpperCase() === "LOW" && (
              <div className="text-xs text-gray-500 mb-4 -mt-2">
                Limited sample — interpret with caution.
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <div>
                <div className="text-xs text-gray-500">Predicted Winner</div>
                <div className="text-3xl font-extrabold text-blue-600">
                  {prediction.winner_name}
                </div>
              </div>

              <div className="flex gap-6">
                <div>
                  <div className="text-xs text-gray-500">Win Probability</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(prediction.win_probability * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Moneyline</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatMoneyline(prediction.moneyline_odds)}
                  </div>
                </div>
              </div>
            </div>

            {prediction.key_factors && prediction.key_factors.length > 0 && (
              <div className="mb-6">
                <div className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-3">
                  Key Factors
                </div>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500">
                        <th className="px-4 py-2.5 text-left font-medium" />
                        <th className="px-4 py-2.5 text-right font-semibold text-gray-700">
                          {playerA || "Player A"}
                        </th>
                        <th className="px-4 py-2.5 text-right font-semibold text-gray-700">
                          {playerB || "Player B"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {prediction.key_factors.map((factor, i) => {
                        const aWins = factor.advantage === "A";
                        const bWins = factor.advantage === "B";

                        return (
                          <tr
                            key={`${factor.label}-${i}`}
                            className="border-t border-gray-100"
                          >
                            <td className="px-4 py-2.5 text-left text-gray-600">
                              {factor.label}
                            </td>
                            <td
                              className={`px-4 py-2.5 text-right tabular-nums ${
                                aWins
                                  ? "font-bold text-orange-600 bg-orange-50"
                                  : "text-gray-900"
                              }`}
                            >
                              {aWins && <span aria-hidden="true">▲ </span>}
                              {factor.display_a}
                            </td>
                            <td
                              className={`px-4 py-2.5 text-right tabular-nums ${
                                bWins
                                  ? "font-bold text-orange-600 bg-orange-50"
                                  : "text-gray-900"
                              }`}
                            >
                              {bWins && <span aria-hidden="true">▲ </span>}
                              {factor.display_b}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(prediction.scouting_a || prediction.scouting_b) && (
              <div className="mb-6">
                <div className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-3">
                  AI Scouting Reports
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ScoutingCard
                    name={playerA || "Player A"}
                    report={prediction.scouting_a}
                  />
                  <ScoutingCard
                    name={playerB || "Player B"}
                    report={prediction.scouting_b}
                  />
                </div>
              </div>
            )}

            <div className="text-gray-700 whitespace-pre-line leading-relaxed">
              {prediction.reasoning}
            </div>

            {prediction.model_version && (
              <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
                Model: {prediction.model_version}
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </DefaultLayout>
  );
}
