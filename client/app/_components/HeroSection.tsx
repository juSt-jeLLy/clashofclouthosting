"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-32" // Increased padding
    >
      <motion.h1
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="text-7xl font-bold mb-8" // Increased text size and margin
      >
        <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
          Clash of Clout
        </span>
      </motion.h1>

      <motion.p
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="text-2xl text-gray-300 mb-16 max-w-3xl mx-auto" // Increased text size, margin and max-width
      >
        Battle with the dankest memes on Web3. Create, vote, and earn clout in
        the ultimate meme showdown.
      </motion.p>

      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="flex gap-8 justify-center" // Increased gap
      >
        <Link href="/memepool">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 px-10 py-4 rounded-full text-white font-bold text-xl shadow-lg hover:shadow-purple-500/25" // Increased padding and text size
          >
            Get started
          </motion.button>
        </Link>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-white/10 border border-purple-500/30 px-10 py-4 rounded-full text-white font-bold text-xl hover:bg-white/20" // Increased padding and text size
        >
          Learn More
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
