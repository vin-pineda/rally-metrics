export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Rally Metrics",
  description:
    "Organized MLP data to help you draft the best fantasy pickleball team, backed by real stats.",
  navItems: [
    {
      label: "Teams",
      href: "/teams",
    },

    {
      label: "About",
      href: "/about",
    },
  ],
  
  links: {
    github: "https://github.com/vin-pineda",
    sponsor: "https://www.majorleaguepickleball.co/",
  },
};
