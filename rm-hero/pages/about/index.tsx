import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect } from "react";

import { useBreakpoint } from "@/hooks/useBreakpoint";
import DefaultLayout from "@/layouts/default";

export default function AboutPage() {
  const isMobile = useBreakpoint(480);

  useEffect(() => {
    document.body.classList.add("about-bg");

    return () => document.body.classList.remove("about-bg");
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <DefaultLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-16 pb-20 sm:pb-32">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16 overflow-visible"
          initial={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            className="text-4xl sm:text-5xl md:text-5xl font-bold mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600"
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            About
          </motion.h1>
          
        </motion.div>

        <motion.div
          animate="visible"
          className="flex flex-col items-center"
          initial="hidden"
          variants={containerVariants}
        >
          <motion.div
            className="relative w-48 h-48 sm:w-56 sm:h-56 mb-10 sm:mb-14"
            variants={itemVariants}
          >
            <motion.div
              animate={{
                scale: [1, 1.03, 1],
                rotate: [0, 0.5, -0.5, 0],
              }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-100/50 to-orange-100/50"
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              animate={{
                y: [0, -4, 0, 3, 0],
                rotate: [0, 0.8, -0.6, 0],
              }}
              className="relative"
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Image
                alt="Rally Metrics Logo"
                className="drop-shadow-lg"
                height={isMobile ? 180 : 220}
                src="/rm/rm.png"
                width={isMobile ? 180 : 220}
              />
            </motion.div>
          </motion.div>

          <motion.div
            className="prose prose-lg sm:prose-xl max-w-none text-left"
            variants={itemVariants}
          >
            <p className="text-gray-700 mb-6">
              <span className="text-orange-600 font-medium">
                I started playing pickleball
              </span>{" "}
              after school with friends just for fun, but during COVID, it
              quickly turned into a real passion. I found myself playing more
              often, meeting new people, and eventually becoming part of a
              community that felt like home.
            </p>

            <p className="text-gray-700 mb-6">
              <span className="text-orange-600 :text-orange-500 font-medium">
                As I got deeper into the sport
              </span>
              , I became a huge fan of Major League Pickleball (MLP) and fantasy
              pickleball. But when it came to drafting teams, I kept running
              into the same problem—there just wasn’t a simple, well-designed
              site that showed player stats in a clean, digestible way. And none
              of them offered match predictors or summaries to help you figure
              out how well a player might fit on your fantasy team.
            </p>

            <p className="text-gray-700 mb-8">
              <span className="text-orange-600 font-medium">
                That’s why I created Rally Metrics
              </span>
              . Whether you’re a fantasy pickleball fanatic or just curious, I’m
              here to give you the edge with data-driven insights and intuitive
              tools.
            </p>
            <motion.div
              animate={{ opacity: 1 }}
              className="border-t border-gray-200 pt-6 mt-10 flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0 }}
              style={{
                alignItems: isMobile ? "flex-start" : "center",
                justifyContent: isMobile ? "flex-start" : "left",
              }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <div className="text-left">
                <p className="font-semibold text-lg text-gray-900">
                  Vin
                </p>
                <p className="text-orange-600">
                  Founder, Rally Metrics
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </DefaultLayout>
  );
}
