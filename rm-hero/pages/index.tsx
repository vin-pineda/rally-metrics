import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";
import Image from "next/image";
import DefaultLayout from "@/layouts/default";
import { Button, ButtonGroup } from "@heroui/button";
import { title, subtitle } from "@/components/primitives";

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
  { name: "Utah Black Diamonds", logo: "/teams/utah_black_diamonds.png", route: "/teams/utah-black-diamonds" }
];

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="py-6 px-6 md:px-10 flex flex-col md:flex-row items-center text-center md:text-left gap-10">
        <div className="flex-shrink-0">
          <Image
          src="/rm/rm.png"
          alt="Rally Metrics Logo"
          width={500}
          height={300}
          className="object-contain"/>
          </div>
          
          <div className="max-w-xl flex flex-col items-center md:items-start gap-4">
            <h1 className={title()}>
              The <span className={title({ color: "yellow" })}> smartest </span> way to draft your 
              <span className={title({ color: "yellow" })}> MLP </span> fantasy team starts here.
              </h1>

      <p className={`${subtitle()}`}>
        Built for the stats-driven pickleball fan
        </p>

        <Button className="transition-transform duration-200 hover:scale-105" color="primary" size="lg">
          Get Started
        </Button>

        </div>

      </section>
    </DefaultLayout>
  );
}
