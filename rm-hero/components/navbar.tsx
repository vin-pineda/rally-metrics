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
    router.push(`/players?search=${encodeURIComponent(searchText.trim())}`);
  };

  const searchInput = (
    <form className="w-full" onSubmit={handleSearch}>
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
        onChange={(e) => {
          const value = e.target.value;
          setSearchText(value);

          if (value === "") {
            router.push("/players");
          }
        }}
      />
    </form>
  );

  return (
    <>
      <HeroUINavbar maxWidth="xl" position="sticky">
        <NavbarContent justify="start">
          <NavbarBrand className="gap-3 max-w-fit">
            <NextLink className="flex items-center gap-1" href="/">
              <img
                alt="Rally Metrics Logo"
                className="object-contain"
                height={36}
                src="/rm/rm.png"
                width={36}
              />
              <p className="font-bold text-inherit">Rally Metrics</p>
            </NextLink>
          </NavbarBrand>

          <div className="hidden lg:flex gap-4 ml-2">
            {siteConfig.navItems.map((item) => (
              <NavbarItem key={item.href}>
                <NextLink
                  className={clsx(
                    linkStyles({ color: "foreground" }),
                    "data-[active=true]:text-primary data-[active=true]:font-medium"
                  )}
                  href={item.href}
                >
                  {item.label}
                </NextLink>
              </NavbarItem>
            ))}
          </div>
        </NavbarContent>

        <NavbarContent
          className="hidden lg:flex gap-4 items-center"
          justify="end"
        >
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
          <NavbarItem className="w-60">{searchInput}</NavbarItem>
          <NavbarItem>
            <Button
              isExternal
              as={Link}
              className="text-sm font-normal text-default-600 bg-default-100"
              href={siteConfig.links.sponsor}
              variant="flat"
            >
              <img
                alt="MLP Logo"
                className="object-contain"
                height={36}
                src="/mlp/mlp.png"
                width={36}
              />
              Major League Pickleball
            </Button>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent
          className="flex lg:hidden gap-2 items-center"
          justify="end"
        >
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
          <NavbarMenuToggle />
        </NavbarContent>

        <NavbarMenu>
          {searchInput}
          <br />
          {siteConfig.navItems.map((item) => (
            <NavbarMenuItem key={item.href}>
              <NextLink
                className="w-full text-base text-default-600"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </HeroUINavbar>
    </>
  );
};
