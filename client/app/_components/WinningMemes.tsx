"use client";

import { ReactElement } from "react";
import { motion } from "framer-motion";

interface WinningMeme {
  id: string;
  imageUrl: string;
  title: string;
  winningDate: string;
  votes: number;
}

export default function WinningMemes(): ReactElement {
  const winningMemes: WinningMeme[] = [
    {
      id: "1",
      imageUrl: "/memes/winner1.jpg",
      title: "Ultimate Gigachad",
      winningDate: "2024-01-20",
      votes: 42069
    },
    // Add more memes here
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-pink-500/20 shadow-[0_0_15px_rgba(219,39,119,0.3)]"
    >
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6">
        Hall of Fame 🏆
      </h2>
      <div className="space-y-6">
        {winningMemes.map((meme, index) => (
          <motion.div
            key={meme.id}
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{ delay: index * 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all border border-purple-500/20"
          >
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={meme.imageUrl}
              alt={meme.title}
              className="w-full h-48 object-cover rounded-lg mb-2 hover:shadow-[0_0_20px_rgba(219,39,119,0.4)]"
            />
            <h3 className="text-white font-semibold text-lg">{meme.title}</h3>
            <div className="flex justify-between text-gray-300 text-sm mt-2">
              <motion.span 
                whileHover={{ color: "#f472b6" }}
                className="flex items-center gap-2"
              >
                🏆 {meme.winningDate}
              </motion.span>
              <motion.span 
                whileHover={{ scale: 1.1 }}
                className="text-pink-400 font-bold"
              >
                {meme.votes.toLocaleString()} votes
              </motion.span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
