import { Link } from "@heroui/link";
import Image from "next/image";
import { Button } from "@heroui/button";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Wand2, LayoutDashboard } from "lucide-react";
import { useBreakpoint } from "@/hooks/useBreakpoint";

import { title, subtitle } from "../components/primitives";

import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const isSmallScreen = useBreakpoint(500);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <DefaultLayout>
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, 15, 0] }}
          className="absolute z-10"
          style={{ top: "12%", left: "4%" }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <Image
            alt="Animated Pickleball"
            className="object-contain max-w-full h-auto"
            height={90}
            width={90}
            src="/rm/pickleball.png"
            sizes="(min-width: 768px) 120px, 90px"
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
            height={90}
            width={90}
            src="/rm/racket.png"
            sizes="(min-width: 768px) 120px, 90px"
          />
        </motion.div>

        <motion.div
          animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
          className="absolute z-10 max-[429px]:hidden"
          style={{ bottom: "12%", left: "2%" }}
          transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
        >
          <Image
            alt="Animated Racket"
            className="object-contain max-w-full h-auto"
            height={80}
            width={80}
            src="/rm/racket.png"
            sizes="(min-width: 768px) 110px, 80px"
          />
        </motion.div>

        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          className="absolute z-10 max-[429px]:hidden"
          style={{ bottom: "12%", right: "2%" }}
          transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
        >
          <Image
            alt="Animated Pickleball"
            className="object-contain max-w-full h-auto"
            height={80}
            width={80}
            src="/rm/pickleball.png"
            sizes="(min-width: 768px) 110px, 80px"
          />
        </motion.div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 py-14 px-6 md:py-20 md:px-10 flex flex-col md:flex-row items-center text-center md:text-left gap-12 md:gap-20">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.6 }}
          className="w-full md:w-1/2 flex justify-center"
        >
          <Image
            alt="Rally Metrics Logo"
            className="object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
            height={320}
            width={320}
            src="/rm/rm.png"
          />
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full md:w-1/2 flex flex-col items-center md:items-start gap-4"
        >
          <h1 className={`${title({ size: "sm" })} tracking-tight leading-tight`}>
            The <span className={title({ color: "yellow", size: "sm" })}>smartest</span> way
            to draft your <span className={title({ color: "yellow", size: "sm" })}>MLP</span>{" "}
            fantasy team starts here.
          </h1>
          <p className={subtitle()}>
            Built for the stats-driven pickleball fan
          </p>
          <Link href="/teams">
            <Button
              variant="solid"
              color="primary"
              size="lg"
              className="transition-transform duration-200 hover:scale-105"
            >
              Get Started
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="pt-12 pb-28 px-6 md:px-10 relative z-10">
        <div className="grid gap-10 md:grid-cols-3">
          {[
            {
              title: "Real-Time Stats",
              description: "Access live stats to make smarter fantasy choices.",
              icon: <BarChart className="text-orange-500 w-9 h-9" />,
              delay: 0,
            },
            {
              title: "AI-Powered",
              description:
                "Gain an edge with AI-powered analysis and fantasy draft recommendations",
              icon: <Wand2 className="text-orange-500 w-9 h-9" />,
              delay: 0.1,
            },
            {
              title: "Visual Dashboards",
              description:
                "Explore team analytics and performance breakdowns easily.",
              icon: <LayoutDashboard className="text-orange-500 w-9 h-9" />,
              delay: 0.2,
            },
          ].map((item) => (
            <motion.div
              key={item.title}
              className="rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 p-6 shadow-md hover:shadow-lg transition-shadow group"
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: item.delay }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold text-orange-500 group-hover:scale-105 transition-transform drop-shadow-sm mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </DefaultLayout>
  );
}