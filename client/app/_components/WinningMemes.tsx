"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "../abi.json";
interface WinningMeme {
  id: string;
  imageUrl: string;
  title: string;
  creator: string;
  winningStakes: number;
  timestamp: number;
}

export default function WinningMemes() {
  const [winningMemes, setWinningMemes] = useState<WinningMeme[]>([]);

  async function fetchWinningMemes() {
    const providerUrl = process.env.NEXT_PUBLIC_PROVIDER_URL;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    if (!providerUrl || !contractAddress) {
      throw new Error("Missing environment variables");
    }

    const provider = new ethers.JsonRpcProvider(providerUrl);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    const filter = contract.filters.WinnerDeclared();
    const events = await contract.queryFilter(filter);

    const winningMemesData = await Promise.all(
      events.map(async (event: any) => {
        const cid = event.args.cid;
        const winner = event.args.winner;
        const block = await event.getBlock();
        
        const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
        const metadata = await response.json();

        return {
          id: cid,
          imageUrl: metadata.gif_url,
          title: metadata.meme || "Champion Meme",
          creator: winner,
          winningStakes: await contract.totalStaked(cid),
          timestamp: block.timestamp * 1000
        };
      })
    ).then(memes => memes.sort((a, b) => b.timestamp - a.timestamp));

    setWinningMemes(winningMemesData);
  }

  useEffect(() => {
    fetchWinningMemes();
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
        🏆 Hall of Fame 🏆
      </motion.h2>
      <div className="space-y-4">
        {winningMemes.map((meme, index) => (
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
                    {meme.creator.slice(0, 6)}...{meme.creator.slice(-4)}
                  </p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="text-pink-400 font-bold px-4 py-1 rounded-full bg-pink-500/10"
              >
                {ethers.formatEther(meme.winningStakes)} MTK
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
