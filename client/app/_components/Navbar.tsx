"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const buttonStyles =
  "text-white font-bold px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 h-[40px] flex items-center justify-center";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100, rotate: -10 }}
      animate={{
        y: 0,
        rotate: 0,
        transition: {
          type: "spring",
          bounce: 0.7,
        },
      }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-purple-500/20"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="container mx-auto px-4 py-4 flex items-center justify-between relative z-10">
        <Link href="/">
          <motion.div
            whileHover={{
              scale: 1.2,
              rotate: [0, -10, 10, -10, 0],
              transition: { duration: 0.5 },
            }}
            whileTap={{ scale: 0.9 }}
            className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 text-transparent bg-clip-text bg-size-200 animate-gradient cursor-pointer"
          >
            <span className="hover:text-pink-400 transition-colors">C</span>
            <span className="hover:text-purple-400 transition-colors">l</span>
            <span className="hover:text-pink-400 transition-colors">a</span>
            <span className="hover:text-purple-400 transition-colors">s</span>
            <span className="hover:text-pink-400 transition-colors">h</span> 
            <span className="hover:text-purple-400 transition-colors">o</span>
            <span className="hover:text-pink-400 transition-colors">f</span> 
            <span className="hover:text-purple-400 transition-colors">C</span>
            <span className="hover:text-pink-400 transition-colors">l</span>
            <span className="hover:text-purple-400 transition-colors">o</span>
            <span className="hover:text-pink-400 transition-colors">u</span>
            <span className="hover:text-purple-400 transition-colors">t</span>
          </motion.div>
        </Link>

        <div className="flex items-center gap-8">
          <motion.a
            whileHover={{
              scale: 1.1,
              y: [-2, 2, -2],
              transition: {
                y: {
                  repeat: Infinity,
                  duration: 0.5,
                },
              },
            }}
            href="/"
            className={buttonStyles}
          >
            Home
          </motion.a>
          <motion.a
            whileHover={{
              scale: 1.1,
              y: [-2, 2, -2],
              transition: {
                y: {
                  repeat: Infinity,
                  duration: 0.5,
                },
              },
            }}
            href="/hexpit"
            className={buttonStyles}
          >
            🔮 HexPit
          </motion.a>
          <motion.a
            whileHover={{
              scale: 1.1,
              y: [-2, 2, -2],
              transition: {
                y: {
                  repeat: Infinity,
                  duration: 0.5,
                },
              },
            }}
            href="/memepool"
            className={buttonStyles}
          >
            🏆 Colosseum
          </motion.a>
          <motion.a
            whileHover={{
              scale: 1.1,
              y: [-2, 2, -2],
              transition: {
                y: {
                  repeat: Infinity,
                  duration: 0.5,
                },
              },
            }}
            href="/profile"
            className={buttonStyles}
          >
            👤 Profile
          </motion.a>
          <motion.div
            whileHover={{
              scale: 1.1,
              y: [-2, 2, -2],
              transition: {
                y: {
                  repeat: Infinity,
                  duration: 0.5,
                },
              },
            }}
            whileTap={{ scale: 0.95 }}
          >
            <w3m-button />
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}
