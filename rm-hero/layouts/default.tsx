import { useEffect } from "react";
import { Link } from "@heroui/link";

import { Navbar } from "@/components/navbar";
import { Head } from "./head";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Head />
      <Navbar />
      <main className="flex-grow overflow-auto">
        <div className="container mx-auto max-w-7xl px-6 pt-16 pb-40">
          {children}
        </div>
      </main>
      <footer className="w-full flex items-center justify-center py-6 px-4 bg-white z-50">
        <Link
          isExternal
          className="flex items-center gap-1 text-current text-sm sm:text-base"
          href="https://www.linkedin.com/in/vincent-pineda8/"
          title="linkedin.com/in/vincent-pineda8 homepage"
        >
          <span className="text-default-600">Powered by</span>
          <p className="text-primary">Vin Pineda</p>
        </Link>
      </footer>
    </div>
  );
}
