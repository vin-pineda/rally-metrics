import Image from "next/image";
import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

import { PlayerSnapshot } from "@/hooks/usePlayerSummary";
import { PlayerView } from "@/types/player";
import { teams, backendToSlug, slugToLogoFilename } from "@/config/teamNames";

// Strong ease-out so fills feel responsive (start fast, settle gently).
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

type VerdictStyle = { label: string; className: string };

/** Map a backend draft_tier to a labelled, colored verdict pill. */
function getVerdict(tier: string): VerdictStyle {
  switch (tier?.toUpperCase()) {
    case "STRONG_DRAFT":
      return {
        label: "Strong Draft",
        className: "bg-green-50 text-green-700 border border-green-200",
      };
    case "SOLID":
      return {
        label: "Solid",
        className: "bg-teal-50 text-teal-700 border border-teal-200",
      };
    case "FLEX":
      return {
        label: "Flex",
        className: "bg-amber-50 text-amber-700 border border-amber-200",
      };
    case "AVOID":
      return {
        label: "Avoid",
        className: "bg-red-50 text-red-700 border border-red-200",
      };
    default:
      return {
        label: "Unrated",
        className: "bg-gray-50 text-gray-600 border border-gray-200",
      };
  }
}

/** Stroke/accent color for the radial gauge + standing, keyed to the draft tier. */
function getTierColor(tier: string): string {
  switch (tier?.toUpperCase()) {
    case "STRONG_DRAFT":
      return "#16a34a";
    case "SOLID":
      return "#0d9488";
    case "FLEX":
      return "#d97706";
    case "AVOID":
      return "#dc2626";
    default:
      return "#9ca3af";
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Resolve a team's logo from its (backend or display) name; null if unknown. */
function teamLogo(team: string): string | null {
  const direct = teams.find((t) => t.name === team)?.logo;

  if (direct) return direct;
  const slug = backendToSlug[team];

  return slug ? `/teams/${slugToLogoFilename[slug]}` : null;
}

/** Radial ring gauge: the colored arc animates from empty to skill_rating/100. */
function SkillGauge({
  rating,
  color,
  tierLabel,
  avgRating,
}: {
  rating: number;
  color: string;
  tierLabel: string;
  avgRating?: number;
}) {
  const reduce = useReducedMotion();
  const hasAvg = typeof avgRating === "number";
  const skillDelta = hasAvg ? Math.round(rating) - (avgRating as number) : 0;

  // Count the center number up in lock-step with the arc sweep (snap if reduced-motion).
  const target = Math.round(rating);
  const count = useMotionValue(reduce ? target : 0);
  const display = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (reduce) {
      count.set(target);

      return;
    }
    const controls = animate(count, target, { duration: 0.9, ease: EASE_OUT });

    return () => controls.stop();
  }, [count, target, reduce]);

  const size = 124;
  const stroke = 11;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = clamp(rating, 0, 100) / 100;
  const offset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          aria-hidden="true"
          className="-rotate-90"
          height={size}
          width={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            fill="none"
            r={radius}
            stroke="#f3f4f6"
            strokeWidth={stroke}
          />
          <motion.circle
            animate={{ strokeDashoffset: offset }}
            cx={size / 2}
            cy={size / 2}
            fill="none"
            initial={{ strokeDashoffset: reduce ? offset : circumference }}
            r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeLinecap="round"
            strokeWidth={stroke}
            transition={
              reduce ? { duration: 0 } : { duration: 0.9, ease: EASE_OUT }
            }
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline gap-0.5">
            <motion.span className="text-3xl font-bold tabular-nums text-gray-800 leading-none">
              {display}
            </motion.span>
            <span className="text-xs font-medium text-gray-500">/100</span>
          </div>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Model Skill
          </span>
        </div>
      </div>
      <span
        className="mt-2 text-xs font-semibold uppercase tracking-wide"
        style={{ color }}
      >
        {tierLabel}
      </span>
      {hasAvg && (
        <span className="mt-0.5 text-[11px] tabular-nums text-gray-500">
          League avg {avgRating}
          <span
            className={`ml-1 font-semibold ${skillDelta >= 0 ? "text-green-700" : "text-red-600"}`}
          >
            {skillDelta >= 0 ? "+" : ""}
            {skillDelta}
          </span>
        </span>
      )}
    </div>
  );
}

