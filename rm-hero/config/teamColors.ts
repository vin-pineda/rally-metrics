export type TeamColor = {
  text: string;
  border: string;
  thead: string;
  glow: string;
  bg: string;
};

export const teamColors: Record<string, TeamColor> = {
  "atlanta-bouncers": {
    text: "text-orange-500",
    border: "border-orange-500",
    thead: "bg-orange-500/20 text-orange-900",
    glow: "bg-orange-500",
    bg: "bg-orange-100",
  },
  "brooklyn-pickleball-team": {
    text: "text-gray-700",
    border: "border-gray-700",
    thead: "bg-gray-700/20 text-gray-700",
    glow: "bg-gray-700",
    bg: "bg-gray-100",
  },
  "carolina-hogs": {
    text: "text-red-500",
    border: "border-red-500",
    thead: "bg-red-500/20 text-red-900",
    glow: "bg-red-500",
    bg: "bg-red-100",
  },
  "chicago-slice": {
    text: "text-red-600",
    border: "border-red-600",
    thead: "bg-red-600/20 text-red-600",
    glow: "bg-red-600",
    bg: "bg-red-100",
  },
  "columbus-sliders": {
    text: "text-blue-600",
    border: "border-blue-600",
    thead: "bg-blue-600/20 text-blue-600",
    glow: "bg-blue-600",
    bg: "bg-blue-100",
  },
  "dallas-flash": {
    text: "text-sky-500",
    border: "border-sky-500",
    thead: "bg-sky-500/20 text-sky-900",
    glow: "bg-sky-500",
    bg: "bg-sky-100",
  },
  "la-mad-drops": {
    text: "text-teal-500",
    border: "border-teal-500",
    thead: "bg-teal-500/20 text-teal-900",
    glow: "bg-teal-500",
    bg: "bg-teal-100",
  },
  "miami-pickleball-team": {
    text: "text-pink-500",
    border: "border-pink-500",
    thead: "bg-pink-500/20 text-pink-900",
    glow: "bg-pink-500",
    bg: "bg-pink-100",
  },
  "nj-fives": {
    text: "text-indigo-600",
    border: "border-indigo-600",
    thead: "bg-indigo-600/20 text-indigo-600",
    glow: "bg-indigo-600",
    bg: "bg-indigo-100",
  },
  "orlando-squeeze": {
    text: "text-yellow-500",
    border: "border-yellow-500",
    thead: "bg-yellow-500/20 text-yellow-900",
    glow: "bg-yellow-500",
    bg: "bg-yellow-100",
  },
  "phoenix-flames": {
    text: "text-red-500",
    border: "border-red-500",
    thead: "bg-red-500/20 text-red-900",
    glow: "bg-red-500",
    bg: "bg-red-100",
  },
  "socal-hard-eights": {
    text: "text-sky-500",
    border: "border-sky-500",
    thead: "bg-sky-500/20 text-sky-900",
    glow: "bg-sky-500",
    bg: "bg-sky-100",
  },
  "stl-shock": {
    text: "text-blue-600",
    border: "border-blue-600",
    thead: "bg-blue-600/20 text-blue-600",
    glow: "bg-blue-600",
    bg: "bg-blue-100",
  },
  "texas-ranchers": {
    text: "text-blue-600",
    border: "border-blue-600",
    thead: "bg-blue-600/20 text-blue-600",
    glow: "bg-blue-600",
    bg: "bg-blue-100",
  },
  "utah-black-diamonds": {
    text: "text-gray-700",
    border: "border-gray-700",
    thead: "bg-gray-700/20 text-gray-700",
    glow: "bg-gray-700",
    bg: "bg-gray-100",
  },
  "new-york-hustlers": {
    text: "text-cyan-500",
    border: "border-cyan-500",
    thead: "bg-cyan-500/20 text-cyan-900",
    glow: "bg-cyan-500",
    bg: "bg-cyan-100",
  },
};

export const defaultTeamColor: TeamColor = teamColors["atlanta-bouncers"];
