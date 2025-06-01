import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon, SearchIcon, HeartFilledIcon } from "@/components/icons";

export const Navbar = () => {
  const [searchText, setSearchText] = useState("");
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchText.trim()) return;
    router.push(`/search?name=${encodeURIComponent(searchText.trim())}`);
  };

  const searchInput = (
    <form onSubmit={handleSearch} className="w-full">
      <Input
        aria-label="Search"
        classNames={{
          inputWrapper: "bg-default-100",
          input: "text-sm",
        }}
        placeholder="Find Players"
        startContent={
          <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
        }
        type="search"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
    </form>
  );

  return (
    <>
      <HeroUINavbar maxWidth="xl" position="sticky">

        {/* LEFT SIDE BRAND */}
        <NavbarContent justify="start">
          <NavbarBrand className="gap-3 max-w-fit">
            <NextLink className="flex items-center gap-1" href="/">
              <img
                src="/rm/rm.png"
                alt="Rally Metrics Logo"
                width={36}
                height={36}
                className="object-contain"
              />
              <p className="font-bold text-inherit">Rally Metrics</p>
            </NextLink>
          </NavbarBrand>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden lg:flex gap-4 ml-2">
            {siteConfig.navItems.map((item) => (
              <NavbarItem key={item.href}>
                <NextLink
                  href={item.href}
                  className={clsx(
                    linkStyles({ color: "foreground" }),
                    "data-[active=true]:text-primary data-[active=true]:font-medium"
                  )}
                >
                  {item.label}
                </NextLink>
              </NavbarItem>
            ))}
          </div>
        </NavbarContent>

        {/* RIGHT SIDE — DESKTOP */}
        <NavbarContent justify="end" className="hidden lg:flex gap-4 items-center">
          <NavbarItem>
            <Link
              isExternal
              href="https://www.linkedin.com/in/vincent-pineda8/"
              title="LinkedIn"
            >
              <HeartFilledIcon className="text-default-500 hover:text-primary transition" />
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link isExternal href={siteConfig.links.github} title="GitHub">
              <GithubIcon className="text-default-500 hover:text-primary transition" />
            </Link>
          </NavbarItem>
          <NavbarItem>
            <ThemeSwitch />
          </NavbarItem>
          <NavbarItem className="w-60">{searchInput}</NavbarItem>
          <NavbarItem>
            <Button
              as={Link}
              isExternal
              className="text-sm font-normal text-default-600 bg-default-100"
              href={siteConfig.links.sponsor}
              variant="flat"
            >
              <img
                src="/mlp/mlp.png"
                alt="MLP Logo"
                width={36}
                height={36}
                className="object-contain"
              />
              Major League Pickleball
            </Button>
          </NavbarItem>
        </NavbarContent>

        {/* RIGHT SIDE — MOBILE + TABLET */}
        <NavbarContent justify="end" className="flex lg:hidden gap-2 items-center">
          <Link
            isExternal
            href="https://www.linkedin.com/in/vincent-pineda8/"
            title="LinkedIn"
          >
            <HeartFilledIcon className="text-default-500 hover:text-primary transition" />
          </Link>
          <Link isExternal href={siteConfig.links.github} title="GitHub">
            <GithubIcon className="text-default-500 hover:text-primary transition" />
          </Link>
          <ThemeSwitch />
          <NavbarMenuToggle />
        </NavbarContent>

        {/* DROPDOWN MENU — MOBILE/TABLET */}
        <NavbarMenu>
          {searchInput}
          <br />
          {siteConfig.navItems.map((item) => (
            <NavbarMenuItem key={item.href}>
              <NextLink href={item.href} className="w-full text-base text-default-600">
                {item.label}
              </NextLink>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </HeroUINavbar>
    </>
  );
};