/**
 * A track whose fill grows left→right via scaleX (hardware-accelerated). An optional
 * benchmark tick marks the league average so the value reads against the field.
 */
function MeterBar({
  fillPct,
  color,
  delay = 0,
  benchmarkPct,
}: {
  fillPct: number;
  color: string;
  delay?: number;
  benchmarkPct?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="relative h-1.5 w-full rounded-full bg-gray-100"
    >
      <motion.div
        animate={{ scaleX: 1 }}
        className="h-full origin-left rounded-full"
        initial={{ scaleX: reduce ? 1 : 0 }}
        style={{ width: `${clamp(fillPct, 0, 100)}%`, backgroundColor: color }}
        transition={
          reduce ? { duration: 0 } : { duration: 0.7, ease: EASE_OUT, delay }
        }
      />
      {typeof benchmarkPct === "number" && (
        <span
          aria-hidden="true"
          className="absolute top-1/2 h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-400"
          style={{ left: `${clamp(benchmarkPct, 0, 100)}%` }}
          title="League average"
        />
      )}
    </div>
  );
}

/** League standing from the player's official rank (consistent with the table). */
function LeagueStanding({
  rank,
  size,
  color,
}: {
  rank: number;
  size: number;
  color: string;
}) {
  const isLeader = rank === 1;
  const fill = size > 0 ? ((size - rank + 1) / size) * 100 : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs text-gray-500">League standing</span>
        <span className="text-xs font-semibold" style={{ color }}>
          {isLeader ? `#1 of ${size} · Leader` : `#${rank} of ${size}`}
        </span>
      </div>
      <MeterBar color={color} delay={0.05} fillPct={fill} />
    </div>
  );
}

/** Compact labeled stat bar (label, value, animated fill, optional vs-avg delta + tick). */
function StatBar({
  label,
  value,
  fillPct,
  color,
  delay = 0,
  benchmark,
  playerNum,
}: {
  label: string;
  value: string;
  fillPct: number;
  color: string;
  delay?: number;
  benchmark?: number;
  playerNum?: number;
}) {
  const hasDelta =
    typeof benchmark === "number" && typeof playerNum === "number";
  const delta = hasDelta ? (playerNum as number) - (benchmark as number) : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="flex items-baseline gap-1.5">
          <span className="text-xs font-semibold tabular-nums text-gray-700">
            {value}
          </span>
          {hasDelta && (
            <span
              className={`text-[11px] font-semibold tabular-nums ${
                delta >= 0 ? "text-green-700" : "text-red-600"
              }`}
            >
              {delta >= 0 ? "+" : ""}
              {delta.toFixed(1)} vs avg
            </span>
          )}
        </span>
      </div>
      <div className="mt-1">
        <MeterBar
          benchmarkPct={benchmark}
          color={color}
          delay={delay}
          fillPct={fillPct}
        />
      </div>
    </div>
  );
}

