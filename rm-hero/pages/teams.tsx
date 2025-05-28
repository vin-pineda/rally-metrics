import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";
import { Card, CardBody } from "@heroui/card";
import { Link } from "@heroui/link";
import Image from "next/image";
import { motion } from "framer-motion";

const teams = [
  { name: "Atlanta Bouncers", logo: "/teams/atlanta_bouncers.png", route: "/teams/atlanta-bouncers" },
  { name: "Brooklyn Pickleball Team", logo: "/teams/brooklyn_pickleball_team.png", route: "/teams/brooklyn-pickleball-team" },
  { name: "Carolina Hogs", logo: "/teams/carolina_hogs.png", route: "/teams/carolina-hogs" },
  { name: "Chicago Slice", logo: "/teams/chicago_slice.png", route: "/teams/chicago-slice" },
  { name: "Columbus Sliders", logo: "/teams/columbus_sliders.png", route: "/teams/columbus-sliders" },
  { name: "Dallas Flash", logo: "/teams/dallas_flash.png", route: "/teams/dallas-flash" },
  { name: "LA Mad Drops", logo: "/teams/la_mad_drops.png", route: "/teams/la-mad-drops" },
  { name: "Miami Pickleball Team", logo: "/teams/miami_pickleball_team.png", route: "/teams/miami-pickleball-team" },
  { name: "NJ Fives", logo: "/teams/nj_fives.png", route: "/teams/nj-fives" },
  { name: "Orlando Squeeze", logo: "/teams/orlando_squeeze.png", route: "/teams/orlando-squeeze" },
  { name: "Phoenix Flames", logo: "/teams/phoenix_flames.png", route: "/teams/phoenix-flames" },
  { name: "SoCal Hard Eights", logo: "/teams/socal_hard_eights.png", route: "/teams/socal-hard-eights" },
  { name: "St. Louis Shock", logo: "/teams/stl_shock.png", route: "/teams/stl-shock" },
  { name: "Texas Ranchers", logo: "/teams/texas_ranchers.png", route: "/teams/texas-ranchers" },
  { name: "Utah Black Diamonds", logo: "/teams/utah_black_diamonds.png", route: "/teams/utah-black-diamonds" },
  { name: "New York Hustlers", logo: "/teams/new_york_hustlers.png", route: "/teams/new-york-hustlers" }
  
];

export default function TeamsPage() {
  return (
    
    <DefaultLayout>
      <section className="px-6 py-16 text-center">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <motion.div
                  className="absolute z-20"
                  animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  style={{ top: "20%", left: "10%" }}
                >
                  <Image
                    src="/rm/rm.png"
                    alt="Animated Pickleball Left"
                    width={150}
                    height={150}
                    className="object-contain"
                  />
                </motion.div>
        
        
                <motion.div
                  className="absolute z-20"
                  animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  style={{ bottom: "5%", right: "7.5%" }}
                >
                  <Image
                    src="/rm/rm.png"
                    alt="Animated Pickleball Bottom Right"
                    width={150}
                    height={150}
                    className="object-contain"
                  />
                </motion.div>
              </div>
        
        <h1
        className={`${title()} text-center mb-28 relative inline-block group cursor-pointer select-none`}
        >
          <span className="relative z-10">Teams</span>
          <span className="absolute left-0 bottom-0 w-full h-1 bg-orange-500 scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-300 rounded-full z-0 pointer-events-none" />
          </h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-10 place-items-center mt-10">
          {teams.map((team, index) => (
            <motion.div
              key={team.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.03 }}
            >
              <Card
                as={Link}
                href={team.route}
                isHoverable
                className="w-56 h-56 rounded-2xl bg-white dark:bg-black 
                border-[6px] border-black dark:border-gray-700 
                hover:bg-orange-500 dark:hover:bg-orange-500 
                hover:border-orange-500 dark:hover:border-orange-500 
                transition-all duration-200 ease-in-out 
                hover:shadow-md dark:hover:shadow-md 
                focus-visible:ring-2 focus-visible:ring-orange-400 dark:focus-visible:ring-orange-500 
                transform hover:scale-[1.08]"
              >
                <CardBody className="relative w-full h-full flex items-center justify-center p-5">
                  <Image
                    src={team.logo}
                    alt={`${team.name} Logo`}
                    fill
                    className="object-contain rounded-xl"
                  />
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </DefaultLayout>
  );
}
