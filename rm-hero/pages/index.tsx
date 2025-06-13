import { Card, CardBody } from "@heroui/card";
import { Link } from "@heroui/link";
import Image from "next/image";
import { Button } from "@heroui/button";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Wand2, Users } from "lucide-react";

import { useBreakpoint } from "@/hooks/useBreakpoint";
import { title, subtitle } from "@/components/primitives";
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

export default function IndexPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [randomTeams, setRandomTeams] = useState<{
    left: any;
    right: any;
  } | null>(null);
  const isSmallScreen = useBreakpoint(500);
  const isMobile = useBreakpoint(768);

  useEffect(() => {
    setMounted(true);

    const shuffled = [...teams].sort(() => 0.5 - Math.random());

    setRandomTeams({
      left: shuffled[0],
      right: shuffled[1],
    });
  }, []);

  if (!mounted || !randomTeams) return null;

  const getTeamColor = (slug: string) => {
    return teamColors[slug] || teamColors["atlanta-bouncers"];
  };

  const cardConfig = [
    {
      title: "Accurate Stats",
      description: "Trust the most precise and up-to-date player statistics",
      icon: <CheckCircle className="w-9 h-9" />,
      delay: 0,
      team: randomTeams.left,
      color: getTeamColor(randomTeams.left.route.split("/").pop() || ""),
      href: randomTeams.left.route,
    },
    {
      title: "AI-Powered",
      description: "Gain an edge with AI-powered fantasy recommendations",
      icon: <Wand2 className="w-9 h-9" />,
      delay: 0.1,
      href: "/predictor",
      isAI: true,
    },
    {
      title: "Team Insights",
      description: "Dive deep into team analytics and player dynamics",
      icon: <Users className="w-9 h-9" />,
      delay: 0.2,
      team: randomTeams.right,
      color: getTeamColor(randomTeams.right.route.split("/").pop() || ""),
      href: randomTeams.right.route,
    },
  ];

  return (
    <DefaultLayout>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ y: [0, 10, 0], x: [0, 5, 0] }}
          className="absolute z-10"
          style={{ top: "12%", left: "4%" }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <Image
            alt="Animated Pickleball"
            className="object-contain max-w-full h-auto"
            height={isMobile ? 80 : 100}
            src="/rm/pickleball.png"
            width={isMobile ? 80 : 100}
          />
        </motion.div>

        <motion.div
          animate={{ y: [0, -20, 0], x: [0, -10, 0] }}
          className="absolute z-10"
          style={{ top: "14%", right: "4%" }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
        >
          <Image
            alt="Animated Racket"
            className="object-contain max-w-full h-auto"
            height={isMobile ? 80 : 100}
            src="/rm/racket.png"
            width={isMobile ? 80 : 100}
          />
        </motion.div>
      </div>

      <section className="relative z-10 py-14 px-6 md:py-20 md:px-10 flex flex-col md:flex-row items-center text-center md:text-left gap-12 md:gap-20">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="w-full md:w-1/2 flex justify-center"
          initial={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.6 }}
        >
          <Image
            alt="Rally Metrics Logo"
            className="object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
            height={isMobile ? 280 : 320}
            src="/rm/rm.png"
            width={isMobile ? 280 : 320}
          />
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="w-full md:w-1/2 flex flex-col items-center md:items-start gap-4"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1
            className={`${title({ size: "sm" })} tracking-tight leading-tight`}
          >
            The{" "}
            <span className={title({ color: "yellow", size: "sm" })}>
              smartest
            </span>{" "}
            way to draft your{" "}
            <span className={title({ color: "yellow", size: "sm" })}>MLP</span>{" "}
            fantasy team starts here.
          </h1>
          <p className={subtitle()}>
            Built for the stats-driven pickleball fan
          </p>
          <Link href="/teams">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-105 shadow-md"
              color="primary"
              size="lg"
              variant="solid"
            >
              Get Started
            </Button>
          </Link>
        </motion.div>
      </section>

      <section className="pt-12 pb-28 px-6 md:px-10 relative z-10">
        <div className="grid gap-10 grid-cols-1 md:grid-cols-3">
          {cardConfig.map((item, index) => (
            <motion.div
              key={item.title}
              className="flex justify-center"
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: item.delay }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <Card
                isHoverable
                as={Link}
                className={`
                  group
                  w-full h-full
                  min-h-[15rem]
                  rounded-2xl bg-white
                  border-4 ${item.isAI ? "border-orange-500" : item.color?.border}
                  transition-all duration-200 ease-in-out
                  hover:shadow-lg
                  focus-visible:ring-2 focus-visible:ring-offset-2
                  transform hover:scale-[1.03]
                  ${isMobile ? "max-w-[18rem]" : ""}
                `}
                href={item.href}
              >
                <CardBody className="w-full h-full p-6 flex flex-col items-center justify-center">
                  <div
                    className={`mb-4 ${item.isAI ? "text-orange-500" : item.color?.text}`}
                  >
                    {item.icon}
                  </div>
                  <h3
                    className={`text-lg font-semibold text-center mb-2 group-hover:scale-105 transition-transform drop-shadow-sm ${item.isAI ? "text-orange-500" : item.color?.text}`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    {item.description}
                  </p>
                  {!item.isAI && item.team && (
                    <div className="mt-4 flex items-center justify-center">
                      <div className="relative w-10 h-10 mr-2">
                        <Image
                          fill
                          alt={`${item.team.name} Logo`}
                          className="object-contain"
                          src={item.team.logo}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        {item.team.name}
                      </span>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </DefaultLayout>
  );
}
