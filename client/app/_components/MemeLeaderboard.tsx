"use client";

import { motion } from "framer-motion";

const topMemes = [
  { id: 1, title: "Gigachad Moment", score: 9800, creator: "0x1234...5678" },
  { id: 2, title: "Wojak's Revenge", score: 8500, creator: "0x8765...4321" },
  { id: 3, title: "Pepe's Paradise", score: 7200, creator: "0x9876...1234" },
  { id: 4, title: "Doge to the Moon", score: 6900, creator: "0x4321...8765" },
];

export default function MemeLeaderboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.3)]"
    >
      <motion.h2 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ 
          repeat: Infinity, 
          repeatType: "reverse", 
          duration: 2 
        }}
        className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6"
      >
        Trending Memes 👑
      </motion.h2>
      <div className="space-y-4">
        {topMemes.map((meme, index) => (
          <motion.div
            key={meme.id}
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.15)" }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-purple-500/10 hover:border-pink-500/30 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <motion.span 
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
              >
                #{index + 1}
              </motion.span>
              <div>
                <h3 className="text-white font-semibold">{meme.title}</h3>
                <p className="text-gray-400 text-sm hover:text-purple-400 transition-colors">{meme.creator}</p>
              </div>
            </div>
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="text-pink-400 font-bold px-4 py-1 rounded-full bg-pink-500/10"
            >
              {meme.score.toLocaleString()}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
