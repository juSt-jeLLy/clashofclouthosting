"use client";

import { motion } from "framer-motion";
import MemeCard from "../_components/MemeCard";
import Navbar from "../_components/Navbar";

const memes = [
  {
    id: "1",
    imageUrl: "/memes/1.jpg",
    title: "Epic Gamer Moment",
    creator: "0x1234...5678",
    votes: 420,
    tags: ["gaming", "epic"],
  },
  {
    id: "2",
    imageUrl: "/memes/2.jpg", 
    title: "Web3 Problems",
    creator: "0xabcd...efgh",
    votes: 69,
    tags: ["crypto", "web3"],
  },
];

const AnimatedBackground = () => (
  <motion.div
    className="absolute inset-0 bg-gradient-to-r from-purple-900 via-pink-800 to-purple-900"
    animate={{
      background: [
        "linear-gradient(45deg, #4a148c, #e91e63)",
        "linear-gradient(45deg, #311b92, #ff1744)",
        "linear-gradient(45deg, #4a148c, #e91e63)",
      ],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

export default function MemePool() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-6xl font-extrabold text-center mb-12 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 text-transparent bg-clip-text drop-shadow-lg hover:scale-105 transition-transform"
          >
            🔥 Meme Pool 🔥
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {memes.map((meme, index) => (
              <motion.div
                key={meme.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  transition: { delay: index * 0.1 },
                }}
              >
                <MemeCard {...meme} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