/** Right column: skill gauge, league standing, and stat bars. */
function ModelRatingPanel({
  snapshot,
  player,
}: {
  snapshot: PlayerSnapshot;
  player?: PlayerView;
}) {
  const hasRating = typeof snapshot.skill_rating === "number";
  const color = getTierColor(snapshot.draft_tier);
  const verdict = getVerdict(snapshot.draft_tier);

  const hasStanding =
    player &&
    typeof player.rank === "number" &&
    typeof snapshot.league_size === "number";
  const margin =
    player &&
    typeof player.ptsWon === "number" &&
    typeof player.ptsLost === "number"
      ? player.ptsWon - player.ptsLost
      : null;

  return (
    // Mobile: stacked, so a top divider separates this from the scouting half above.
    // Desktop (md+): side-by-side, so switch to a left divider instead.
    <div className="border-t border-gray-100 pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        Model Rating
      </div>

      {hasRating ? (
        <SkillGauge
          avgRating={snapshot.avg_skill_rating}
          color={color}
          rating={snapshot.skill_rating as number}
          tierLabel={verdict.label}
        />
      ) : (
        <div className="flex h-[124px] items-center justify-center text-sm text-gray-400">
          —
        </div>
      )}

      {hasStanding && (
        <div className="mt-4">
          <LeagueStanding
            color={color}
            rank={player.rank}
            size={snapshot.league_size as number}
          />
        </div>
      )}

      {player && (
        <div className="mt-4 space-y-2.5">
          {typeof player.gamesWonPercent === "number" && (
            <StatBar
              benchmark={snapshot.league_avg_win_pct}
              color="#f97316"
              delay={0.1}
              fillPct={player.gamesWonPercent}
              label="Win rate"
              playerNum={player.gamesWonPercent}
              value={`${player.gamesWonPercent.toFixed(1)}%`}
            />
          )}
          {typeof player.ptsWonPercent === "number" && (
            <StatBar
              benchmark={snapshot.league_avg_pt_win_pct}
              color="#f97316"
              delay={0.15}
              fillPct={player.ptsWonPercent}
              label="Point win %"
              playerNum={player.ptsWonPercent}
              value={`${player.ptsWonPercent.toFixed(1)}%`}
            />
          )}
          {margin !== null && (
            <StatBar
              color={margin >= 0 ? "#f97316" : "#ef4444"}
              delay={0.2}
              fillPct={Math.abs(margin) / 4}
              label="Scoring margin"
              value={`${margin >= 0 ? "+" : ""}${margin}`}
            />
          )}
        </div>
      )}
    </div>
  );
}

/** Left-column footer: team logo + name, then neutral season pills. Fills the gap under the outlook. */
function TeamFooter({ player }: { player: PlayerView }) {
  const logo = teamLogo(player.team);
  const games = player.gamesWon + player.gamesLost;
  const margin = player.ptsWon - player.ptsLost;

  const pill =
    "rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600";

  return (
    <div className="mt-4 border-t border-gray-100 pt-3">
      <div className="flex items-center gap-2">
        {logo && (
          <Image alt="" className="rounded" height={24} src={logo} width={24} />
        )}
        <span className="text-sm font-semibold text-gray-800">
          {player.team}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className={pill}>{games} GP</span>
        <span className={pill}>
          {player.gamesWon}–{player.gamesLost}
        </span>
        <span
          className={`${pill} ${margin >= 0 ? "text-green-700" : "text-red-700"}`}
        >
          {margin >= 0 ? "+" : ""}
          {margin} diff
        </span>
      </div>
    </div>
  );
}

/**
 * Shimmer placeholder shown while the snapshot loads. Mirrors the card's two-column
 * shape so the layout doesn't jump on arrival. Pulse is `motion-safe` only (respects
 * `prefers-reduced-motion`); announced politely via `role="status"`.
 */
