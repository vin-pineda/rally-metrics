export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Rally Metrics",
  description: "Organized MLP data to help you draft the best fantasy pickleball team, backed by real stats.",
  navItems: [
    {
      label: "Teams",
      href: "/teams"
    },
    
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/vin-pineda",
    twitter: "https://twitter.com/hero_ui",
    sponsor: "https://www.majorleaguepickleball.co/",
  },
};
