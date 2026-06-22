export const slugToBackendName: Record<string, string> = {
  "atlanta-bouncers": "Atlanta Bouncers",
  "brooklyn-pickleball-team": "Brooklyn Pickleball Team",
  "carolina-hogs": "Carolina Hogs",
  "chicago-slice": "Chicago Slice",
  "columbus-sliders": "Columbus Sliders",
  "dallas-flash": "Dallas Flash",
  "la-mad-drops": "Los Angeles Mad Drops",
  "miami-pickleball-team": "Miami Pickleball Club",
  "nj-fives": "New Jersey 5s",
  "orlando-squeeze": "Orlando Squeeze",
  "phoenix-flames": "Phoenix Flames",
  "socal-hard-eights": "SoCal Hard Eights",
  "stl-shock": "St. Louis Shock",
  "texas-ranchers": "Texas Ranchers",
  "utah-black-diamonds": "Utah Black Diamonds",
  "new-york-hustlers": "New York Hustlers",
};

export const backendToSlug: Record<string, string> = Object.fromEntries(
  Object.entries(slugToBackendName).map(([slug, name]) => [name, slug]),
);

export const slugToLogoFilename: Record<string, string> = Object.fromEntries(
  Object.entries(slugToBackendName).map(([slug]) => [
    slug,
    slug.replace(/-/g, "_") + ".png",
  ]),
);

export const teamSlugsOrdered = Object.keys(slugToBackendName);

export type TeamCardInfo = {
  name: string;
  logo: string;
  route: string;
};

// Display name + logo used by the index and teams grids.
// (Display name differs from the backend name in a few cases, e.g. "St. Louis Shock".)
export const teams: TeamCardInfo[] = [
  {
    name: "Atlanta Bouncers",
    logo: "/teams/atlanta_bouncers.png",
    route: "/teams/atlanta-bouncers",
  },
  {
    name: "Brooklyn Pickleball Team",
    logo: "/teams/brooklyn_pickleball_team.png",
    route: "/teams/brooklyn-pickleball-team",
  },
  {
    name: "Carolina Hogs",
    logo: "/teams/carolina_hogs.png",
    route: "/teams/carolina-hogs",
  },
  {
    name: "Chicago Slice",
    logo: "/teams/chicago_slice.png",
    route: "/teams/chicago-slice",
  },
  {
    name: "Columbus Sliders",
    logo: "/teams/columbus_sliders.png",
    route: "/teams/columbus-sliders",
  },
  {
    name: "Dallas Flash",
    logo: "/teams/dallas_flash.png",
    route: "/teams/dallas-flash",
  },
  {
    name: "LA Mad Drops",
    logo: "/teams/la_mad_drops.png",
    route: "/teams/la-mad-drops",
  },
  {
    name: "Miami Pickleball Team",
    logo: "/teams/miami_pickleball_team.png",
    route: "/teams/miami-pickleball-team",
  },
  { name: "NJ Fives", logo: "/teams/nj_fives.png", route: "/teams/nj-fives" },
  {
    name: "Orlando Squeeze",
    logo: "/teams/orlando_squeeze.png",
    route: "/teams/orlando-squeeze",
  },
  {
    name: "Phoenix Flames",
    logo: "/teams/phoenix_flames.png",
    route: "/teams/phoenix-flames",
  },
  {
    name: "SoCal Hard Eights",
    logo: "/teams/socal_hard_eights.png",
    route: "/teams/socal-hard-eights",
  },
  {
    name: "St. Louis Shock",
    logo: "/teams/stl_shock.png",
    route: "/teams/stl-shock",
  },
  {
    name: "Texas Ranchers",
    logo: "/teams/texas_ranchers.png",
    route: "/teams/texas-ranchers",
  },
  {
    name: "Utah Black Diamonds",
    logo: "/teams/utah_black_diamonds.png",
    route: "/teams/utah-black-diamonds",
  },
  {
    name: "New York Hustlers",
    logo: "/teams/new_york_hustlers.png",
    route: "/teams/new-york-hustlers",
  },
];
