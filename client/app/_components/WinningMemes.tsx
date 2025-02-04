"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import contractABI from "../../../server/scripts/abi.json";
import { fetchMemes } from "../utils/fetchMemes";

interface WinningMeme {
  id: string;
  creator: string;
  title: string;
  winningDate: string;
  score: number;
  imageUrl: string;
}

export default function WinningMemes() {
  const [winningMemes, setWinningMemes] = useState<WinningMeme[]>([]);

  async function fetchWinningMemes(): Promise<WinningMeme[]> {
    const allMemes = await fetchMemes();
    const winningMemes = allMemes.filter((meme) => meme.isWinner);

    return winningMemes.map((meme) => ({
      id: meme.id,
      creator: meme.creator,
      title: meme.title,
      winningDate: new Date().toISOString().split('T')[0], // Adjust this if you have a specific date
      score: meme.stakes,
      imageUrl: meme.imageUrl,
    }));
  }

  useEffect(() => {
    async function loadWinningMemes() {
      const memesWithData = await fetchWinningMemes();
      const lastThreeWinners = memesWithData.slice(-3).reverse();
      setWinningMemes(lastThreeWinners);
    }
    loadWinningMemes();
  }, []);

  useEffect(() => {
    const providerUrl = process.env.NEXT_PUBLIC_PROVIDER_URL;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    if (!providerUrl || !contractAddress) return;

    const provider = new ethers.JsonRpcProvider(providerUrl);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    // Increase the polling interval (e.g., 15 seconds)
    provider.pollingInterval = 15000;

    // Listen for new winners
    contract.on("WinnerDeclared", async (cid, winner) => {
      const newMeme = {
        id: cid.toString(),
        creator: winner,
        title: "",
        winningDate: new Date().toISOString().split('T')[0],
        score: 0,
        imageUrl: `https://ipfs.io/ipfs/${cid}`,
      };
      setWinningMemes((prevMemes) => [...prevMemes.slice(-2), newMeme]);
    });

    return () => {
      contract.removeAllListeners("WinnerDeclared");
    };
  }, []);

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
                {meme.score.toLocaleString()} votes
              </motion.span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
