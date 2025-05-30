import Image from "next/image";
import { motion } from "framer-motion";

import DefaultLayout from "@/layouts/default";

export default function AboutPage() {
  return (
    <DefaultLayout>
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold mb-8"
          initial={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          About
        </motion.h1>

        <motion.p
          animate={{ opacity: 1 }}
          className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-10"
          initial={{ opacity: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          I grew up playing pickleball with my friends, hitting the courts in
          our spare time just for fun. During COVID, what started as a casual
          hobby turned into a real passion. I found myself playing more often,
          meeting new people, and eventually discovering a community that felt
          like home.
        </motion.p>

        <div className="w-full flex justify-center gap-10 mb-10 flex-wrap">
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 1.5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <Image
              alt="Rally Metrics Logo"
              height={200}
              src="/rm/rm.png"
              width={200}
            />
          </motion.div>

          <motion.div
            animate={{ y: [0, 12, 0], rotate: [0, -2, 0] }}
            transition={{
              repeat: Infinity,
              duration: 4.5,
              ease: "easeInOut",
              delay: 0.2,
            }}
          >
            <Image
              alt="Pickleball"
              height={200}
              src="/rm/pickleball.png"
              width={200}
            />
          </motion.div>

          <motion.div
            animate={{ y: [0, -14, 0], rotate: [0, 2, 0] }}
            transition={{
              repeat: Infinity,
              duration: 4.3,
              ease: "easeInOut",
              delay: 0.4,
            }}
          >
            <Image
              alt="Pickleball Racket"
              height={200}
              src="/rm/racket.png"
              width={200}
            />
          </motion.div>
        </div>

        <motion.p
          animate={{ opacity: 1 }}
          className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-8"
          initial={{ opacity: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          As I got more into the sport, I became a huge fan of Major League
          Pickleball (MLP). But I quickly ran into a consistent problem &mdash;
          it was hard to find websites that showed player stats in a clean,
          digestible way.
        </motion.p>

        <motion.p
          animate={{ opacity: 1 }}
          className="text-lg leading-relaxed text-gray-700 dark:text-gray-300"
          initial={{ opacity: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          That&apos;s why I created Rally Metrics. Whether you&apos;re a fantasy
          pickleball fanatic or just curious, I&apos;m here to give you the edge.
        </motion.p>

        <motion.p
          animate={{ opacity: 1 }}
          className="text-lg leading-relaxed text-gray-700 dark:text-gray-300"
          initial={{ opacity: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        ><br />
          - Vin
        </motion.p>

      </div>
    </DefaultLayout>
  );
}
