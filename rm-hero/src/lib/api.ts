// src/lib/api.ts
export async function getPlayersByTeam(team: string) {
  const res = await fetch(`http://localhost:8080/api/v1/player?team=${team}`);

  if (!res.ok) {
    throw new Error("Failed to fetch players");
  }

  return res.json(); // returns array of players
}
