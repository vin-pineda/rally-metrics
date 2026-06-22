/**
 * Canonical player shape returned by the backend API.
 * The backend serializes fields as snake_case
 * (spring.jackson.property-naming-strategy=SNAKE_CASE).
 */
export type Player = {
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

/**
 * camelCase view of a Player, used by pages that prefer camelCase access
 * (players table, team detail page).
 */
export type PlayerView = {
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

/** Map a raw snake_case API row to a Player. */
export function toPlayer(p: Player): Player {
  return {
    name: p.name,
    rank: p.rank,
    team: p.team,
    games_won: p.games_won,
    games_lost: p.games_lost,
    games_won_percent: p.games_won_percent,
    pts_won: p.pts_won,
    pts_lost: p.pts_lost,
    pts_won_percent: p.pts_won_percent,
  };
}

/** Map a raw snake_case API row to a camelCase PlayerView. */
export function toPlayerView(p: Player): PlayerView {
  return {
    name: p.name,
    rank: p.rank,
    team: p.team,
    gamesWon: p.games_won,
    gamesLost: p.games_lost,
    gamesWonPercent: p.games_won_percent,
    ptsWon: p.pts_won,
    ptsLost: p.pts_lost,
    ptsWonPercent: p.pts_won_percent,
  };
}
