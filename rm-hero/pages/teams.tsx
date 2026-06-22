import { Card, CardBody } from "@heroui/card";
import { Link } from "@heroui/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { useBreakpoint } from "@/hooks/useBreakpoint";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { teamColors, defaultTeamColor } from "@/config/teamColors";
import { teams } from "@/config/teamNames";

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
              const color = teamColors[slug] || defaultTeamColor;

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
