import { Link } from "@heroui/link";
import Image from "next/image";
import { Button } from "@heroui/button";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Wand2, LayoutDashboard } from "lucide-react";

import { title, subtitle } from "../components/primitives";

import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <DefaultLayout>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          className="absolute z-20"
          style={{ top: "20%", left: "10%" }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <Image
            alt="Animated Pickleball Left"
            className="object-contain"
            height={125}
            src="/rm/pickleball.png"
            width={125}
          />
        </motion.div>

        <motion.div
          animate={{ y: [0, -30, 0], x: [0, -10, 0] }}
          className="absolute z-20"
          style={{ top: "20%", right: "5%" }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <Image
            alt="Animated Racket Bottom Left"
            className="object-contain"
            height={240}
            src="/rm/racket.png"
            width={240}
          />
        </motion.div>

        <motion.div
          animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
          className="absolute z-20"
          style={{ bottom: "10%", left: "5%" }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <Image
            alt="Animated Racket Top Right"
            className="object-contain"
            height={220}
            src="/rm/racket.png"
            width={220}
          />
        </motion.div>

        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          className="absolute z-20"
          style={{ bottom: "15%", right: "7.5%" }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <Image
            alt="Animated Pickleball Bottom Right"
            className="object-contain"
            height={100}
            src="/rm/pickleball.png"
            width={125}
          />
        </motion.div>
      </div>

      <section className="relative z-10 py-6 px-6 md:px-10 flex flex-col md:flex-row items-center text-center md:text-left gap-10">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0"
          initial={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.6 }}
        >
          <Image
            alt="Rally Metrics Logo"
            className="object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
            height={300}
            src="/rm/rm.png"
            width={500}
          />
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl flex flex-col items-center md:items-start gap-4"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className={`${title()} tracking-tight`}>
            The <span className={title({ color: "yellow" })}>smartest</span> way
            to draft your{" "}
            <span className={title({ color: "yellow" })}>MLP</span> fantasy team
            starts here.
          </h1>
          <p className={subtitle()}>
            Built for the stats-driven pickleball fan
          </p>
          <Link href="/teams">
            <Button
              className="transition-transform duration-200 hover:scale-105"
              color="primary"
              size="lg"
            >
              Get Started
            </Button>
          </Link>
        </motion.div>
      </section>

      <section className="py-20 px-6 md:px-10 relative z-10">
        <div className="grid gap-10 md:grid-cols-3">
          {[
            {
              title: "Real-Time Stats",
              description: "Access live stats to make smarter fantasy choices.",
              icon: <BarChart className="text-orange-500 w-8 h-8" />,
              delay: 0,
            },
            {
              title: "AI-Powered",
              description:
                "Gain an edge with AI-powered analysis and fantasy draft recommendations",
              icon: <Wand2 className="text-orange-500 w-8 h-8" />,
              delay: 0.1,
            },
            {
              title: "Visual Dashboards",
              description:
                "Explore team analytics and performance breakdowns easily.",
              icon: <LayoutDashboard className="text-orange-500 w-8 h-8" />,
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
