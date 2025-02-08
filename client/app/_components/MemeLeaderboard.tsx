"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchMemes } from "../utils/fetchMemes";
import { ethers } from "ethers";
import contractABI from "../abi.json";

interface Meme {
  id: string;
  imageUrl: string;
  title: string;
  creator: string;
  score: number;
  isAvailable: boolean;
}

export default function MemeLeaderboard() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const cache: Record<string, Meme[]> = {};

  async function loadMemes() {
    if (cache["memes"]) {
      setMemes(cache["memes"]);
      return;
    }

    const providerUrl = process.env.NEXT_PUBLIC_PROVIDER_URL;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    if (!providerUrl || !contractAddress) {
      throw new Error("Missing environment variables");
    }

    const provider = new ethers.JsonRpcProvider(providerUrl);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    const memesWithStakes = await fetchMemes();

    // Get isAvailable status for each meme from contract
    const memesWithAvailability = await Promise.all(
      memesWithStakes.map(async (meme) => {
        const memeData = await contract.memes(meme.id);
        return {
          ...meme,
          isAvailable: memeData.isAvailable
        };
      })
    );

    // Filter and sort available memes
    const topMemes = memesWithAvailability
      .filter(meme => meme.isAvailable)
      .sort((a, b) => b.stakes - a.stakes)
      .slice(0, 5)
      .map((meme) => ({
        ...meme,
        score: meme.stakes,
      }));

    cache["memes"] = topMemes;
    setMemes(topMemes);
  }

  useEffect(() => {
    // Initial load
    loadMemes();

    // Set up interval (e.g., every 10 seconds)
    const interval = setInterval(() => {
      loadMemes();
    }, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

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
          duration: 2,
        }}
        className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6"
      >
        Trending Memes 👑
      </motion.h2>
      <div className="space-y-4">
        {memes.map((meme, index) => (
          <motion.div
            key={meme.id}
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            whileHover={{
              scale: 1.02,
              backgroundColor: "rgba(255,255,255,0.15)",
            }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col bg-white/5 p-4 rounded-lg border border-purple-500/10 hover:border-pink-500/30 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
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
                  <p className="text-gray-400 text-sm hover:text-purple-400 transition-colors">
                    {meme.creator?.slice(0, 6)}...{meme.creator?.slice(-4)}
                  </p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="text-pink-400 font-bold px-4 py-1 rounded-full bg-pink-500/10"
              >
                {meme.score.toLocaleString()}
              </motion.div>
            </div>
            <img
              src={meme.imageUrl}
              alt={meme.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
