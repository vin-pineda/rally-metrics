import { Card, CardBody } from "@heroui/card";
import { Link } from "@heroui/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { useBreakpoint } from "@/hooks/useBreakpoint";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

const teamColors: Record<
  string,
  { text: string; border: string; thead: string; glow: string; bg: string }
> = {
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

const teams = [
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

export default function TeamsPage() {
  const disableTooltips = useBreakpoint(768);
  const isMobile = useBreakpoint(480);
  const isTablet = useBreakpoint(1024);

  return (
    <DefaultLayout>
      <section className="pb-16 sm:pt-16 text-center relative overflow-hidden min-h-screen">
        <h1
          className={`${title()} text-center mb-16 sm:mb-20 relative inline-block group cursor-pointer select-none`}
        >
          <span className="relative z-10">Teams</span>
          <br />
          <br />
        </h1>
        <div className="relative z-10 w-full flex justify-center">
          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-5
              gap-6
              sm:gap-8
              md:gap-10
              px-4
              sm:px-6
              md:px-10
              max-w-[100%]
              mx-auto
            "
          >
            {teams.map((team, index) => {
              const slug = team.route.split("/").pop() || "";
              const color = teamColors[slug] || teamColors["atlanta-bouncers"];

              return (
                <motion.div
                  key={team.name}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex justify-center"
                  initial={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                >
                  <Card
                    isHoverable
                    as={Link}
                    className={`
                      group
                      w-[11.5rem] h-[11.5rem]
                      sm:w-[13rem] sm:h-[13rem]
                      md:w-[14rem] md:h-[14rem]
                      lg:w-[15.5rem] lg:h-[15.5rem]
                      rounded-2xl bg-white
                      border-4 ${color.border}
                      transition-all duration-200 ease-in-out
                      hover:shadow-lg
                      focus-visible:ring-2 focus-visible:ring-offset-2
                      transform hover:scale-[1.05]`}
                    href={team.route}
                    {...(!disableTooltips && { title: team.name })}
                  >
                    <CardBody className="w-full h-full p-0 flex items-center justify-center">
                      <div className="relative w-full h-full">
                        <Image
                          fill
                          alt={`${team.name} Logo`}
                          className="object-contain p-4 sm:p-5 md:p-6"
                          src={team.logo}
                        />
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
