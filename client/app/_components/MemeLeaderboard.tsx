"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "../../../server/scripts/abi.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;
const PROVIDER_URL = process.env.NEXT_PUBLIC_PROVIDER_URL;

// Define the Meme interface
interface Meme {
  cid: string;
  creator: string;
  title: string; // Assuming title is part of the fetched data
  score: number; // Score is required
}


// Type guard to check if an event is an EventLog
function isEventLog(event: any): event is ethers.EventLog {
  return (
    event &&
    typeof event.args === "object" &&
    "cid" in event.args &&
    "creator" in event.args
  );
}

export default function MemeLeaderboard() {
  const [memes, setMemes] = useState<Meme[]>([]);

  async function fetchMemes(): Promise<Meme[]> {
    const providerUrl = process.env.NEXT_PUBLIC_PROVIDER_URL;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  
    if (!providerUrl || !contractAddress) {
      throw new Error("Missing required environment variables");
    }

    const provider = new ethers.JsonRpcProvider(providerUrl);
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );
    const filter = contract.filters.MemeSubmitted();
    const events = await contract.queryFilter(filter);

    // Get memes with their cid and creator address
    return events.map((event) => {
      if (isEventLog(event)) {
        return {
          cid: event.args.cid.toString(),
          creator: event.args.creator,
          title: "", // Initialize title, you will need to fetch it from IPFS or another source
          score: 0, // Initialize score to 0
        };
      }
      // Handle the case where the event is not an EventLog
      console.warn("Event is not of type EventLog:", event);
      return {
        cid: "",
        creator: "",
        title: "",
        score: 0,
      };
    });
  }  async function getDataMemes(memes: Meme[]): Promise<Meme[]> {
    return await Promise.all(
      memes.map(async (meme) => {
        const { cid } = meme;
        // Fetch data from IPFS using the CID
        const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
        const data = await response.json();
        return { ...data, cid, score: meme.score }; // Ensure data contains title and score
      })
    );
  }
const cache: Record<string, Meme[]> = {};

async function loadMemes() {
  if (cache["memes"]) {
    setMemes(cache["memes"]);
    return;
  }

  const memesFromContract = await fetchMemes();
  const memesWithData = await getDataMemes(memesFromContract);
  const memesWithStakes = await Promise.all(
    memesWithData.map(async (meme) => {
      const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
      const totalStaked = await contract.totalStaked(meme.cid);
      return {
        ...meme,
        score: Number(ethers.formatEther(totalStaked)),
      };
    })
  );

  const topMemes = memesWithStakes.sort((a, b) => b.score - a.score).slice(0, 5);
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
            key={meme.cid}
            initial={{ x: -50 }}
            animate={{ x: 0 }}
            whileHover={{
              scale: 1.02,
              backgroundColor: "rgba(255,255,255,0.15)",
            }}
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
                <p className="text-gray-400 text-sm hover:text-purple-400 transition-colors">
                  {meme.creator.slice(0, 6)}...{meme.creator.slice(-4)}
                </p>
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