export function PlayerSnapshotSkeleton() {
  const block = "rounded bg-gray-100 motion-safe:animate-pulse";

  return (
    <div
      aria-busy="true"
      aria-label="Loading player snapshot"
      className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4"
      role="status"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.15fr_1fr]">
        {/* LEFT: scouting placeholders */}
        <div>
          <div className="flex gap-2">
            <div className={`${block} h-6 w-24 rounded-full`} />
            <div className={`${block} h-6 w-32 rounded-full`} />
          </div>
          <div className={`${block} mt-4 h-3 w-16`} />
          <div className="mt-2 flex flex-wrap gap-1.5">
            <div className={`${block} h-7 w-48 rounded-full`} />
            <div className={`${block} h-7 w-52 rounded-full`} />
            <div className={`${block} h-7 w-44 rounded-full`} />
          </div>
          <div className={`${block} mt-4 h-3 w-20`} />
          <div className="mt-2">
            <div className={`${block} h-7 w-56 rounded-full`} />
          </div>
          <div className="mt-4 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2">
              <div className={`${block} h-6 w-6`} />
              <div className={`${block} h-4 w-28`} />
            </div>
            <div className="mt-2 flex gap-1.5">
              <div className={`${block} h-6 w-14 rounded-full`} />
              <div className={`${block} h-6 w-16 rounded-full`} />
              <div className={`${block} h-6 w-16 rounded-full`} />
            </div>
          </div>
        </div>

        {/* RIGHT: model-rating placeholders */}
        <div className="md:border-l md:border-gray-100 md:pl-5">
          <div className={`${block} mb-3 h-3 w-24`} />
          <div className="flex justify-center">
            <div className={`${block} h-[124px] w-[124px] rounded-full`} />
          </div>
          <div className={`${block} mx-auto mt-3 h-3 w-28`} />
          <div className="mt-5 space-y-3">
            <div className={`${block} h-2 w-full rounded-full`} />
            <div className={`${block} h-2 w-full rounded-full`} />
            <div className={`${block} h-2 w-full rounded-full`} />
            <div className={`${block} h-2 w-full rounded-full`} />
          </div>
        </div>
      </div>
      <span className="sr-only">Loading player snapshot…</span>
    </div>
  );
}

const chipEnter = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
};

/**
 * "Player Snapshot" card. Left column: scouting report (verdict, archetype,
 * strength/watch-out chips, outlook) + a team-branding footer. Right column: a
 * "Model Rating" dashboard (animated skill gauge, league standing, stat bars).
 */
export default function PlayerSnapshotCard({
  snapshot,
  player,
}: {
  snapshot: PlayerSnapshot;
  player?: PlayerView;
}) {
  const reduce = useReducedMotion();
  const verdict = getVerdict(snapshot.draft_tier);
  const { archetype, strengths, weaknesses, outlook } = snapshot.scouting;
  const unavailable = !archetype || archetype === "Unavailable";

  const enter = (i: number) =>
    reduce
      ? {}
      : {
          ...chipEnter,
          transition: { duration: 0.28, ease: EASE_OUT, delay: i * 0.04 },
        };

  return (
    <div
      aria-label={player ? `${player.name} snapshot` : "Player snapshot"}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 not-italic"
      role="group"
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.15fr_1fr]">
        {/* LEFT: scouting report + team footer */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${verdict.className}`}
            >
              {verdict.label}
            </span>
            {!unavailable && (
              <span className="inline-block rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                {archetype}
              </span>
            )}
          </div>

          {unavailable ? (
            <div className="mt-3 text-sm italic text-gray-400">
              Scouting unavailable
            </div>
          ) : (
            <>
              {strengths.length > 0 && (
                <div className="mt-3">
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Strengths
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {strengths.map((s, i) => (
                      <motion.span
                        key={`s-${i}`}
                        className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
                        {...enter(i)}
                      >
                        <span
                          aria-hidden="true"
                          className="mr-1 text-green-500"
                        >
                          ▲
                        </span>
                        {s}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {weaknesses.length > 0 && (
                <div className="mt-3">
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Watch-outs
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {weaknesses.map((w, i) => (
                      <motion.span
                        key={`w-${i}`}
                        className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                        {...enter(strengths.length + i)}
                      >
                        <span
                          aria-hidden="true"
                          className="mr-1 text-amber-500"
                        >
                          ▼
                        </span>
                        {w}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {outlook && (
                <div className="mt-3 text-xs italic leading-relaxed text-gray-500">
                  {outlook}
                </div>
              )}
            </>
          )}

          {player && <TeamFooter player={player} />}
        </div>

        {/* RIGHT: model rating dashboard */}
        <ModelRatingPanel player={player} snapshot={snapshot} />
      </div>
    </div>
  );
}
