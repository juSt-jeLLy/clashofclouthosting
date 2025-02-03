"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import contractABI from "../../../server/scripts/abi.json";

interface WinningMeme {
  cid: string;
  creator: string;
  title: string;
  winningDate: string;
  score: number;
}

function isEventLog(event: any): event is ethers.EventLog {
  return (
    event &&
    typeof event.args === "object" &&
    "cid" in event.args &&
    "creator" in event.args
  );
}

export default function WinningMemes() {
  const [winningMemes, setWinningMemes] = useState<WinningMeme[]>([]);

  async function fetchWinningMemes(): Promise<WinningMeme[]> {
    const providerUrl = process.env.NEXT_PUBLIC_PROVIDER_URL;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    if (!providerUrl || !contractAddress) {
      throw new Error("Missing required environment variables");
    }

    const provider = new ethers.JsonRpcProvider(providerUrl);
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const filter = contract.filters.WinnerDeclared(); 
    const events = await contract.queryFilter(filter);

    return Promise.all(events.map(async (event) => {
      if (isEventLog(event)) {
        const totalStaked = await contract.totalStaked(event.args.cid);
        return {
          cid: event.args.cid.toString(),
          creator: event.args.creator,
          title: "",
          winningDate: new Date(event.args.timestamp * 1000).toISOString().split('T')[0],
          score: Number(ethers.formatEther(totalStaked)) // Convert from wei to ether
        };
      }
      return {
        cid: "",
        creator: "",
        title: "",
        winningDate: "",
        score: 0
      };
    }));
}
  async function getWinningMemesData(memes: WinningMeme[]): Promise<WinningMeme[]> {
    return await Promise.all(
      memes.map(async (meme) => {
        const response = await fetch(`https://ipfs.io/ipfs/${meme.cid}`);
        const data = await response.json();
        return { ...meme, ...data };
      })
    );
  }

  useEffect(() => {
    async function loadWinningMemes() {
      const memesFromContract = await fetchWinningMemes();
      const memesWithData = await getWinningMemesData(memesFromContract);
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

    // Listen for new winners
    contract.on("WinnerDeclared", (cid, winner) => {
      setWinningMemes(prevMemes => {
        const newMeme = {
          cid: cid.toString(),
          creator: winner,
          title: "",
          winningDate: new Date().toISOString().split('T')[0],
          score: 0
        };
        return [...prevMemes.slice(-2), newMeme];
      });
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
            key={meme.cid}
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{ delay: index * 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all border border-purple-500/20"
          >
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={`https://ipfs.io/ipfs/${meme.cid}`}
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
